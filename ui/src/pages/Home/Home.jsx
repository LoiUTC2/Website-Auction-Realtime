import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react'
import Banner from '../../components/Home/Banner'
import { Filter, SortAsc } from 'lucide-react';
import ProductItem from '../../components/Product/ProductItem';
import productTemplate from '../../assets/productTemplate.jpg'
import AuctionService from '../../services/AuctionService';
import auctionMeta from '../../assets/auctionMeta.png'
import { countdown, formatCurrency, formatDate } from '../../commons/MethodsCommons';
import LoadingSpinner from '../LoadingSpinner';
import { AUCTION_STATUS, REGISTER_STATUS } from '../../commons/Constant';
import { AppContext } from '../../AppContext';
import { Helmet } from 'react-helmet';
import { HomeLanguage } from '../../languages/HomeLanguage';
const Home = () => {
    const [auctions, setAuctions] = useState([]);
    const [auctionStanding, setAuctionStanding] = useState(null);
    const [auctionsDone, setAuctionsDone] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [timeRemaining, setTimeRemaining] = useState('');
    const { user, toggleLoginModal, language } = useContext(AppContext);
    const languageText = useMemo(() => HomeLanguage[language], [language]);

    const fetchData = useCallback(async () => {
        try {
            setIsLoading(true);
            const [auctionList, standingAuction, completedAuctions] = await Promise.all([
                AuctionService.getList({ limit: 4, page: 1, status: AUCTION_STATUS.APPROVED }),
                AuctionService.getOutstanding({ limit: 4, page: 1, status: AUCTION_STATUS.APPROVED }),
                AuctionService.getList({ limit: 4, page: 1, status: AUCTION_STATUS.DONE })
            ]);

            setAuctions(auctionList.docs);
            setAuctionStanding(standingAuction);
            setAuctionsDone(completedAuctions.docs);
        } catch (error) {
            console.error("Error fetching auction data:", error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const updateCountdown = useCallback(() => {
        if (auctionStanding) {
            setTimeRemaining(countdown(auctionStanding.startTime));
        }
    }, [auctionStanding]);

    useEffect(() => {
        updateCountdown();
        const timer = setInterval(updateCountdown, 1000);
        return () => clearInterval(timer);
    }, [updateCountdown]);

    if (isLoading) return <LoadingSpinner />;
    const auctionDetailHightLight = auctionStanding?.[0];
    let auctionDetailRegisterStatus = null;
    if (!!auctionDetailHightLight) {
        if (auctionDetailHightLight.registrationCloseDate && new Date() > new Date(auctionDetailHightLight.registrationCloseDate)) {
            auctionDetailRegisterStatus = REGISTER_STATUS.EXPIRED;
        } else if (user && auctionDetailRegisterStatus.registeredUsers?.includes(user.userId)) {
            auctionDetailRegisterStatus = REGISTER_STATUS.REGISTERED;
        } else {
            auctionDetailRegisterStatus = REGISTER_STATUS.NOT_REGISTERED;
        }
    }
    return (
        <div className=' relative mx-auto'>
            <Helmet>
                <title>Auction House</title>
                <meta name="description" content="Mô tả ngắn về trang chủ" />
                <meta property="og:title" content="Trang Chủ" />
                <meta property="og:description" content="Trang Chủ" />
                <meta property="og:image" content={auctionMeta} />
            </Helmet>
            <div className='w-full h-auto flex justify-center container mx-auto '>
                <Banner auctionStanding={auctionStanding} languageText={ languageText} />
            </div>
            <section className="py-12 ">
                <div className=" mx-auto px-4 container">
                    <div className="flex justify-between items-center mb-8">
                        <h2 className="text-2xl font-bold">{languageText.featuredProducts}</h2>
                        <div className="flex space-x-4">
                            <button className="flex items-center space-x-2  hover:text-gray-900 border border-[#E6E6E6] py-1.5 px-2 rounded">
                                <Filter size={18} />
                                <span className='text-medium text-sm'>{languageText.filters}</span>
                            </button>
                            <button className="flex items-center space-x-2  hover:text-gray-900 border border-[#E6E6E6] py-1.5 px-2 rounded">
                                <SortAsc size={20} />
                                <span className='text-medium text-sm'>{languageText.sort}</span>
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {auctions && auctions?.map((product) => (
                            <ProductItem
                                key={product.id}
                                image={product?.productImages[0] ?? null}
                                name={product.productName}
                                slug={product.slug}
                                productDescription={product.productDescription}
                                price={product.startingPrice}
                                currentViews={product.viewCount || 0}
                                endsIn={product.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000)} //Thời gian còn lại để đăng ký
                                registeredUsers={product?.registeredUsers?.map(item=>item?.customer).filter(Boolean) || []}
                                registrationCloseDate={product.registrationCloseDate}
                                registrationOpenDate={product.registrationOpenDate}
                                language={language}
                            />
                        ))}
                    </div>
                </div>
            </section>

            {
                auctionDetailHightLight && (
                    <section className="bg-muted py-12">
                        <div className="container mx-auto px-4 md:px-6">
                            <h2 className="text-2xl font-bold mb-6">{languageText.productDetails}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="h-[400px] sm:h-[500px] md:h-[600px] lg:h-[650px]">
                                    <img
                                        src={auctionDetailHightLight?.productImages[0] || productTemplate}
                                        alt="Product Image"
                                        className="w-full h-full rounded-lg object-cover"
                                        style={{ aspectRatio: "1 / 1" }}
                                    />
                                </div>
                                <div className="my-auto">
                                    <h3 className="text-2xl font-bold mb-4">{auctionDetailHightLight.productName}</h3>
                                    <p className="text-muted-foreground mb-6">
                                        {auctionDetailHightLight.productDescription}
                                    </p>
                                    <div className="flex items-center justify-between mb-6">
                                        <div>
                                            <p className="text-muted-foreground">{languageText.timeRemaining}:</p>
                                            <p className="text-2xl font-bold">{countdown(timeRemaining)}</p>
                                        </div>
                                        <div>
                                            <p className="text-muted-foreground">{languageText.currentBid}:</p>
                                            <p className="text-2xl font-bold">{formatCurrency(auctionDetailHightLight.startingPrice)}</p>
                                        </div>
                                    </div>
                                    <button
                                        size="lg"
                                        className={`w-full inline-flex items-center justify-center text-sm font-medium bg-primary h-11 rounded-md px-8 text-white 
                ${auctionDetailRegisterStatus === REGISTER_STATUS.REGISTERED || auctionDetailRegisterStatus === REGISTER_STATUS.EXPIRED ? 'opacity-50 cursor-not-allowed' : ''}`}
                                        // onClick={handleSubmit}
                                        disabled={auctionDetailRegisterStatus === REGISTER_STATUS.REGISTERED || auctionDetailRegisterStatus === REGISTER_STATUS.EXPIRED}
                                    >
                                        {auctionDetailRegisterStatus === REGISTER_STATUS.EXPIRED ? languageText.registrationClosed :
                                            auctionDetailRegisterStatus === REGISTER_STATUS.REGISTERED ? languageText.alreadyRegistered :
                                                languageText.placeBid}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </section>
                )
            }
            <section className="py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-2xl font-bold mb-6">{languageText.soldFor}</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {
                            auctionsDone?.map(item => (
                                <div className="bg-background rounded-lg shadow-lg overflow-hidden">
                                    <img
                                        src={item.productImages[0] || productTemplate}
                                        alt="Sold Item "
                                        width={400}
                                        height={300}
                                        className="w-full h-48 object-cover"
                                        style={{ aspectRatio: "400/300", objectFit: "contain" }}
                                    />
                                    <div className="p-4">
                                        <h3 className="text-xl font-bold mb-2">{item.productName}</h3>
                                        <p className="text-muted-foreground mb-4">Sold for {formatCurrency(item.winningPrice)} on {formatDate(item.endTime)}</p>
                                    </div>
                                </div>
                            ))
                        }
                    </div>
                </div>
            </section>
            <section className="bg-muted py-12">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-2xl font-bold mb-6">{languageText.aboutAuctionHouse}</h2>
                    <p className="text-muted-foreground mb-6">
                        {languageText.auctionDescription}
                    </p>
                    <div className="flex justify-center">
                        <button size="lg" className='w-fit inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-primary h-11 rounded-md px-8 text-white'> {languageText.exploreCollection}</button>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
