import React, { useState, useEffect, useCallback, useMemo, useContext } from 'react';
import { Clock, CircleDollarSign, BellRing } from 'lucide-react';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import AuctionChat from './AuctionChat';
import { useAuctionSocket } from '../../config/socket';
import { formatCurrency, formatDate, formatDateTime, openNotify } from '../../commons/MethodsCommons';
import toast, { Toaster } from 'react-hot-toast';
import AuctionEndToast from '../../components/Auctions/AuctionEndToast';
import { useNavigate } from 'react-router-dom';
import productTemplate from '../../assets/productTemplate.jpg'
import { Helmet } from 'react-helmet';
import { AuctionRoomLanguage } from '../../languages/AuctionRoomLanguage';
import { AppContext } from '../../AppContext';

const formatTime = (totalSeconds, languageText) => {
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

const BidHistory = ({ bids }) => (
  <div className="space-y-3">
    {bids.map((bid, index) => (
      <div key={index} className="flex justify-between space-y-2">
        <div className='flex flex-col'>
          <span className="text-green-400">{formatCurrency(bid.bidAmount)}</span>
          <span className="text-gray-400">{formatDateTime(bid.timestamp)}</span>
        </div>
        <span className="text-yellow-400">{bid.userCode}</span>
      </div>
    ))}
  </div>
);

const QuantityControl = ({ quantity, onDecrease, onIncrease, onChange, onBlur }) => (
  <div className='flex w-fit border rounded-3xl p-1 space-x-2 border-color'>
    <button
      className="bg-gray-700 p-2 rounded-full w-8 h-8 flex items-center justify-center font-bold text-white text-2xl"
      onClick={onDecrease}
    >
      -
    </button>
    <input
      type="text"
      value={quantity}
      onChange={onChange}
      onBlur={onBlur}
      className='border-0 outline-0 text-white bg-transparent w-10 text-center'
    />
    <button
      className="bg-gray-700 p-2 rounded-full h-8 flex items-center justify-center font-bold text-white text-2xl"
      onClick={onIncrease}
    >
      +
    </button>
  </div>
);

const AuctionRoom = () => {
  const { roomId } = useParams();
const {language } = useContext(AppContext)
  // State Management
  const [connected, setConnected] = useState(false);
  const [roomInfo, setRoomInfo] = useState(null);
  const [productInfo, setProductInfo] = useState(null);
  const [disable, setDisable] = useState(false);
  const [currentBid, setCurrentBid] = useState(0);
  const [bidAmount, setBidAmount] = useState();
  const [timeLeft, setTimeLeft] = useState();
  const [quantity, setQuantity] = useState(1);
  const [totalBidAmount, setTotalBidAmount] = useState(bidAmount * quantity);
  const [bidHistory, setBidHistory] = useState([]);
const languageText = useMemo(() => AuctionRoomLanguage[language], [language])
  // Socket Connection
  const handleBidUpdate = useCallback((data) => {
    setCurrentBid(data.currentBid);
    setBidHistory(prev => [{
      userId: data.userId,
      userCode: data.userCode,
      bidAmount: data.currentBid,
      timestamp: data.timestamp
    }, ...prev]);

    openNotify({ userCode: data.userCode, currentBid: data.currentBid })
  }, []);
  const openNotify = (data) => {
    toast(`${data.userCode} ${languageText.justBid} ${formatCurrency(data.currentBid)}`, {
      icon: <BellRing size={22} color="yellow" fontWeight={800} />,
      style: {
         marginLeft: "100px",
        borderRadius: '10px',
        background: '#000116',
        color: '#fff',
        padding: '20px',
        border: '1px solid blue',
        boxShadow: '0 4px 15px rgba(0, 255, 255, 0.3)', // Hiệu ứng shadow đẹp
        transition: 'all 0.3s ease', // Hiệu ứng chuyển đổi mượt
        whiteSpace: "normal", // Cho phép xuống dòng nếu cần thiết
        width: "auto",
    minWidth:"400px"
      },
      className: 'glass-effect neon-border animate-toast mr-[100px]', // Thêm class animation
      // autoClose: 5000, // Tự động đóng sau 5 giây
    });
  }
  const handleRoomJoin = useCallback((data) => {
    const roomData = JSON.parse(data.roomInfo.auction);
    const productData = roomData.product;
    setRoomInfo(roomData);
    setProductInfo(productData);
    setCurrentBid(data.bidHistory?.length > 0 ? parseFloat(data.roomInfo.currentBid) : roomData.startingPrice);
    setBidHistory(data.bidHistory || []);
    setBidAmount(roomData.bidIncrement);
    setConnected(true);

    // Calculate initial time left
    const endTime = new Date(roomData.endTime);
    const now = new Date();
    const timeLeftInSeconds = Math.max(0, Math.floor((endTime - now) / 1000));
    setTimeLeft(timeLeftInSeconds);
  });

  const showAuctionEndToast = (winnerData) => {
    const handleDismissToast = () => {
      return toast.dismiss('auction-end-toast')
    }
    setDisable(true)
    toast.custom(
      (t) => (
        <AuctionEndToast
          winner={winnerData.winner || null}
          bidAmount={winnerData.winningBid || ""}
          dismissToast={handleDismissToast}
        />
      ),
      {

        position: 'top-center',
        className: 'relative z-50',
        id: 'auction-end-toast',
        duration: 5000
      }
    );
  };

  const { isConnected, auctionData, error, placeBid } = useAuctionSocket(roomId, {
    onBidUpdate: handleBidUpdate,
    onRoomJoined: handleRoomJoin,
    onRoomEnd: showAuctionEndToast,
  });

  // Event Handlers
  const handlePlaceBid = () => placeBid(totalBidAmount);

  const handleQuantityChange = {
    decrease: () => setQuantity((prev) => (prev > 1 ? prev - 1 : prev)),
    increase: () => setQuantity((prev) => (!isNaN(prev) ? prev + 1 : 1)),
    input: (e) => setQuantity(parseInt(e.target.value, 10) || 0),
    blur: () => setQuantity((prev) => (prev <= 0 || isNaN(prev) ? 1 : prev))
  };

  // Effects
  useEffect(() => {
    setTotalBidAmount(currentBid + (bidAmount * quantity));
  }, [quantity, bidAmount, currentBid]);

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => {
      clearInterval(timer)
      toast.dismiss('auction-end-toast');
      toast.remove('auction-end-toast');
    };
  }, []);

  // Error Handling
  if (!roomId) {
    openNotify('error', 'Room not found');
    return <Navigate to="/" />;
  }

  return (
    <div className={`flex h-screen bg-[#000116] text-white w-full`}>
      <Helmet>
        <title>{languageText.countdownTitle}</title>
        <meta property="og:title" content={languageText.countdownTitle} />
        <meta property="og:description" content={languageText.countdownTitle} />
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

      {disable && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10 flex items-center justify-center">
        </div>
      )}

      <div className="flex-1 flex flex-col items-center justify-start pt-8 relative bg-auctionroom w-1/2 h-full">
        <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-1 text-base soft-pulse">
          {languageText.live}
        </div>

        <div className='mt-[15%]'>
          <div className='bg-[#000116] border-2 border-white p-4 mb-6'>
            <h2 className="text-red-500 text-base font-semibold mb-2 text-center tracking-[0.5rem]">
              {languageText.countdownTitle}
            </h2>
            <div className="p-2 text-red-500 text-5xl font-bold flex justify-center items-center space-x-4">
              {formatTime(timeLeft, languageText).map((unit, index) => (
                <React.Fragment key={unit.label}>
                  {index > 0 && <div>:</div>}
                  <div>
                    {unit.value} <span className="text-sm">{unit.label}</span>
                  </div>
                </React.Fragment>
              ))}
            </div>
          </div>

          <div className=' h-48 w-48 justify-center m-auto'>
            <img
              src={productInfo?.images[0] || productTemplate}
              className='w-full h-full object-cover rounded-md'
            />
          </div>
        </div>

        <AuctionChat roomId={roomId} />
      </div>

      <div className="w-[45%] flex flex-col p-2 items-end ml-auto items-center justify-center">
        {/* <h2 className='text-center my-4 flex mx-auto text-xl'>
          {languageText.auctioneer}: &nbsp;<b>{roomInfo?.auctioneer || languageText.noAuctioneer}</b>
        </h2> */}

        {/* Bid History */}
        <div className="bg-[#00082C] py-6 px-6 mb-4 rounded-md w-full overflow-y-auto max-h-[350px] no-scrollbar">
          <h2 className="text-xl mb-4 flex items-center">
            <Clock className="mr-2" />
            {languageText.bidHistory}
          </h2>
          <BidHistory bids={bidHistory} />
        </div>

        {/* Bidding Controls */}
        <div className="bg-[#00082C] py-2 px-6 rounded-md w-full">
          <div className="flex justify-between items-center mb-4 border-b border-color p-4">
            <h2 className="text-xl flex">
              <CircleDollarSign className='mr-2' /> {languageText.currentBid}
            </h2>
            <div className="text-2xl font-bold text-green-400">
              {formatCurrency(currentBid)}
            </div>
          </div>

          <div className="flex items-center space-x-2 mb-6 justify-between items-center">
            <div>
              <span className='text-base'>{languageText.bidStep}:</span> &nbsp;
              <span className="bg-transparent p-2 px-4 rounded w-32 text-right border border-color rounded-3xl outline-0">
                {formatCurrency(bidAmount)}
              </span>
            </div>
            <span className='font-bold text-3xl'>x</span>

            <QuantityControl
              quantity={quantity}
              onDecrease={handleQuantityChange.decrease}
              onIncrease={handleQuantityChange.increase}
              onChange={handleQuantityChange.input}
              onBlur={handleQuantityChange.blur}
            />

            <span className='font-bold text-3xl'>=</span>
            <span className='border p-2 px-4 border-color rounded-3xl'>
              {formatCurrency(totalBidAmount)}
            </span>
          </div>

          <button
            className="w-full bg-blue-600 text-white py-3 rounded-full font-bold text-lg"
            onClick={handlePlaceBid}
            disabled={timeLeft <= 0}
          >
            {languageText.placeBid} {formatCurrency(totalBidAmount)}
          </button>

          <div className="text-center text-sm mt-2 text-gray-400">
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuctionRoom;