import { useCallback, useEffect, useRef, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080";
const WS_URL = BASE_URL.replace(/^http/, "ws") + "/ws";

export interface WSMessage<T = unknown> {
  type: string;
  payload?: T;
}

const RECONNECT_DELAY_MS = 3_000;

export function useWebSocket(topics: string[]) {
  const [lastMessage, setLastMessage] = useState<WSMessage | null>(null);
  const [connected, setConnected]     = useState(false);
  const wsRef      = useRef<WebSocket | null>(null);
  const timerRef   = useRef<ReturnType<typeof setTimeout> | null>(null);
  const topicsRef  = useRef(topics);
  topicsRef.current = topics;

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) return;

    const ws = new WebSocket(WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      setConnected(true);
      ws.send(JSON.stringify({ type: "subscribe", topics: topicsRef.current }));
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data as string) as WSMessage;
        if (msg.type !== "connected") setLastMessage(msg);
      } catch { /* ignore */ }
    };

    ws.onclose = () => {
      setConnected(false);
      timerRef.current = setTimeout(connect, RECONNECT_DELAY_MS);
    };

    ws.onerror = () => ws.close();
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { lastMessage, connected };
}
