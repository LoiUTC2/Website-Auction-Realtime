import { ClockIcon, EyeIcon } from 'lucide-react';
import React, { useContext, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { countdown, formatCurrency, openNotify } from '../../commons/MethodsCommons';
import { AppContext } from '../../AppContext';
import RegistrationSteps from '../../pages/ProductDetail/RegistrationSteps';
import AuctionService from '../../services/AuctionService';
import productTemplate from '../../assets/productTemplate.jpg';
import { REGISTER_STATUS } from '../../commons/Constant';
import { ProductLanguage } from '../../languages/ProductLanguage';

const ProductItem = ({
  image,
  name,
  price,
  endsIn,
  slug,
  currentViews,
  productDescription,
  registeredUsers,
  registrationCloseDate,
  registrationOpenDate,
}) => {
  const { user, toggleLoginModal ,language} = useContext(AppContext);
  const [isRegistrationModalVisible, setIsRegistrationModalVisible] = useState(false);
  const [auction, setAuction] = useState(null);
   const languageText = useMemo(() => ProductLanguage[language], [language]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user)
      toggleLoginModal(true);
    else {
      const auctionData = await AuctionService.getDetail(slug);
      setAuction(auctionData);
      setIsRegistrationModalVisible(true)
    }
  };
  let registerStatus = null;
  if (registrationCloseDate && new Date() > new Date(registrationCloseDate)) {
    registerStatus = REGISTER_STATUS.EXPIRED;
  } else if (new Date() < new Date(registrationOpenDate)) {
    registerStatus = REGISTER_STATUS.NOT_ALLOW;
  } else if (user && registeredUsers?.includes(user.userId)) {
    registerStatus = REGISTER_STATUS.REGISTERED;
  } else {
    registerStatus = REGISTER_STATUS.NOT_REGISTERED;
  }
  return (
    <>
      <div className="bg-card rounded-lg overflow-hidden shadow-lg h-full flex flex-col">
        <Link to={`/auctions/${slug}`}>
          <img
            src={image || productTemplate}
            alt="Product Image"
            width={600}
            height={400}
            className="w-full aspect-[3/2] object-cover"
          />
        </Link>
        <div className="p-4 h-full flex flex-col">
          <Link to={`/auctions/${slug}`}>
            <h3 className="text-lg font-semibold">{name}</h3>
          </Link>
          <p className="text-muted-foreground text-sm mt-1 line-clamp-2 mb-1	">
            {productDescription}
          </p>
          <div className="flex items-center justify-between mt-auto">
            <div>
              <span className="text-primary font-semibold text-lg">{formatCurrency(price)}</span>
              <span className="text-muted-foreground text-sm ml-2">{ languageText.currentBid }</span>
            </div>
            <div className="flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{countdown(endsIn)}</span>
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <div className="flex items-center gap-2">
              <EyeIcon className="w-4 h-4 text-muted-foreground" />
              <span className="text-muted-foreground text-sm">{currentViews} { languageText.watching }</span>
            </div>
            <button
              size="sm"
              className={`bg-primary text-white p-2 rounded-md font-medium ${registerStatus === REGISTER_STATUS.REGISTERED || registerStatus === REGISTER_STATUS.EXPIRED || registerStatus === REGISTER_STATUS.NOT_ALLOW ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleSubmit}
              disabled={
                registerStatus === REGISTER_STATUS.REGISTERED
                || registerStatus === REGISTER_STATUS.EXPIRED
                || registerStatus === REGISTER_STATUS.NOT_ALLOW
              }
            >
              {registerStatus === REGISTER_STATUS.EXPIRED ? languageText.registrationClosed :
                registerStatus === REGISTER_STATUS.REGISTERED ? languageText.alreadyRegistered :
                languageText.placeBid}
            </button>
          </div>
        </div>
      </div>
      {isRegistrationModalVisible && (
        <RegistrationSteps
          auction={auction}
          onClose={() => setIsRegistrationModalVisible(false)}
          userId={user.userId}
        />
      )}
    </>

  );
};

export default ProductItem;