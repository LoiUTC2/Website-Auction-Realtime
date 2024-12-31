const express = require('express');
const router = express.Router();

const {
    registerAuctionProduct,
    approveAuction,
    rejectAuction,
    updateAuction,
    endAuction,
    kickCustomerOutOfAuction,
    deleteHistoryManagerAuction,
    getAuctionDetailsByID,
    getAuctionDetails,
    listAuctions,
    getAuctionOutstanding,
    ongoingList,
    checkValidAccess,
    getMyAuctioned,
    updateBankInfo,
    getAuctionComfirmInfo,
    updateStatusAuction,
} = require('../controllers/auction.controller');
const { verifyAccessToken } = require('../middlewares/Authentication');
const handleUpload = require('../utils/uploadImages');


router.post('/register', verifyAccessToken,handleUpload, registerAuctionProduct);
router.post('/comfirmation', getAuctionComfirmInfo);

router.put('/:auctionId/status', updateStatusAuction); //Update status 
router.put('/approve/:auctionId/:userId', approveAuction); 
router.put('/reject/:auctionId/:userId', rejectAuction);
router.put('/update/:auctionId/:userId', updateAuction);
router.put('/end/:auctionId/:userId', endAuction);
router.put('/:auctionId/bank-info', updateBankInfo);
router.delete('/kickCustomer/:auctionId/:customerId/:userId', kickCustomerOutOfAuction);
router.delete('/deleteHistory/:auctionId/:managementActionId', deleteHistoryManagerAuction);

router.get('/getDetailAuctionByID/:id_Auction', getAuctionDetailsByID);

//get cho client
router.get('/outstanding', getAuctionOutstanding); 
router.get('/my-auctioned',verifyAccessToken, getMyAuctioned); 
router.get('/ongoing', ongoingList); 
router.get('/:auctionId/check-valid-access',verifyAccessToken, checkValidAccess); 
router.get('/:auctionSlug', getAuctionDetails);
router.get('/', listAuctions);
module.exports = router;