import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trophy, Home, Timer } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

const AuctionEndToast = ({ winner, bidAmount, dismissToast }) => {
  const [countdown, setCountdown] = useState(5);
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          toast.dismiss('auction-end-toast');
          toast.remove('auction-end-toast');
          dismissToast();
          navigate('/');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="z-50 mt-10 flex flex-col items-center bg-gradient-to-br from-blue-900 to-indigo-900 text-white p-6 rounded-lg shadow-2xl border border-blue-400 min-w-[320px] animate-in fade-in duration-500 px-20 py-10">
      <div className="relative mb-4">
        <Trophy className="w-12 h-12 text-yellow-400 animate-bounce" />
      </div>

      <h2 className="text-2xl font-bold mb-2 text-center bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
        Phiên đấu giá đã kết thúc!
      </h2>

      {!!winner ? (
        <div className="flex flex-col items-center space-y-2 mb-4">
          <p className="text-gray-200">Người chiến thắng</p>
          <p className="text-yellow-400 font-bold text-lg animate-pulse">{winner}</p>
          <p className="text-green-400 font-bold">
            {new Intl.NumberFormat('vi-VN', {
              style: 'currency',
              currency: 'VND'
            }).format(bidAmount)}
          </p>
        </div>
      )
        :
        (
          <div>
            <p className="text-gray-200">Không có người chiến thắng cho cuộc đấu giá này.</p>
          </div>
        )}

      <div className="flex items-center justify-center space-x-2 text-sm text-gray-300 bg-blue-950/50 px-8 py-3 rounded-full">
        <Home className="w-4 h-4" />
        <span>Quay về trang chủ trong</span>
        <div className="flex items-center bg-blue-800/80 px-2 py-1 rounded-full">
          <Timer className="w-4 h-4 mr-1 animate-spin-slow" />
          <span className="font-mono font-bold px-1">{countdown}s</span>
        </div>
      </div>
    </div>
  );
};
export default AuctionEndToast