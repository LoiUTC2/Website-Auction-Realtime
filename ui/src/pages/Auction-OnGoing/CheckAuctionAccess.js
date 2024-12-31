import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../../AppContext';
import AuctionRoomOnlyView from './AuctionRoomOnlyView';
import AuctionService from '../../services/AuctionService'
import LoadingSpinner from '../LoadingSpinner';

const CheckAuctionAccess = ({children}) => {
    const navigate = useNavigate();
    const { roomId } = useParams();
    const { user, toggleLoginModal } = useContext(AppContext);
    const [hasRegistered, setHasRegistered] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
  
    useEffect(() => {
      const checkAccess = async () => {
        try {
          const registered = await AuctionService.checkUserRegistration(roomId);
          setHasRegistered(registered?.allow || false);
        } catch (error) {
          console.error('Error checking user registration:', error);
          setHasRegistered(false);
          return navigate('/');
        } finally {
          setIsLoading(false);
        }
        };
      checkAccess();
    }, [roomId]);
  
    if (isLoading) return <LoadingSpinner />;
  
    if (!user) {
      toggleLoginModal(true);
      return null;
    }
  
    if (!hasRegistered) {
      return <AuctionRoomOnlyView roomId={roomId} />;
    }
  
    return <>{children}</>;
  };

export default CheckAuctionAccess;

