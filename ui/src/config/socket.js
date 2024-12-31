import { useEffect, useState, useCallback, useRef } from 'react';
import io from 'socket.io-client';
import { openNotify } from '../commons/MethodsCommons';
import { useNavigate } from 'react-router-dom';

const SOCKET_SERVER_URL = process.env.REACT_APP_API_URL;

export const useAuctionSocket = (
  auctionId,
  {
    onBidUpdate,
    onRoomJoined,
    onGetMessage,
    onNewMessage,
    onRoomEnd,
  } = {}
) => {
  const socketRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [auctionData, setAuctionData] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const navigate = useNavigate();

  useEffect(() => {
    // Ngắt kết nối socket cũ nếu tồn tại
    if (socketRef.current) {
      socketRef.current.disconnect();
    }

    const connectToSocket = () => {
      setIsConnecting(true);

      const newSocket = io(SOCKET_SERVER_URL, {
        auth: { token },
      });

      socketRef.current = newSocket;

      const handleConnect = () => {
        setIsConnected(true);
        setIsConnecting(false);
        console.log('Connected to socket server');
      };

      const handleDisconnect = () => {
        setIsConnected(false);
        setIsConnecting(false);
        console.log('Disconnected from socket server');
        // Tự động reconnect sau 5 giây
        setTimeout(connectToSocket, 5000);
      };

      const handleError = (errorMessage) => {
        console.error('Socket error:', errorMessage.message);
        setError(errorMessage.message);

        if (errorMessage.message === 'Authentication error') {
          console.log('Authentication failed. Waiting for new token.');
        }
      };

      const handleNewToken = ({ token }) => {
        debugger
        console.log('Received new token:', token);
        localStorage.setItem('token', token);
        setToken(token);

        if (socketRef.current) {
          socketRef.current.auth.token = token;
          socketRef.current.disconnect();
          socketRef.current.connect();
        }
      };

      newSocket.on('connect', handleConnect);
      newSocket.on('disconnect', handleDisconnect);
      newSocket.on('error', handleError);
      newSocket.on('newToken', handleNewToken);

      return () => {
        newSocket.off('connect', handleConnect);
        newSocket.off('disconnect', handleDisconnect);
        newSocket.off('error', handleError);
        newSocket.off('newToken', handleNewToken);
        newSocket.disconnect();
      };
    };

    connectToSocket();
  }, [token]); // Kết nối lại khi token thay đổi

  // Xử lý sự kiện liên quan đến phòng đấu giá
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !auctionId) return;

    const handleSessionExpire = () => {
      localStorage.removeItem('token');
      openNotify('error', 'Session expired. Please log in again.');
      navigate('/');
    };

    const handleRoomJoined = (data) => {
      if (onRoomJoined) onRoomJoined(data);
    };

    const handleBidUpdate = (data) => {
      setCurrentBid(parseFloat(data.currentBid));
      if (onBidUpdate) onBidUpdate(data);
    };

    const handleAuctionEnd = (data) => {
      if (onRoomEnd) onRoomEnd(data);
    };

    const handleGetMessage = (data) => {
      if (onGetMessage) onGetMessage(data);
    };

    const handleNewMessage = (data) => {
      if (onNewMessage) onNewMessage(data);
    };

    // Tham gia phòng đấu giá
    if (socket.connected) {
      socket.emit('joinAuctionRoom', auctionId);
    } else {
      socket.once('connect', () => {
        socket.emit('joinAuctionRoom', auctionId);
      });
    }

    socket.on('sessionExpire', handleSessionExpire);
    socket.on('roomJoined', handleRoomJoined);
    socket.on('bidUpdated', handleBidUpdate);
    socket.on('auctionEnd', handleAuctionEnd);
    socket.on('chat-history', handleGetMessage);
    socket.on('new-message', handleNewMessage);

    return () => {
      socket.off('sessionExpire', handleSessionExpire);
      socket.off('roomJoined', handleRoomJoined);
      socket.off('bidUpdated', handleBidUpdate);
      socket.off('auctionEnd', handleAuctionEnd);
      socket.off('chat-history', handleGetMessage);
      socket.off('new-message', handleNewMessage);
    };
  }, [auctionId]);

  // Xử lý lỗi hiển thị thông báo
  useEffect(() => {
    if (error) {
      openNotify('error', error);
      setError(null);
    }
  }, [error]);

  // Đặt giá
  const placeBid = useCallback(
    (amount) => {
      if (socketRef.current) {
        socketRef.current.emit('placeBid', {
          roomId: auctionId,
          bidAmount: amount,
          token,
        });
      }
    },
    [auctionId, token]
  );

  // Lấy lịch sử chat đấu giá
  const getHistoryChat = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.emit('get-chat-history', {
        roomId: auctionId,
        token,
      });
    }
  }, [auctionId, token]);

  // Gửi tin nhắn chat đấu giá
  const sendChat = useCallback(
    (message) => {
      if (socketRef.current) {
        socketRef.current.emit('send-message', {
          roomId: auctionId,
          message,
          token,
        });
      }
    },
    [auctionId, token]
  );

  return {
    isConnected,
    isConnecting,
    auctionData,
    currentBid,
    error,
    placeBid,
    sendChat,
    getHistoryChat,
  };
};
