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

export type BalanceUpdatePayload = {
  imCoinBalance?: number;
  aiCredit?: number;
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
  markNotificationAsRead: async () => { },
  markAllNotificationsAsRead: async () => { },
});

export const useSignalR = () => useContext(SignalRContext);

interface SignalRProviderProps {
  children: ReactNode;
}

export const SignalRProvider: React.FC<SignalRProviderProps> = ({ children }) => {
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [notifications, setNotifications] = useState<NotificationPayload[]>([]);
  const [balance, setBalance] = useState<number | null>(null);
  const [aiCredit, setAiCredit] = useState<number | null>(null);
  const queryClient = useQueryClient();

  const { isAuthenticated } = useAuth();
  const systemNotificationHubUrl = `${API_BASE_URL}/systemNotificationHub`;
  const balanceHubUrl = `${API_BASE_URL}/balanceHub`;

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.isRead).length,
    [notifications]
  );

  const extractNotificationList = (payload: unknown): NotificationPayload[] => {
    if (Array.isArray(payload)) {
      return payload as NotificationPayload[];
    }

    if (payload && typeof payload === 'object') {
      const objectPayload = payload as Record<string, unknown>;
      const nested = objectPayload.data ?? objectPayload.items ?? objectPayload.Data ?? objectPayload.Items;
      if (Array.isArray(nested)) {
        return nested as NotificationPayload[];
      }
    }

    return [];
  };

  const markNotificationAsRead = async (notificationId: number) => {
    const target = notifications.find((notification) => notification.id === notificationId);
    if (!target || target.isRead) {
      return;
    }

    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );

    try {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('MarkNotificationAsRead', notificationId.toString());
      } else {
        console.warn("SignalR: Cannot mark notification as read. Hub is not connected.");
      }
    } catch (error) {
      console.error('SignalR: Failed to mark notification as read:', error);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (notifications.every((notification) => notification.isRead)) {
      return;
    }

    setNotifications((prev) => prev.map((notification) => ({ ...notification, isRead: true })));

    try {
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        await connection.invoke('MarkAllNotificationsAsRead');
      } else {
        console.warn("SignalR: Cannot mark all as read. Hub is not connected.");
      }
    } catch (error) {
      console.error('SignalR: Failed to mark all notifications as read:', error);
    }
  };

  // EFFECT 1: Fetch initial notifications
  useEffect(() => {
    const fetchInitialNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await apiClient.get<NotificationPayload[] | { data?: NotificationPayload[]; items?: NotificationPayload[] }>('/notifications/my-notifications');
          setNotifications(extractNotificationList(response.data));
          console.log('SignalR: Fetched initial notifications.');
        } catch (error) {
          console.error("SignalR: Failed to fetch initial notifications:", error);
        }
      }
    };

    fetchInitialNotifications();
  }, [isAuthenticated]);

  // EFFECT 2: Setup SystemNotification Hub (existing notifications)
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log('SignalR: User authenticated but no token found.');
        return;
      }

      const newConnection = new signalR.HubConnectionBuilder()
        .withUrl(systemNotificationHubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      setConnection(newConnection);

      newConnection.start()
        .then(() => {
          console.log('SignalR SystemNotification Hub Connected.');

          newConnection.on('ReceiveNotification', (payload: NotificationPayload) => {
            console.log('SignalR: New notification received:', payload);

            setNotifications((prevNotifications) => [payload, ...prevNotifications]);

            if (payload.link && payload.type === 'AI_INTERVIEW_RESULT_READY') {
              toast.success(payload.message || 'Kết quả phỏng vấn đã sẵn sàng!', {
                style: { fontWeight: 'normal' },
                className: 'toast-normal-weight'
              });
            } else {
              toast.info(payload.message || 'Bạn có thông báo mới!');
            }
          });
        })
        .catch((err) => console.error('SignalR SystemNotification Connection Error: ', err));

      return () => {
        console.log('Stopping SignalR SystemNotification Hub connection...');
        newConnection.stop();
      };
    }
  }, [isAuthenticated]);

  // EFFECT 3: Setup BalanceHub for real-time balance/AI credit updates
  useEffect(() => {
    if (isAuthenticated) {
      const token = localStorage.getItem("authToken");
      if (!token) {
        console.log('SignalR BalanceHub: User authenticated but no token found.');
        return;
      }

      const balanceConnection = new signalR.HubConnectionBuilder()
        .withUrl(balanceHubUrl, { accessTokenFactory: () => token })
        .withAutomaticReconnect()
        .build();

      balanceConnection.start()
        .then(() => {
          console.log('SignalR BalanceHub Connected.');

          // Listen for balance updates (ImCoin)
          balanceConnection.on('BalanceUpdated', (data: { imCoinBalance: number }) => {
            setBalance(data.imCoinBalance);
            queryClient.invalidateQueries({ queryKey: ['user'] });
          });

          // Listen for AI credit updates
          balanceConnection.on('AiCreditUpdated', (data: { aiCredit: number }) => {
            console.log('[v0] AiCreditUpdated received:', data);
            setAiCredit(data.aiCredit);
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
          });

          // Listen for both balance and AI credit updates
          balanceConnection.on('BalanceAndAiCreditUpdated', (data: { imCoinBalance: number; aiCredit: number }) => {
            console.log('[v0] BalanceAndAiCreditUpdated received:', data);
            setBalance(data.imCoinBalance);
            setAiCredit(data.aiCredit);
          
            queryClient.invalidateQueries({ queryKey: ['user'] });
            queryClient.invalidateQueries({ queryKey: ['current-subscription'] });
          });

          balanceConnection.on('Connected', (data: { message: string }) => {
            console.log('[v0] BalanceHub Connected confirmation:', data);
          });
        })
        .catch((err) => console.error('SignalR BalanceHub Connection Error: ', err));

      return () => {
        balanceConnection.stop();
      };
    }
  }, [isAuthenticated, queryClient]);

  return (
    <SignalRContext.Provider
      value={{
        connection,
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