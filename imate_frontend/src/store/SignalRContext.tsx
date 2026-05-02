import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState
} from 'react';
import type { ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';
import { toast } from 'react-toastify';
import apiClient from '@/services/apiClient';
import { useQueryClient } from '@tanstack/react-query';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export type NotificationPayload = {
  id: number;
  message: string;
  isRead: boolean;
  createdAt?: string;
  link?: string;
  type?: string;
  [key: string]: unknown;
};

interface SignalRContextState {
  connection: signalR.HubConnection | null;
  notifications: NotificationPayload[];
  unreadCount: number;
  balance: number | null;
  aiCredit: number | null;
  markNotificationAsRead: (notificationId: number) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
}

const SignalRContext = createContext<SignalRContextState>({
  connection: null,
  notifications: [],
  unreadCount: 0,
  balance: null,
  aiCredit: null,
  markNotificationAsRead: async () => {},
  markAllNotificationsAsRead: async () => {},
});

export const useSignalR = () => useContext(SignalRContext);

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [systemConnection, setSystemConnection] = useState<signalR.HubConnection | null>(null);
  const [balanceConnection, setBalanceConnection] = useState<signalR.HubConnection | null>(null);

  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [aiCredit, setAiCredit] = useState<number | null>(null);

  const { isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const token = localStorage.getItem("authToken");

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  // URL cho hai Hub - ĐÃ SỬA ĐÚNG
  const systemNotificationHubUrl = `${API_BASE_URL}/systemNotificationHub`;
  const balanceHubUrl = `${API_BASE_URL}/balanceHub`;
  // ==================== FETCH INITIAL NOTIFICATIONS ====================
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (!isAuthenticated) return;

      try {
        const response = await apiClient.get('/notifications/my-notifications');
        const data = response.data;

        if (Array.isArray(data)) {
          setNotifications(data);
        } else if (data && typeof data === 'object') {
          const nested = (data as any).data ?? (data as any).items ?? [];
          setNotifications(Array.isArray(nested) ? nested : []);
        }
      } catch (error) {
        console.error("SignalR: Failed to fetch initial notifications:", error);
      }
    };

    fetchInitialNotifications();
  }, [isAuthenticated]);

  // ==================== SYSTEM NOTIFICATION HUB ====================
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(systemNotificationHubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    setSystemConnection(conn);

    conn.start()
      .then(() => {
      })
      .catch((err) => {
        console.error('❌ SystemNotificationHub start error:', err);
      });

    conn.on('ReceiveNotification', (payload: NotificationPayload) => {
      setNotifications((prev) => [payload, ...prev]);

      if (payload.link && payload.type === 'AI_INTERVIEW_RESULT_READY') {
        toast.success(payload.message || 'Kết quả phỏng vấn đã sẵn sàng!');
      } else {
        toast.info(payload.message || 'Bạn có thông báo mới!');
      }
    });

    return () => {
      conn.stop().catch(() => {});
    };
  }, [isAuthenticated, token, systemNotificationHubUrl]);

  // ==================== BALANCE HUB ====================
  useEffect(() => {
    if (!isAuthenticated || !token) return;

    const conn = new signalR.HubConnectionBuilder()
      .withUrl(balanceHubUrl, {
        accessTokenFactory: () => token,
        transport: signalR.HttpTransportType.LongPolling
      })
      .withAutomaticReconnect()
      .build();

    setBalanceConnection(conn);

    conn.start()
      .then(() => {
      })
      .catch((err) => {
        console.error('❌ BalanceHub start error:', err);
      });

    // Listen balance updates
    conn.on('BalanceUpdated', (data: { imCoinBalance: number }) => {
      setBalance(data.imCoinBalance);
      queryClient.invalidateQueries({ queryKey: ['user'] });
    });

    conn.on('AiCreditUpdated', (data: { aiCredit: number }) => {
      setAiCredit(data.aiCredit);
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    });

    conn.on('BalanceAndAiCreditUpdated', (data: { imCoinBalance: number; aiCredit: number }) => {
      setBalance(data.imCoinBalance);
      setAiCredit(data.aiCredit);
      queryClient.invalidateQueries({ queryKey: ['user'] });
      queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
    });

    return () => {
      conn.stop().catch(() => {});
    };
  }, [isAuthenticated, token, balanceHubUrl, queryClient]);

  // Cleanup khi component unmount
  useEffect(() => {
    return () => {
      if (systemConnection) systemConnection.stop();
      if (balanceConnection) balanceConnection.stop();
    };
  }, [systemConnection, balanceConnection]);

  const markNotificationAsRead = async (notificationId: number) => {
    if (!systemConnection || systemConnection.state !== signalR.HubConnectionState.Connected) return;

    const target = notifications.find((n) => n.id === notificationId);
    if (!target || target.isRead) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, isRead: true } : n))
    );

    try {
      await systemConnection.invoke('MarkNotificationAsRead', notificationId.toString());
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!systemConnection || systemConnection.state !== signalR.HubConnectionState.Connected) return;

    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));

    try {
      await systemConnection.invoke('MarkAllNotificationsAsRead');
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  return (
    <SignalRContext.Provider
      value={{
        connection: systemConnection,
        notifications,
        unreadCount,
        balance,
        aiCredit,
        markNotificationAsRead,
        markAllNotificationsAsRead,
      }}
    >
      {children}
    </SignalRContext.Provider>
  );
};