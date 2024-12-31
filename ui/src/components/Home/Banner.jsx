import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import productTemplate from '../../assets/productTemplate.jpg'
import { countdown, formatCurrency } from '../../commons/MethodsCommons';

const Banner = ({ auctionStanding,languageText }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  useEffect(() => {
    const intervalId = setInterval(() => {
      setIsTransitioning(true);
      
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % auctionStanding.length);
        setIsTransitioning(false);
      }, 400); 
    }, 7000);

    return () => clearInterval(intervalId);
  }, [auctionStanding.length]);

  return (
    <div className="flex p-8 w-full mx-auto justify-center items-center">
      <div className="w-1/2 pr-8 flex flex-col gap-4 h-fit">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl leading-4">{ languageText.discoverTreasures}</h2>
        <p className="text-gray-600 mb-6 text-lg md:text-xl">{ languageText.browseDescription}</p>
        <div className="space-x-2 flex flex-col sm:flex-row gap-1">
          <button className="bg-black text-white px-6 py-2 rounded-md font-medium h-10 inline-flex flex-1 items-center justify-center"><Link to="/auctions/ongoing">{ languageText.browseAuctions}</Link></button>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-md font-medium h-10 inline-flex flex-1 items-center justify-center"><Link to="auctions/sell">{ languageText.sellItem}</Link></button>
        </div>
      </div>
      <div className="w-1/2 h-full relative overflow-hidden max-h-[600px] mb-auto">
        <div className={`h-full rounded-lg overflow-hidden relative flex items-center justify-center 
          transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}>
          <div className='relative h-full w-full'>
            <img
              src={auctionStanding[currentIndex]?.productImages[0] || productTemplate}
              alt={auctionStanding[currentIndex]?.title || "Auction Item"}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white p-4">
            <h3 className="text-xl font-semibold">{auctionStanding[currentIndex]?.productName || "Rare Antique Vase"}</h3>
            <p>Current Bid: {formatCurrency(auctionStanding[currentIndex]?.startingPrice)}</p>
            <p>Ends in {countdown(auctionStanding[currentIndex]?.registrationCloseDate)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Banner;