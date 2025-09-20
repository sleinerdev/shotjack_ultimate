import { useEffect, useRef, useState } from 'react';
import type { WebSocketMessage } from '../types';
import { WS_CONFIG } from '../constants';

export function useWebSocket(url: string) {
  const wsRef = useRef<WebSocket | null>(null);
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<WebSocketMessage[]>([]);
  const queueRef = useRef<string[]>([]);

  useEffect(() => {
    if (!url || url.startsWith("ws://invalid")) return;

    const ws = new WebSocket(url);
    wsRef.current = ws;

    const onOpen = () => {
      setOpen(true);
      // Flush the queue when connection opens
      while (queueRef.current.length) {
        try {
          ws.send(queueRef.current.shift()!);
        } catch (error) {
          console.warn('Error sending queued message:', error);
          break;
        }
      }
    };
    const onClose = () => setOpen(false);
    const onMessage = (event: MessageEvent) => {
      try {
        const message = JSON.parse(event.data);
        setMessages(prev => [...prev, message]);
      } catch (error) {
        console.warn('Failed to parse WebSocket message:', error);
      }
    };

    ws.addEventListener("open", onOpen);
    ws.addEventListener("message", onMessage);
    ws.addEventListener("close", onClose);
    ws.addEventListener("error", onClose);

    return () => {
      ws.removeEventListener("open", onOpen);
      ws.removeEventListener("message", onMessage);
      ws.removeEventListener("close", onClose);
      ws.removeEventListener("error", onClose);
      try {
        ws.close();
      } catch (error) {
        console.warn('Error closing WebSocket:', error);
      }
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

  return { open, send, messages, wsRef, clearQueue };
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

