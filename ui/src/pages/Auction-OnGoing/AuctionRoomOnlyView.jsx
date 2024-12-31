import React, { useState, useEffect, useMemo } from 'react'
import { Hammer, Play, Bell } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { useAuctionSocket } from '../../config/socket';
import { formatCurrency, formatDateTime, maskCustomerCode, openNotify } from '../../commons/MethodsCommons';
import LoadingSpinner from '../LoadingSpinner';
import toast, { Toaster } from 'react-hot-toast';
import { BellRing } from 'lucide-react';
import AuctionEndToast from '../../components/Auctions/AuctionEndToast';
import productTemplate from '../../assets/productTemplate.jpg'
import { Helmet } from 'react-helmet';
import { useContext } from 'react';
import { AppContext } from '../../AppContext';
import { AuctionRoomLanguage } from '../../languages/AuctionRoomLanguage';
//Read only
const AuctionRoomOnlyView = () => {
  const { roomId } = useParams();

  // State Management
  const [connected, setConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [currentBid, setCurrentBid] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [bidHistory, setBidHistory] = useState([]);
  const [disable, setDisable] = useState(false);
  const {language } = useContext(AppContext)
  const languageText = useMemo(() => AuctionRoomLanguage[language], [language])
  // Socket Connection
  const { isConnected, auctionData, error } = useAuctionSocket(roomId, {
    onBidUpdate: (data) => {
      setCurrentBid(data.currentBid);
      setBidHistory(prev => [{
        userId: data.userId,
        userCode: data.userCode,
        bidAmount: data.currentBid,
        timestamp: data.timestamp
      }, ...prev]);
      openNotify({ userCode: data.userCode, currentBid: data.currentBid })

    },
    onRoomJoined: (data) => {
      const roomData = JSON.parse(data.roomInfo.auction);
      const productData = roomData.product;
      setRoomInfo(roomData);
      setProductInfo(productData);
      setCurrentBid(data.bidHistory?.length > 0 ? parseFloat(data.roomInfo.currentBid) : roomData.startingPrice);
      setBidHistory(data.bidHistory || []);
      setConnected(true);

      // Calculate initial time left
      const endTime = new Date(roomData.endTime);
      const now = new Date();
      const timeLeftInSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
      setTimeLeft(timeLeftInSeconds);
    },
    onRoomEnd: (data) => {
      const handleDismissToast = () => {
        return toast.dismiss('auction-end-toast')
      }
      setDisable(true)
      toast.custom(
        (t) => (
          <AuctionEndToast
            winner={maskCustomerCode(data.winner) || null}
            bidAmount={data?.winningBid || 512300000}
            dismissToast={handleDismissToast}
          />
        ),
        {
          position: 'top-center',
          className: 'relative z-50',
          id: 'auction-end-toast',
          duration: 3000
        }
      );
    },
  });

  // Effects
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Error Handling
  if (!roomId) {
    openNotify('error', 'Room not found');
    return null;
  }
  const formatTime = (totalSeconds) => {
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const timeUnits = [
      { value: days, label: languageText.day },
      { value: hours, label: languageText.hour },
      { value: minutes, label: languageText.minute },
      { value: seconds, label: languageText.second }
    ];

    // Lọc ra các đơn vị thời gian > 0, bắt đầu từ đơn vị lớn nhất
    const significantUnits = timeUnits.reduce((acc, unit, index) => {
      if (unit.value > 0 || index === timeUnits.length - 1 || acc.length > 0) {
        acc.push({
          value: unit.value.toString().padStart(2, '0'),
          label: unit.label
        });
      }
      return acc;
    }, []);

    return significantUnits;
  };
  const openNotify = (data) => {
    toast(`${maskCustomerCode(data.userCode || "****")} ${languageText.justBid} ${formatCurrency(data.currentBid)}`,
      {
        icon: <BellRing size={22} color='yellow' fontWeight={800} />,
        style: {
          borderRadius: '10px',
          background: '#ff00de',
          color: '#fff',
          padding: '10px',

        },
        className: 'glass-effect neon-border'
      }
    );
  }

  if (!connected || !roomInfo) return <LoadingSpinner />;
  return <>
    <Helmet>
      <title>Ongoing</title>
      <meta property="og:title" content="Ongoing" />
      <meta property="og:description" content="Ongoing" />
    </Helmet>
    <Toaster
      position="top-center"
      toastOptions={{
        duration: Infinity,
        style: {
          background: 'transparent',
          boxShadow: 'none'
        }
      }}
    />
    <div className='w-full min-h-screen bg-gradient-to-br from-[#02003F] via-purple-900 to-indigo-900 text-white flex flex-col'>
      <style jsx>{`
        @keyframes neon-pulse {
          0%, 100% { box-shadow: 0 0 5px #ff00de, 0 0 10px #ff00de, 0 0 20px #ff00de; }
          50% { box-shadow: 0 0 10px #ff00de, 0 0 20px #ff00de, 0 0 40px #ff00de; }
        }
        .neon-border {
          animation: neon-pulse 1.5s infinite alternate;
        }
        .glass-effect {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }
      `}</style>
      <header className='w-full p-4 flex justify-between items-center border-b border-indigo-600'>
        {disable && (
          <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
          </div>
        )}
        <Link to="/" className="text-xl font-semibold flex items-center text-white hover:text-pink-400 transition-colors duration-300">
          <Hammer className='mr-2' />
          <span className="bg-gradient-to-r from-orange-400 to-pink-500 text-transparent bg-clip-text">Auction House</span>
        </Link>
        <div className='flex items-center'>
          <Play size={35} className='p-2 text-white rounded-full bg-gradient-to-r from-orange-400 to-pink-500 mr-2' />
          <h2 className='text-lg font-bold bg-gradient-to-r from-orange-400 to-pink-500 uppercase text-white py-2 px-8 rounded-full '>
            Trực tiếp đấu giá
          </h2>
        </div>
      </header>

      <main className='flex-grow py-8 px-10'>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 w-full">
          <div className="space-y-6">
            <div className="glass-effect rounded-2xl p-8 flex flex-col items-center neon-border">
              <div className="glass-effect rounded-2xl p-6 text-center mb-4 bg-[#170B5E]">
                <h2 className="text-white text-base font-semibold mb-2 text-center tracking-[0.5rem] ">{ languageText.countdownTitle}</h2>
                <div className="text-4xl font-bold text-white tracking-[0.3rem] flex items-center justify-center ">
                  {formatTime(timeLeft).map((unit, index) => (
                    <React.Fragment key={unit.label}>
                      {index > 0 && <div>:</div>}
                      <div>
                        {unit.value} <span className="text-sm">{unit.label}</span>
                      </div>
                    </React.Fragment>
                  ))}
                </div>
              </div>
              <img
                 src={productInfo?.images[0] || productTemplate}
                className='w-48 h-48 hover:scale-105 transform  transition-transform duration-300  shadow-2xl object-cover  rounded'
              />
            </div>
          </div>

          <div className="glass-effect rounded-2xl p-6 neon-border">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center">
                <Bell className="w-8 h-8 mr-3 text-yellow-400" />
                <span className="text-2xl font-bold text-pink-300">{ languageText.bidHistory}</span>
              </div>
              <div className="text-2xl font-bold text-green-400">+{formatCurrency(currentBid)}</div>
            </div>
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 no-scrollbar">
              {bidHistory.map((bid, index) => (
                <div key={index} className="flex justify-between items-center text-sm p-3 rounded-xl bg-gradient-to-r from-purple-800 to-indigo-800 hover:from-purple-700 hover:to-indigo-700 transition-all duration-300">
                  <div className="font-bold text-green-400">{formatCurrency(bid.bidAmount)}</div>
                  <div className="text-pink-300">{formatDateTime(bid.timestamp)}</div>
                  <div className="text-blue-300">{maskCustomerCode(bid.userCode || "")}</div>
                </div>
              ))}
            </div>
            <div className="text-3xl mt-4 text-center">
              { languageText.currentBid}: <br />
              <span className="text-5xl font-bold bg-gradient-to-r from-green-400 to-blue-500 text-transparent bg-clip-text">
                {formatCurrency(currentBid)}
              </span>
            </div>
          </div>
        </div>
      </main>

      <footer className="h-16 w-full bgfooter_auctionroom overflow-hidden mb-4">
        <div className="h-full w-full rounded-t-2xl flex items-center justify-between px-6">
          <div className="w-full relative">
            <div className="text-lg font-bold text-white whitespace-nowrap animate-marquee">
              SẢN PHẨM ĐẤU GIÁ NGÀY {new Date().toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" })}:
              <span className="ml-2">{productInfo.productName}</span>
              <span className="ml-10 text-lg font-bold text-pink-300">
                Đăng ký đấu giá ngay tại ACTIONHOUSE.COM.VN
              </span>
            </div>
          </div>
        </div>
      </footer>


    </div>
  </>


}

export default AuctionRoomOnlyView