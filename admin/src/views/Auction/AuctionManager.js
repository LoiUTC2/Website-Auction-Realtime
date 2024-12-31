import React, { useEffect, useState } from 'react';
import { CForm, CRow, CCol, CFormLabel, CFormInput, CButton } from '@coreui/react';
import { List, Tabs } from 'antd';
import auctionAPI from '../../service/AuctionService';
import AuctionModal from './AuctionModal';
import { AUCTION_STATUS, MODAL_TYPES, AuctionStatus, AUCTION_STATUS_DATASOURCE} from '../../commons/Constant';
import '../../scss/AuctionApprove.scss';
import noImage from '../../assets/images/no-image.jpg'
import moment from 'moment';
//
const AuctionManager = () => {
  const [auctions, setAuctions] = useState({
    PENDING: [],
    APPROVED: [],
    ACTIVE: [],
    DONE: [],
    REJECTED: [],
  });
  const [modalConfig, setModalConfig] = useState({
    visible: false,
    type: null,
    data: null,
    status: null
  });
  const [filterParams, setFilterParams] = useState({
    fullName: '',
    status: '',
  });

  const [activeTabKey, setActiveTabKey] = useState("1"); 

  const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];


  const formatDateTime = (value) => {
    if (!value || value === 'Đợi duyệt') return '';
    return moment(value).format('HH:mm || DD-MM-YYYY ');
  };

  const handleAction = (type, auction) => {
    setModalConfig({
      visible: true,
      type: type,
      data: auction,
      status: auction.status,
    });
  };

  const handleCloseModal = () => {
    setModalConfig({
      visible: false,
      type: null,
      data: null,
      status: null
    });
  };

  const fetchAuctions = async () => {
    try {
      const [newAuctions, pendingAuctions, activeAuctions, endedAuctions, cancelledAuctions] = await Promise.all([
        auctionAPI.getNewAuction(),
        auctionAPI.getPendingAuction(),
        auctionAPI.getActiveAuction(),
        auctionAPI.getEndedAuction(),
        auctionAPI.getCancelledAuction(),
      ]);

      setAuctions({
        PENDING: newAuctions.data.docs,
        APPROVED: pendingAuctions.data.docs,
        ACTIVE: activeAuctions.data.docs,
        DONE: endedAuctions.data.docs,
        REJECTED: cancelledAuctions.data.docs,
      });
    } catch (error) {
      console.error('Error fetching auctions:', error);
    }
  };

  useEffect(() => {
    fetchAuctions();
  }, []);

  useEffect(() => {
    fetchAuctions();
  }, [activeTabKey]);

  const handleFilter = (e) => {
    const { name, value } = e.target;
    setFilterParams(prev => ({
      // Kiểm tra nếu prev là một đối tượng, nếu không thì khởi tạo một đối tượng rỗng
      ...(prev || {}),
      [name]: value
    }));
  };
  
  const hasPermission = (permission) => permissionValue.includes(permission);

  const renderActionButtons = (status, item) => {
    const buttons = [];
    
    if(hasPermission('1')){
      buttons.push(
        <CButton key="view" onClick={() => handleAction(MODAL_TYPES.VIEW, item)}>
          Xem
        </CButton>
      );
    }
    if (hasPermission('2') && status === AUCTION_STATUS.PENDING) {
      buttons.push(
        <CButton key="approve" className="mx-2 btn-success" onClick={() => handleAction(MODAL_TYPES.APPROVE, item)}>
          Duyệt
        </CButton>,
        <CButton key="reject" className="btn-danger" onClick={() => handleAction(MODAL_TYPES.REJECT, item)}>
          Từ chối
        </CButton>
      );
    } 
    if (status === AUCTION_STATUS.APPROVED) {
      // if(hasPermission('3')){
      //   buttons.push(
      //     <CButton key="update" className="mx-2 btn-success" onClick={() => handleAction(MODAL_TYPES.UPDATE, item)}>
      //       Điều chỉnh
      //     </CButton>, 
      //   );
      // }
      if(hasPermission('4')){
        buttons.push(
          <CButton key="cancel" className="btn-danger" onClick={() => handleAction(MODAL_TYPES.CANCEL, item)}>
            Hủy
          </CButton>,
        );
      }
    } 
    if (status === AUCTION_STATUS.ACTIVE) {
      if(hasPermission('3')){
        buttons.push(
          <CButton key="update" className="mx-2 btn-success" onClick={() => handleAction(MODAL_TYPES.UPDATE, item)}>
            Điều chỉnh
          </CButton>,
        );
      }
      if(hasPermission('6')){
        buttons.push(
          <CButton key="end" className="btn-danger" onClick={() => handleAction(MODAL_TYPES.END, item)}>
            Đóng phiên 
          </CButton> 
        );
      }
    }
    if (status === AUCTION_STATUS.ENDED) {
      if(hasPermission('3')){
        buttons.push(
          <CButton key="update" className="mx-2 btn-success" onClick={() => handleAction(MODAL_TYPES.UPDATE, item)}>
            Điều chỉnh
          </CButton>,
        );
      }
    }
    if (status === AUCTION_STATUS.CANCELLED) {
      if(hasPermission('5')){
        // buttons.push(
        //   <CButton key="recover" className="mx-2 btn-success" onClick={() => handleAction(MODAL_TYPES.RECOVER, item)}>
        //     Khôi phục
        //   </CButton>, 
        // );
      }
    }
    return buttons;
  };

  const renderAuctionList = (auctionItems) => (
    <List
      className="demo-loadmore-list"
      itemLayout="horizontal"
      dataSource={auctionItems}
      renderItem={(item) => (
        <List.Item 
          className="d-flex justify-content-start" 
          actions={[
            <div className="d-flex gap-2" >
              {renderActionButtons(item.status, item)}
            </div>
          ]}
        >
          <div style={{ width: '400px' }}>
            <List.Item.Meta
              avatar={
                <img
                  src={item?.productImages[0] ?? noImage}
                  className="rounded"
                  height={60}
                  width={60}
                  alt={item.productName}
                />
              }
              title={<a href="#">{item.productName}</a>}
              description={
                <div className="text-truncate" style={{ maxWidth: '90%' }}>
                  {item.productDescription}
                </div>
              }
            />
          </div>
          <div style={{ width: '170px'}}>
            <CRow className="d-flex align-items-center">
              <CFormLabel className="mb-0">Thời gian đăng kí</CFormLabel>
              <CFormLabel className="fw-semibold mb-0">
                {formatDateTime(item.createdAt)}
              </CFormLabel>
            </CRow>
          </div>
          <div style={{ width: '200px' }}>
            <CRow className="d-flex align-items-center">
              <CFormLabel className="mb-0">Trạng thái</CFormLabel>
              <CFormLabel className="fw-semibold mb-0">
                {AUCTION_STATUS_DATASOURCE.find(x=>x.value==item.status)?.label}
              </CFormLabel>
            </CRow>
          </div>
        </List.Item>
      )}
    />
  );

  const tabItems = [
    {
      key: '1',
      label: 'Tất cả',
      children: renderAuctionList([...auctions.PENDING, ...auctions.APPROVED, ...auctions.ACTIVE, ...auctions.DONE, ...auctions.REJECTED])
    },
    {
      key: '2',
      label: 'Chờ duyệt',
      children: renderAuctionList(auctions.PENDING)
    },
    {
      key: '3',
      label: 'Sắp đấu giá',
      children: renderAuctionList(auctions.APPROVED)
    },
    {
      key: '4',
      label: 'Đang đấu giá',
      children: renderAuctionList(auctions.ACTIVE)
    },
    {
      key: '5',
      label: 'Đã đấu giá',
      children: renderAuctionList(auctions.DONE)
    },
    {
      key: '6',
      label: 'Đã hủy',
      children: renderAuctionList(auctions.REJECTED)
    }
  ];

  return (
    <div className="app">
      <CRow>
        <CForm className="mb-4">
          <CRow md="8" className="mb-4 fw-bolder fs-6 ms-2">
            Thông tin tìm kiếm
          </CRow>
          <CRow md="12">
            <CRow className="col-md-6 mb-2">
              <CCol md="3" className="d-flex align-items-center">
                <CFormLabel className="mt-2">Tên sản phẩm</CFormLabel>
              </CCol>
              <CCol md="7">
                <CFormInput
                  name="fullName"
                  value={filterParams.fullName || ''}
                  onChange={handleFilter}
                />
              </CCol>
            </CRow>
            <CRow className="col-md-6 mb-2">
              <CCol md="3" className="d-flex align-items-center">
                <CFormLabel className="mt-2">Trạng thái</CFormLabel>
              </CCol>
              <CCol md="7">
                <CFormInput
                  name="status"
                  value={filterParams.status || ''}
                  onChange={handleFilter}
                />
              </CCol>
          </CRow>
          </CRow>
          <CRow >
            <CCol md="2">
            <CButton onClick={fetchAuctions}>Tìm kiếm</CButton>
            </CCol>
          </CRow>
        </CForm>
      </CRow>
      <CRow>
        <CRow md="8" className="mb-4 fw-bolder fs-6 ms-2">
          Kết quả tìm kiếm
        </CRow>
        <CRow>
          <Tabs defaultActiveKey="1" items={tabItems} onChange={(key) => setActiveTabKey(key)}/>
        </CRow>
      </CRow>
      <AuctionModal
        visible={modalConfig.visible}
        type={modalConfig.type}
        data={modalConfig.data}
        status={modalConfig.status}
        onClose={handleCloseModal}
        onSuccess={fetchAuctions}
      />
    </div>
  );
};

export default AuctionManager;