import React from 'react';
import styles from '../../scss/AuctionsComponentApprove.module.scss';
import auctionAPI from 'service/AuctionService';
import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import AuctionModal from './AuctionModal';
import AuctionApproveModal from './AuctionApproveModal';
import AuctionApproveValues from './AuctionApproveValues';
import AuctionApprove from './AuctionApprove';

const AuctionApproveComponent = ({ auctions , type,  onStatusChange}) => {
  const [auctionSlug, setAuctionSlug] = useState('');

  const [showModal, setShowModal] = useState(false); //show modal
  const [showModalType, setShowModalType] = useState(null); //show kiểu gì: xem sửa xóa
  const [modalValue, setModalValue] = useState({}); //lấy dòng dữ liệu trong bảng

  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const [rejectReason, setRejectReason] = useState('');

  const [auctionInfo, setAuctionInfo] = useState(null);
  const [selectedAuctionId, setSelectedAuctionId] = useState(null);

  const handleApprove = async (values) => {
    try {
      const response = await auctionAPI.approve(selectedAuctionId, values);
      if (response) {
        toast.success("Duyệt phiên đấu giá thành công!");
        closeApproveModal();
        onStatusChange(); // Cập nhật trạng thái giao diện
      }
    } catch (error) {
      toast.error("Phê duyệt thất bại!");
    }
  };
  const openApproveModal = async (auctionId, auctionSlug) => {
    const getAuction = await auctionAPI.getDetailAuction(auctionSlug);
    if(getAuction.success){
      setAuctionInfo(getAuction.data);
    }
    setSelectedAuctionId(auctionId);
    setShowApproveModal(true);
  };
  const closeApproveModal = () => {
    setShowApproveModal(false);
  };


  const handleReject = async (auctionId, reason) => {
    await auctionAPI.reject(auctionId, reason);
    onStatusChange();
    setShowRejectModal(false); 
    toast.success("Từ chối phiên đấu giá thành công");
  };
  const openRejectModal = (auctionId) => {
    setSelectedAuctionId(auctionId);
    setShowRejectModal(true);
  };
  const closeRejectModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
  };

  // Hàm xử lý click bên ngoài modal để đóng modal
  const handleOutsideClick = (e) => {
    if (e.target.className.includes(styles["reject-modal"])) {
      closeRejectModal();
    }
  };

  const handleDetailAuction = async (auctionSlug) => {
    const getAuction = await auctionAPI.getDetailAuction(auctionSlug);
    if(getAuction.success){
      setAuctionInfo(getAuction.data);
    }
    setAuctionSlug(auctionSlug);
    setShowModal(true);
    setShowModalType("Xem");
    onStatusChange();
  };

  

  return (
    <div className={styles['new-auctions']}>
      <h1>
        {type === "New" 
          ? "Phiên đấu giá đang chờ phê duyệt" 
          : type === "Pending" 
            ? "Phiên đấu giá sắp diễn ra" 
            : type === "Active" 
              ? "Phiên đấu giá đang diễn ra" 
              : "Trạng thái không xác định"}
      </h1>

      {auctions && auctions.length > 0 ? (
        <ul>
          {auctions.map((auction) => (
            <li key={auction.id} className={styles['auction-item']}>
              <div className={styles["auction-content"]}>
                <div className={styles["left-content"]}>
                  <strong>Đấu phẩm: </strong>
                  <span>{auction.productName}</span>
                  {auction.productImages.map((image, index) => ( 
                    <img key={index} 
                    src={image} 
                    alt={`Product image ${index + 1}`} 
                    className={styles['product-image']} /> ))
                  }
                </div>
                <div className={styles["right-content"]}>
                  <p>
                    <strong>Giá khởi điểm: </strong>
                    <span>{auction.startingPrice}</span>
                  </p>
                  <p>
                    <strong>Mô tả: </strong>
                    <span>{auction.description}</span>
                  </p>
                  <p>
                    <strong>Người đăng ký: </strong>
                    <span>{auction.sellerName}</span>
                  </p>
                  <p>
                    <strong>Thời gian đăng ký: </strong>
                    <span>{auction.createdAt}</span>
                  </p>
                </div>
              </div>

              <div>{type === "New" ? (
                <div className={styles['auction-actions']}>
                <button className={styles['approve-button']} onClick={() => openApproveModal(auction._id, auction.slug)}>Phê duyệt</button>
                <button className={styles['reject-button']} onClick={() => openRejectModal(auction._id)}>Từ chối</button>
                <button className={styles['details-button']} onClick={() => handleDetailAuction(auction.slug)}>Xem chi tiết</button>
                </div>
                ) : (type === "Pending") ? (
                <div className={styles['auction-actions']}>
                <button className={styles['approve-button']} >Điều chỉnh</button>
                <button className={styles['reject-button']} >Đóng phiên</button>
                <button className={styles['details-button']} onClick={() => handleDetailAuction(auction.slug)}>Xem chi tiết</button>
                </div>
                ) : (
                <div className={styles['auction-actions']}>
                <button className={styles['approve-button']} >Tham gia</button>
                <button className={styles['reject-button']} >Khóa phòng</button>
                <button className={styles['details-button']} >Đóng phòng</button>
                </div>
                )}
              </div>
        
            </li>
          ))}
        </ul>
      ) : (
        <div>
        {/* <p style={{ fontSize: '30px' }}>Không có phiên đấu giá nào đang chờ phê duyệt.</p> */}
        <p style={{ fontSize: '30px' }}>
        {type === "New" 
          ? "Không có phiên đấu giá đang chờ phê duyệt" 
          : type === "Pending" 
            ? "Không có phiên đấu giá sắp diễn ra" 
            : type === "Active" 
              ? "Không có phiên đấu giá đang diễn ra" 
              : "Trạng thái không xác định"}
      </p></div>
      )}


      {/* Hiển thị Modal khi showApproveModal = true */}
      {showApproveModal && (
        <AuctionApproveValues auction={auctionInfo} onClose={closeApproveModal} onApprove={handleApprove}/>
      )}

      {/* Modal hiển thị khi từ chối */}
      {showRejectModal && (
        <div className={styles["reject-modal"]} onClick={handleOutsideClick}>
          <div className={styles["modal-content"]} onClick={(e) => e.stopPropagation()}>
            <h2>Vui lòng cho biết lý do từ chối</h2>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối"
            />
            <div className={styles["modal-actions"]}>
              <button onClick={() => closeRejectModal()}>Hủy</button>
              <button
                onClick={() => handleReject(selectedAuctionId, rejectReason)}
                disabled={!rejectReason.trim()}
              >
                Xác nhận
              </button>
            </div>
          </div>
        </div>
      
      )}

      {/* Modal hiển thị khi showModal = true */}
      {showModal && (      
        <AuctionApproveModal type={showModalType} setShowModal={setShowModalType} data={auctionInfo} />
      )}
              
    </div>
  );
};

export default AuctionApproveComponent;