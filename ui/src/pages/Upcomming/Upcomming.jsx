import React, { useContext, useEffect, useMemo, useState } from 'react'
import Breadcrumb from '../../components/BreadCrumb/BreadCrumb'
import ProductItem from '../../components/Product/ProductItem';
import logo from '../../assets/logo192.png';
import { CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import AuctionService from '../../services/AuctionService';
import LoadingSpinner from '../LoadingSpinner';
import { countdown, formatCurrency } from '../../commons/MethodsCommons';
import { Helmet } from 'react-helmet';
import { AUCTION_STATUS } from '../../commons/Constant';
import { UpcommingLanguage } from '../../languages/UpcommingLanguage';
import { AppContext } from '../../AppContext';
const Upcomming = () => {
    const buttonSelect = "bg-primary text-white ";
    const [loading, setLoading] = useState(false);
    const [auctions, setAuctions] = useState([]);
    const [auctionHighlight, setAuctionHighlight] = useState([]);
    const [searchOptions, setSearchOptions] = useState({
        limit: 8,
        page: 1,
        status: AUCTION_STATUS.APPROVED
    });
    const [totalPages, setTotalPages] = useState(1);
    const { language } = useContext(AppContext);
    const languageText = useMemo(() => UpcommingLanguage[language], [language]);
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true)
            const auctionList = await AuctionService.getList(searchOptions);
            const auctionHighlight = await AuctionService.getOutstanding({ limit: 4, page: 1, status: AUCTION_STATUS.APPROVED });
            if (auctionList && auctionHighlight) {
                setAuctions(auctionList.docs);
                setAuctionHighlight(auctionHighlight[0]);
                setTotalPages(auctionList.total);
            }
        };
        fetchData();
        setLoading(false)
    }, [searchOptions]);

    const handlePreviousPage = () => {
        setSearchOptions((prev) => ({
            ...prev,
            page: Math.max(prev.page - 1, 1),
        }));
    };

    const handleNextPage = () => {
        setSearchOptions((prev) => ({
            ...prev,
            page: Math.min(prev.page + 1, totalPages),  // Không vượt quá tổng số trang
        }));
    };
    if (loading)
        return <LoadingSpinner />
    return (
        <div>
            <Helmet>
                <title>{languageText.upcoming}</title>
                <meta property="og:title" content={languageText.upcoming} />
                <meta property="og:description" content={languageText.upcoming} />
            </Helmet>
            <Breadcrumb
                items={[
                    { label: languageText.home, href: "/" },
                    { label: languageText.upcoming, href: null },
                ]}
                title={languageText.upcoming}
            />
            <section className='container mx-auto mt-6 px-6'>
                <h1 className="text-3xl font-bold mb-6">{languageText.upcoming}</h1>
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <button variant="outline" size="sm" className={`${buttonSelect} p-2 rounded-md font-medium`}>
                            {languageText.upcoming}
                        </button>
                        <button variant="outline" size="sm" className={` p-2 bg-[#F3F4F5] rounded`}>
                            {languageText.completed}
                        </button>
                        <button variant="outline" size="sm" className={` p-2 bg-[#F3F4F5] rounded`}>
                            {languageText.featured}
                        </button>
                    </div>
                    <input type="search" placeholder={languageText.searchPlaceholder} className="pl-8 pr-2 py-2 border rounded-md outline-none text-sm" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {auctions && auctions?.map((product) => (
                        <ProductItem
                            key={product.id}
                            image={product?.productImages[0] ?? null}
                            name={product.productName}
                            slug={product.slug}
                            productDescription={product.productDescription}
                            price={product.startingPrice}
                            currentViews={product.viewCount || 1}
                            endsIn={product.startTime || new Date(Date.now() + 24 * 60 * 60 * 1000)} //Thời gian còn lại để đăng ký
                            registeredUsers={product.registeredUsers}
                            registrationCloseDate={product.registrationCloseDate}
                            registrationOpenDate={product.registrationOpenDate}
                        />
                    ))}
                    {auctions?.length === 0 && (
                        <h3>{languageText.noAuctions}</h3>
                    )}
                </div>
                <div className="flex justify-center mt-6">
                    <button
                        className="flex p-2 hover:bg-[#F3F4F5] rounded items-center font-medium"
                        onClick={handlePreviousPage}
                        disabled={searchOptions.page === 1}
                    >
                        <ChevronLeft /> &nbsp;{languageText.previous}
                    </button>
                    <button
                        className="ml-1 flex p-2 hover:bg-[#F3F4F5] rounded items-center font-medium"
                        onClick={handleNextPage}
                        disabled={searchOptions.page === totalPages}
                    >
                        {languageText.next} &nbsp;<ChevronRight />
                    </button>
                </div>
            </section>

            {auctionHighlight && <section className="bg-muted py-12 mt-10 px-6">
                <div className="container mx-auto px-4 md:px-6">
                    <h2 className="text-2xl font-bold mb-6">{languageText.productDetails}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className='h-[600px]'>
                            <img
                                src="/placeholder.svg"
                                alt="Product Image"
                                width={600}
                                height={600}
                                className="w-full rounded-lg"
                                style={{ aspectRatio: "600/600", objectFit: "cover" }}
                            />
                        </div>
                        <div>
                            <h3 className="text-2xl font-bold mb-4">{auctionHighlight.productName}</h3>
                            <p className="text-muted-foreground mb-6">
                                {auctionHighlight.productDescription}
                            </p>
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <p className="text-muted-foreground">Time Remaining:</p>
                                    <p className="text-2xl font-bold">{countdown(auctionHighlight?.startTime)}</p>
                                </div>
                                <div>
                                    <p className="text-muted-foreground">Current Bid:</p>
                                    <p className="text-2xl font-bold">{formatCurrency(auctionHighlight?.startingPrice)}</p>
                                </div>
                            </div>
                            <button size="lg" className="w-full inline-flex items-center justify-center whitespace-nowrap text-sm font-medium bg-primary h-11 rounded-md px-8 text-white">
                                {languageText.placeBid}
                            </button>
                        </div>
                    </div>
                </div>
            </section>}

            <section className="py-12 mt-10 px-6">
                <div className="container mx-auto">
                    <h2 className="text-2xl font-bold">{languageText.relatedAssets}</h2>
                    <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-6 mt-6">
                        {[
                            {
                                title: "Auction Industry Trends",
                                description: "Exploring the latest developments and insights in the world of auctions.",
                                date: "September 1, 2024",
                                href: "/auction-trends",
                                image: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT5mPgF1lStvLtPNxk1PGC5wZ9QT4SkOiGwTw&s",
                            },
                            {
                                title: "Bidding Strategies for Success",
                                description: "Learn effective bidding tactics to improve your chances of winning auctions.",
                                date: "October 15, 2024",
                                href: "/bidding-strategies",
                                image: "https://propscience.s3.ap-south-1.amazonaws.com/backoffice_blogs/master_stories_auction%201.jpg"
                            },
                            {
                                title: "Top Auction Categories of 2024",
                                description: "Discover the most popular auction categories and what’s driving their demand.",
                                date: "November 5, 2024",
                                href: "/top-categories-2024",
                                image: "https://jaro-website.s3.ap-south-1.amazonaws.com/2024/04/Common-Auction-Types.jpg"
                            },
                            {
                                title: "How to Spot Rare Collectibles",
                                description: "Tips and tricks to identify valuable and rare items in auctions.",
                                date: "December 10, 2024",
                                href: "/spot-rare-collectibles",
                                image: "https://fastercapital.com/i/Betting-on-Favorites--How-Tips-Spread-Can-Help-You-Win--Understanding-the-Role-of-Tips-Spread-in-Betting-on-Favorites.webp"
                            },
                        ].map((item, index) => (
                            <div key={index} className="bg-card rounded-lg overflow-hidden shadow-lg">
                                <img
                                    src={item.image}
                                    alt={item.title}
                                    width="400"
                                    height="300"
                                    className="w-full aspect-[4/3] object-cover"
                                />
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold">{item.title}</h3>
                                    <p className="text-muted-foreground text-sm mt-1">{item.description}</p>
                                    <div className="flex items-center justify-between mt-4">
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                                            <span className="text-muted-foreground text-sm">{item.date}</span>
                                        </div>
                                        <Link href={item.href} className="text-primary hover:underline" prefetch={false}>
                                            Read More
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}

export default Upcomming
