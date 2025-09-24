import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage } from '../types';
import { WS_CONFIG } from '../constants';

type CloseHandler = () => void;

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const queueRef = useRef<string[]>([]);
  const reconnectTimerRef = useRef<number | null>(null);
  const manualCloseRef = useRef(false);
  const cleanupRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    if (!url || url.startsWith("ws://invalid")) {
      setOpen(false);
      return;
    }

    manualCloseRef.current = false;
    let ws: WebSocket | null = null;

    const cleanupSocket = (instance: WebSocket | null, handlers?: { open: () => void; close: CloseHandler; message: (event: MessageEvent) => void; error: CloseHandler; }) => {
      if (!instance) return;
      if (handlers) {
        instance.removeEventListener("open", handlers.open);
        instance.removeEventListener("message", handlers.message);
        instance.removeEventListener("close", handlers.close);
        instance.removeEventListener("error", handlers.error);
      }
      try {
        instance.close();
      } catch (error) {
        console.warn('Error closing WebSocket:', error);
      }
    };

    const scheduleReconnect = () => {
      if (manualCloseRef.current) return;
      if (reconnectTimerRef.current) window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = window.setTimeout(() => {
        connect();
      }, WS_CONFIG.RECONNECT_TIMEOUT);
    };

    const connect = () => {
      if (manualCloseRef.current) return;
      cleanupRef.current?.();
      ws = new WebSocket(url);
      wsRef.current = ws;

      const onOpen = () => {
        setOpen(true);
        if (reconnectTimerRef.current) {
          window.clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
        while (queueRef.current.length) {
          try {
            ws?.send(queueRef.current.shift()!);
          } catch (error) {
            console.warn('Error sending queued message:', error);
            break;
          }
        }
      };

      const onClose: CloseHandler = () => {
        setOpen(false);
        scheduleReconnect();
      };

      const onMessage = (event: MessageEvent) => {
        try {
          const message = JSON.parse(event.data);
          setMessages(prev => [...prev, message]);
        } catch (error) {
          console.warn('Failed to parse WebSocket message:', error);
        }
      };

      const handlers = { open: onOpen, close: onClose, message: onMessage, error: onClose };

      ws.addEventListener("open", onOpen);
      ws.addEventListener("message", onMessage);
      ws.addEventListener("close", onClose);
      ws.addEventListener("error", onClose);

      cleanupRef.current = () => cleanupSocket(ws, handlers);
    };

    connect();

    return () => {
      manualCloseRef.current = true;
      if (reconnectTimerRef.current) {
        window.clearTimeout(reconnectTimerRef.current);
        reconnectTimerRef.current = null;
      }
      cleanupRef.current?.();
      cleanupRef.current = null;
      wsRef.current = null;
      setOpen(false);
    };
  }, [url]);

  const send = (data: any) => {
    const payload = JSON.stringify(data);
    const ws = wsRef.current;
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(payload);
    } else {
      queueRef.current.push(payload);
    }
  };

  const clearQueue = () => {
    queueRef.current = [];
  };

  const close = () => {
    manualCloseRef.current = true;
    if (reconnectTimerRef.current) {
      window.clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    cleanupRef.current?.();
    cleanupRef.current = null;
    try {
      wsRef.current?.close();
    } catch (error) {
      console.warn('Error closing WebSocket:', error);
    }
    wsRef.current = null;
    setOpen(false);
  };

  return { open, send, messages, wsRef, clearQueue, close };
}

export function waitForOpen(
  wsRef: React.MutableRefObject<WebSocket | null>,
  callback: () => void,
  maxTries = WS_CONFIG.RECONNECT_ATTEMPTS
) {
  let tries = 0;
  const interval = setInterval(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      clearInterval(interval);
      callback();
    } else if (++tries >= maxTries) {
      clearInterval(interval);
    }
  }, 150);
}

