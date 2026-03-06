import Cookies from 'js-cookie';
import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

export const useSocket = () => {
  const socketRef = useRef<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const token = Cookies.get('token') || '';

  useEffect(() => {
    if (!socketRef.current) {
      socketRef.current = io(
        import.meta.env.VITE_SOCKET_URL || 'http://localhost:4012',
        {
          // Connection options
          transports: ['websocket', 'polling'], // Try WebSocket first, fallback to polling
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          timeout: 10000, // Connection timeout
          auth: {
            token: token ? `Bearer ${token}` : null,
          },
          withCredentials: true,
        },
      );

      // Connection event handlers
      socketRef.current.on('connect', () => {
        setIsConnected(true);
        setError(null);
        console.log('Socket connected:', socketRef.current?.id);
      });

      socketRef.current.on('disconnect', (reason) => {
        setIsConnected(false);
        console.log('Socket disconnected:', reason);
      });

      socketRef.current.on('connect_error', (err) => {
        setError(err);
        setIsConnected(false);
        console.error('Connection error:', err);
      });
    }

    // Cleanup function
    return () => {
      if (socketRef.current) {
        socketRef.current.removeAllListeners();
        socketRef.current.close();
        socketRef.current = null;
      }
    };
  }, []);

  return { socket: socketRef.current, isConnected, error };
};
