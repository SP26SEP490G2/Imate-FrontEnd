import { useEffect, useRef, useState } from "react";
import * as signalR from "@microsoft/signalr";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface UseInterviewSessionLockResult {
  /** true = session bị block (tab khác đang dùng) */
  isBlocked: boolean;
  /** Thông báo lỗi khi bị block */
  blockMessage: string | null;
  /** true = đang kết nối SignalR */
  isConnecting: boolean;
}

/**
 * Hook quản lý session phỏng vấn qua SignalR.
 * Khi mount: kết nối → JoinSession. Nếu session đã active ở tab khác → block.
 * Khi unmount: LeaveSession → cleanup.
 */
export function useInterviewSessionLock(sessionId: number): UseInterviewSessionLockResult {
  const [isBlocked, setIsBlocked] = useState(false);
  const [blockMessage, setBlockMessage] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(true);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const sessionIdRef = useRef(sessionId);

  useEffect(() => {
    sessionIdRef.current = sessionId;
    if (!sessionId || sessionId <= 0) {
      setIsConnecting(false);
      return;
    }

    const token = localStorage.getItem("authToken");
    if (!token) {
      setIsConnecting(false);
      return;
    }

    const hubUrl = `${API_BASE_URL}/interviewSessionHub`;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Lắng nghe events từ hub
    connection.on("SessionJoined", (_sid: number) => {
      console.log(`[InterviewLock] Joined session ${_sid} successfully`);
      setIsBlocked(false);
      setBlockMessage(null);
      setIsConnecting(false);
    });

    connection.on("SessionAlreadyActive", (_sid: number, message: string) => {
      console.warn(`[InterviewLock] Session ${_sid} blocked: ${message}`);
      setIsBlocked(true);
      setBlockMessage(message);
      setIsConnecting(false);
    });

    connection.on("SessionLeft", (_sid: number) => {
      console.log(`[InterviewLock] Left session ${_sid}`);
    });

    // Reconnect handler: re-join session sau khi reconnect
    connection.onreconnected(() => {
      console.log("[InterviewLock] Reconnected, re-joining session...");
      connection.invoke("JoinSession", sessionIdRef.current).catch(console.error);
    });

    // Bắt đầu kết nối
    connection
      .start()
      .then(() => {
        console.log("[InterviewLock] SignalR connected, joining session...");
        return connection.invoke("JoinSession", sessionId);
      })
      .catch((err) => {
        console.error("[InterviewLock] Connection error:", err);
        setIsConnecting(false);
        // Không block nếu SignalR lỗi → fallback cho user dùng bình thường
      });

    // Cleanup khi unmount (rời trang, đóng tab)
    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection
          .invoke("LeaveSession", sessionIdRef.current)
          .catch(() => {})
          .finally(() => connection.stop());
      } else {
        connection.stop();
      }
      connectionRef.current = null;
    };
  }, [sessionId]);

  return { isBlocked, blockMessage, isConnecting };
}
