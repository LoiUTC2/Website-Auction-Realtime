import React, { useEffect, useState, useMemo, useCallback, useContext } from 'react'
import Breadcrumb from '../../components/BreadCrumb/BreadCrumb'
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs'
import 'react-tabs/style/react-tabs.css'
import ProductItem from '../../components/Product/ProductItem'
import ImageGallery from "react-image-gallery"
import AuctionService from '../../services/AuctionService'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { formatCurrency, formatDate, openNotify } from '../../commons/MethodsCommons'
import LoadingSpinner from '../LoadingSpinner'
import RegistrationSteps from './RegistrationSteps';
import { AppContext } from '../../AppContext';
import productTemplate from '../../assets/productTemplate.jpg';
import { REGISTER_STATUS } from '../../commons/Constant'
import { message } from 'antd'
import { Helmet } from 'react-helmet'
import { ProductLanguage } from '../../languages/ProductLanguage'

const ProductDetail = () => {
    const { slug } = useParams()
    const { user, toggleLoginModal,language } = useContext(AppContext)
    const [auction, setAuction] = useState(null)
    const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 })
    const [auctionRelate, setAuctionRelate] = useState([]);
    const [isRegistrationModalVisible, setIsRegistrationModalVisible] = useState(false);
    const [registerStatus, setRegisterStatus] = useState(REGISTER_STATUS.NOT_ALLOW);
    const languageText = useMemo(() => ProductLanguage[language], [language])
    const navigate = useNavigate();
    useEffect(() => {
        const fetchData = async () => {
            try {

                const auctionData = await AuctionService.getDetail(slug);
                const auctionList = await AuctionService.getList({
                    limit: 4,
                    page: 1,
                    // status:'active'
                });

                setAuction(auctionData);
                if (auctionData.registrationCloseDate && new Date() > new Date(auctionData.registrationCloseDate)) {
                    setRegisterStatus(REGISTER_STATUS.EXPIRED);
                }  else if (new Date() < new Date(auctionData?.registrationOpenDate)) {
                  setRegisterStatus(REGISTER_STATUS.NOT_ALLOW);
              }else if (user && auctionData.registeredUsers?.includes(user.userId)) {
                    setRegisterStatus(REGISTER_STATUS.REGISTERED);
                } else {
                    setRegisterStatus(REGISTER_STATUS.NOT_REGISTERED);
                }
                setAuctionRelate(auctionList)
            } catch (error) {
                console.error('Error fetching auction data:', error)
            }
        }

        if (slug) {
            fetchData()
        }
    }, [slug])

    const calculateTimeLeft = useCallback((startTime) => {
        const now = new Date()
        const targetDate = new Date(startTime)
        const difference = targetDate - now;
      //reset button
        if (now < new Date(auction?.registrationOpenDate)) {
            setRegisterStatus(REGISTER_STATUS.NOT_ALLOW)
        } else if (now == new Date(auction?.registrationOpenDate)) {
            setRegisterStatus(REGISTER_STATUS.ALLOW)
        } else if (now > new Date(auction?.registrationCloseDate)) {
            setRegisterStatus(REGISTER_STATUS.EXPIRED)
        }

        if (difference > 0) {
            const days = Math.floor(difference / (1000 * 60 * 60 * 24))
            const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
            const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
            const seconds = Math.floor((difference % (1000 * 60)) / 1000)

            setTimeLeft({ days, hours, minutes, seconds })
        } else if (difference === 0) {
            setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
            message('Phiên đấu giá đã bắt đầu');
            navigate('/auctions/ongoing'); // Điều hướng đến trang ongoing
        } else {
            openNotify('error', 'Không tìm thấy dữ liệu');
            navigate('/auctions/upcoming'); // Điều hướng đến trang upcoming
        }
    }, []);

    useEffect(() => {
        if (auction) {
            const interval = setInterval(() => calculateTimeLeft(auction.startTime), 1000)
            return () => clearInterval(interval)
        }
    }, [auction, calculateTimeLeft])

    const images = auction?.productImages.map(item => ({
        original: item,
        thumbnail: item,
    })) || [productTemplate]

    if (!auction) {
        return <LoadingSpinner />
    }
    const handleRegister = () => {
        if (!user)
            toggleLoginModal(true);
        else {
            setIsRegistrationModalVisible(true)
        }
    }
    if (new Date() == new Date())
    {

    }
    const handleCallback = (callbackType,value) => {
        switch (callbackType) {
            case "RegisterSuccess":
                setRegisterStatus(REGISTER_STATUS.REGISTERED)
                break;
        
            default:
                break;
        }
  }
  console.log(registerStatus)
    return !!auction && (
        <div>
          <Helmet>
            <title>{auction ? auction.title : 'Auction detail'}</title>
            <meta property="og:title" content={auction ? auction.title : 'Auction detail'} />
            <meta property="og:description" content={auction ? auction.title : 'Auction detail'} />
          </Helmet>
    
          <Breadcrumb
            items={[
              { label: languageText.home, href: "/" },
              { label: languageText.productDetail, href: null },
            ]}
            title={languageText.pageTitle}
          />
    
          <section className="px-6">
            <div className="grid md:grid-cols-2 gap-6 lg:gap-6 items-start container px-4 mx-auto py-6 flex-1">
              <div className="grid gap-4 md:gap-10 items-start h-[90vh] relative image-gallery-wrapper">
                <ImageGallery
                  items={images}
                  showNav={false}
                  showPlayButton={false}
                />
              </div>
    
              <div className="grid gap-4 md:gap-10 items-start">
                <div className="grid gap-2">
                  <h3 className="text-muted-foreground text-base">{languageText.countdownTitle}</h3>
                  <div className="border border-[#E6E6E6] p-[15px] shadow-md">
                    <div className="mb-2.5">
                      <div id="timestamp" className="flex justify-around">
                        <div id="day-div-count ">
                          <p id="days" className="timecount-style mb-0 text-center font-semibold text-xl">
                            {String(timeLeft.days).padStart(2, '0')}
                          </p>
                          <p className="time-description mb-0 text-center uppercase text-sm">Ngày</p>
                        </div>
                        <div>
                          <p id="hours" className="timecount-style mb-0 text-center font-semibold text-xl">
                            {String(timeLeft.hours).padStart(2, '0')}
                          </p>
                          <p className="time-description mb-0 text-center uppercase text-sm">Giờ</p>
                        </div>
                        <div>
                          <p id="minutes" className="timecount-style mb-0 text-center font-semibold text-xl">
                            {String(timeLeft.minutes).padStart(2, '0')}
                          </p>
                          <p className="time-description mb-0 text-center uppercase text-sm">Phút</p>
                        </div>
                        <div>
                          <p id="seconds" className="timecount-style mb-0 text-center font-semibold text-xl">
                            {String(timeLeft.seconds).padStart(2, '0')}
                          </p>
                          <p className="time-description mb-0 text-center uppercase text-sm">Giây</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
    
                <div className="border border-[#E6E6E6] p-[15px] grid gap-6 rounded py-8">
                  <div className="">
                    <div className="grid gap-4">
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.startingBid}</span>
                        <div className="text-primary font-bold text-2xl">{formatCurrency(auction.startingPrice)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.assetId}</span>
                        <div className="font-semibold">{auction._id}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.registrationOpen}</span>
                        <div className="font-semibold">{formatDate(auction.registrationOpenDate)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.registrationClose}</span>
                        <div className="font-semibold">{formatDate(auction.registrationCloseDate)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.auctionStart}</span>
                        <div className="font-semibold">{formatDate(auction.startTime)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.auctionEnd}</span>
                        <div className="font-semibold">{formatDate(auction.endTime)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.registrationFee}</span>
                        <div className="font-semibold">{formatCurrency(auction.registrationFee)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.bidIncrement}</span>
                        <div className="font-semibold">{formatCurrency(auction.bidIncrement)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.deposit}</span>
                        <div className="font-semibold">{formatCurrency(auction.deposit)}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.auctionType}</span>
                        <div className="font-semibold">Online</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.assetOwner}</span>
                        <div className="font-semibold">{auction.sellerName}</div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">{languageText.assetViewingLocation}</span>
                        <div className="font-semibold">{auction.productAddress}</div>
                      </div>
                    </div>
                  </div>
    
                  <button
                    size="lg"
                    className={`w-full inline-flex items-center justify-center whitespace-nowrap text-sm font-medium
                              ${registerStatus === REGISTER_STATUS.EXPIRED || registerStatus == REGISTER_STATUS.NOT_ALLOW ? 'bg-gray-400 cursor-not-allowed' :
                              registerStatus === REGISTER_STATUS.REGISTERED ? 'bg-green-500 cursor-not-allowed' :
                              'bg-primary'}
                              h-11 rounded-md px-8 text-white`}
                    onClick={handleRegister}
                    disabled={registerStatus === REGISTER_STATUS.EXPIRED
                              || registerStatus === REGISTER_STATUS.REGISTERED
                              || registerStatus == REGISTER_STATUS.NOT_ALLOW}
                  >
                    {registerStatus === REGISTER_STATUS.REGISTERED ? languageText.alreadyRegistered :
                     registerStatus === REGISTER_STATUS.EXPIRED ? languageText.registrationExpired :
                     languageText.registerForAuction}
                  </button>
                </div>
              </div>
            </div>
          </section>
    
          <section className="px-6 mt-10 mb-4">
            <div className="container w-full mx-auto mt-8">
              <Tabs>
                <TabList className="flex space-x-4">
                  <Tab selectedClassName="bg-primary text-white" className="px-4 py-2 border rounded cursor-pointer">{languageText.productDescription}</Tab>
                  <Tab selectedClassName="bg-primary text-white" className="px-4 py-2 border rounded cursor-pointer">{languageText.auctionOrganization}</Tab>
                  <Tab selectedClassName="bg-primary text-white" className="px-4 py-2 border rounded cursor-pointer">{languageText.relatedDocuments}</Tab>
                </TabList>
    
                <TabPanel>
                  <div className="p-4 border mt-4">
                    <h2>{languageText.assetDescription}</h2>
                    <p>{languageText.productName}: {auction.productName}</p>
                    <p>{languageText.productCondition}: {auction.condition}</p>
                    <p>{languageText.productDescription}: {auction.productDescription}</p>
                  </div>
                </TabPanel>
    
                <TabPanel>
                  <div className="p-4 border mt-4">
                    <h2 className="text-lg font-bold">{languageText.auctionOrganization}</h2>
                    <p><span className="font-bold">{languageText.auctionCompany}: </span> <span className="text-red-600">Công ty đấu giá hợp danh Lạc Việt</span></p>
                    <p><span className="font-bold">{languageText.auctioneer}: </span> <span className="text-red-600">Nguyễn Thùy Giang</span></p>
                    <p><span className="font-bold">{languageText.address}: </span> Số 49 Văn Cao, phường Liễu Giai, quận Ba Đình, TP. Hà Nội.</p>
                  </div>
                </TabPanel>
    
                <TabPanel>
                  <div className="p-4 border mt-4">
                    <h2>{languageText.relatedDocuments}</h2>
                    <p>{languageText.relatedDocumentsContent}</p>
                  </div>
                </TabPanel>
              </Tabs>
            </div>
          </section>
    
          <section className="py-12 mt-10 px-6">
            <div className="container mx-auto">
              <h2 className="text-2xl font-bold mb-4">{languageText.latestNews}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {auctionRelate?.length > 0 && auctionRelate.map((product, index) => (
                  <ProductItem
                    key={product.id}
                    image={product.image}
                    name={product.productName}
                    slug={product.slug}
                    productDescription={product.productDescription}
                    price={product.startingPrice}
                    currentViews={product.currentViews || 1}
                    endsIn={product.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000)} // Default time for registration
                    registeredUsers={product.registeredUsers}
                    registrationCloseDate={product.registrationCloseDate}
                    registrationOpenDate={product.registrationOpenDate}
                  />
                ))}
              </div>
            </div>
          </section>
    
          {/* Registration Form Modal */}
          {isRegistrationModalVisible && (
            <RegistrationSteps
              auction={auction}
              onClose={() => setIsRegistrationModalVisible(false)}
              userId={user.userId}
              callback={handleCallback}
            />
          )}
        </div>
      );
}

export default React.memo(ProductDetail)