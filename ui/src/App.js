import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './pages/Home/Home';
import Upcomming from './pages/Upcomming/Upcomming';
import ProductDetail from './pages/ProductDetail/ProductDetail';
import SellProduct from './pages/SellProduct/SellProduct';
import AuctioningPage from './pages/AuctioningPage/AuctioningPage';
import AboutPage from './pages/About/AboutPage';
import NotFound from './pages/NotFound';
import ContactPage from './pages/Contact/ContactPage';
import { Toaster } from 'react-hot-toast';
import ProfilePage from './pages/Profile/ProfilePage';
import ChangePassword from './pages/Profile/ChangePasswordPage';
import PrivateRoute from './PrivateRoute';
import AuctionRoom from './pages/Auction-OnGoing/AuctionRoom';
import CheckAuctionAccess from './pages/Auction-OnGoing/CheckAuctionAccess';
import AuctionConfirmation from './pages/AuctionConfirmation/AuctionConfirmation';
import AuctionSubmissions from './pages/AuctionSubmissions/AuctionSubmissions';
import NotificationsPage from './pages/Notifications/NotificationsPage';
function App() {
  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<Home />} /> {/* Homepage */}
          <Route path="/auctions">
            <Route path="upcoming" element={<Upcomming />} /> {/* Danh sách sản phẩm đấu giá sắp tới */}
            <Route path="ongoing" element={<AuctioningPage />} /> {/* Danh sách phòng đang đấu giá hiện tại */}
            <Route path=":slug" element={<ProductDetail />} /> {/* Chi tiết sản phẩm */}
            <Route path="sell" element={<SellProduct />} /> {/* Đăng ký đấu giá sản phẩm */}
          </Route>

          <Route path="/about" element={<AboutPage />} /> {/* Về chúng tôi */}
          <Route path="/contact" element={<ContactPage />} /> {/* Về chúng tôi */}

          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfilePage />} /> {/* Thông tin cá nhân */}
            <Route path="/notifications" element={<NotificationsPage />} /> {/* Notify */}
            <Route path="/profile/change-password" element={<ChangePassword />} /> {/* Đổi mật khẩu */}
            <Route path="/auction-submissions" element={<AuctionSubmissions />} /> {/* Lịch sử gửi tài sản đấu giá */}
          </Route>
        </Route>

        {/* Routes without Layout. Cho page room đấu giá SP */}
        <Route path="auctions/room/:roomId" element={
          <CheckAuctionAccess>
            < AuctionRoom />
          </CheckAuctionAccess>
        }
        />
        {/* Confirm thanh toán sản phẩm */}
        <Route path="/auction/confirmation/:token" element={
            < AuctionConfirmation />
        }
        />

        {/* 404 Not Found Route */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
