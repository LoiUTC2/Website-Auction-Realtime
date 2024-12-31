import React, { useEffect, useState } from 'react';
import { CButton, CCol, CForm, CTable, CFormInput, CFormTextarea, CFormLabel, CModal, CModalBody, CModalFooter, CModalHeader, CRow,CFormSelect } from '@coreui/react';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import auctionAPI from '../../service/AuctionService';
import customerAPI from '../../service/CustomerService';
import roleApi from 'service/RoleService';
import employeeApi from '../../service/EmployeeService';
import moment from 'moment';
import TabPane from 'antd/es/tabs/TabPane';
import { Image, List, Tabs } from 'antd';
import { MODAL_TYPES, AuctionStatus, ProductCategory, ProductCondition, ProductStatus, PRODUCT_CATEGORY_DATASOURCE, PRODUCT_CONDITION_DATASOURCE, PRODUCT_STATUS_DATASOURCE, PRODUCT_TYPE_DATASOURCE, AUCTION_STATUS_DATASOURCE, PRODUCT_STATUS, AUCTION_STATUS } from '../../commons/Constant'
import noImage from '../../assets/images/no-image.jpg'
import { formatCurrency, parseCurrency } from 'commons/MethodsCommon';

// Validation schema
const approvalValidationSchema = Yup.object({
  startTime: Yup.date()
    .required('Vui lòng nhập thời gian bắt đầu'),
  endTime: Yup.date()
    .required('Vui lòng nhập thời gian kết thúc'),
  registrationFee: Yup.number().required('Vui lòng nhập phí tham gia'),
  signupFee: Yup.number().required('Vui lòng nhập phí đăng ký'),
  registrationOpenDate: Yup.date()
    .required('Vui lòng nhập ngày mở đăng ký'),
  registrationCloseDate: Yup.date()
    .required('Vui lòng nhập ngày đóng đăng ký'),
});

const AuctionModal = ({ type, visible, onClose, data, status, onSuccess }) => {
  const [rejectReason, setRejectReason] = useState('');
  const [approvalAction, setApprovalAction] = useState();

  const [detailAuction, setDetailAuction] = useState (); 

  const userId = JSON.parse(localStorage.getItem('userId')); 
  const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];

  const [hoveredItem, setHoveredItem] = useState(null); // Trạng thái để theo dõi dòng đang hover

  useEffect(()=>{
    const fetchDataDetailAuction = async () => {
      const getDetailAuctionByID = await auctionAPI.getDetailAuctionByID(data?._id || '');
        if(getDetailAuctionByID.success){
          setDetailAuction(getDetailAuctionByID.data);
          setApprovalAction(getDetailAuctionByID.data?.managementAction?.find(action => action.action === 'duyệt') || null);
        }
    };
    fetchDataDetailAuction();
    
  }, [data])
  
  const isEditable = type === MODAL_TYPES.APPROVE || type === MODAL_TYPES.UPDATE;

  const formatDateTime = (value) => {
    if (!value || value === 'Đợi duyệt') return '';
    return moment(value).format('YYYY-MM-DD HH:mm');
  };

  const formik = useFormik({
    enableReinitialize: true,
    initialValues: {
      // AUCTION
      _id: data?._id?.toString() || '',
      title: data?.title || '',
      description: data?.description || '',
      sellerName: data?.sellerName || '',
      contactEmail: data?.contactEmail || '',
      startTime: formatDateTime(data?.startTime || ''),
      endTime: formatDateTime(data?.endTime || ''),
      startingPrice: data?.startingPrice || '',
      currentPrice: data?.currentPrice || '',
      currentViews: data?.currentViews || '',
      bidIncrement: data?.bidIncrement || '',
      registrationOpenDate: formatDateTime(data?.registrationOpenDate || ''),
      registrationCloseDate: formatDateTime(data?.registrationCloseDate || ''),
      status: data?.status || '',
      cancellationReason: data?.cancellationReason || '',
      deposit: data?.deposit || '',
      registrationFee: data?.registrationFee || '',
      signupFee: data?.signupFee || '',
      winner: data?.winner || '',
      winningPrice: data?.winningPrice || '',
      approvalTime: approvalAction?.timeLine ? formatDateTime(approvalAction.timeLine) : '',
      approvalBy: approvalAction?.userBy?.username || '',
      updatedAt: formatDateTime(data?.updatedAt || ''),
      updatedBy: data?.updatedBy || '', 

      //PRODUCT
      productName: data?.productName || '',
      productImages: data?.productImages || [],
      productDescription: data?.productDescription || '',
      productAddress: data?.productAddress || '',
      productCategory: data?.productCategory || '',
      productType: data?.productType || '',
      productCondition: data?.productCondition || '',
      productStatus: data?.productStatus || '',
      productCreate: formatDateTime(data?.productCreate || ''),

      //REGISTER LIST
      registeredUsers: data?.registeredUsers || '',
      username: data?.username || '',
      userCode: data?.userCode || '',
      email: data?.email || '',
      fullName: data?.fullName || '',
      phoneNumber: data?.phoneNumber || '',
      avatar: data?.avatar || '',
      IndentifyCode: data?.IndentifyCode || '',
      createdCustomerAt: formatDateTime(data?.createdCustomerAt || ''),

    },
    validationSchema: (type === MODAL_TYPES.APPROVE || type === MODAL_TYPES.UPDATE) ? approvalValidationSchema : null,
    onSubmit: values => {
      handleSubmit(values)
    },
  });

  async function handleSubmit(values) {
    try {
      const now = moment();
      // Validate date time
      if (values.registrationOpenDate) {
        const registrationOpenDate = moment(values.registrationOpenDate);
        if (registrationOpenDate.isBefore(now)) {
          toast.error('Thời gian mở đăng ký phải sau thời gian hiện tại');
          return;
        }

        if (values.registrationCloseDate) {
          const registrationCloseDate = moment(values.registrationCloseDate);
          if (registrationCloseDate.isBefore(registrationOpenDate)) {
            toast.error('Thời gian đóng đăng ký phải sau thời gian mở đăng ký');
            return;
          }
        }
      }

      if (values.startTime) {
        const startTime = moment(values.startTime);

        if (startTime.isBefore(now)) {
          toast.error('Thời gian bắt đầu phải sau thời gian hiện tại');
          return;
        }

        if (values.registrationCloseDate) {
          const registrationCloseDate = moment(values.registrationCloseDate);
          if (registrationCloseDate.isSameOrAfter(startTime)) {
            toast.error('Thời gian đóng đăng ký phải trước thời gian bắt đầu');
            return;
          }
        }

        if (values.endTime) {
          const endTime = moment(values.endTime);
          if (endTime.isSameOrBefore(startTime)) {
            toast.error('Thời gian kết thúc phải sau thời gian bắt đầu');
            return;
          }
        }
      }
    
      const formattedValues = {
        ...values,
        startTime: values.startTime && moment(values.startTime, moment.ISO_8601, true).isValid()
          ? moment(values.startTime).toISOString()
          : null,
        endTime: values.endTime && moment(values.endTime, moment.ISO_8601, true).isValid()
          ? moment(values.endTime).toISOString()
          : null,
        registrationOpenDate: values.registrationOpenDate && moment(values.registrationOpenDate, moment.ISO_8601, true).isValid()
          ? moment(values.registrationOpenDate).toISOString()
          : null,
        registrationCloseDate: values.registrationCloseDate && moment(values.registrationCloseDate, moment.ISO_8601, true).isValid()
          ? moment(values.registrationCloseDate).toISOString()
          : null,
        startingPrice: values.startingPrice ? parseFloat(values.startingPrice) : null,
        bidIncrement: values.bidIncrement ? parseFloat(values.bidIncrement) : null,
        deposit: values.deposit ? parseFloat(values.deposit) : null,
        registrationFee: values.registrationFee ? parseFloat(values.registrationFee) : null,
        signupFee: values.signupFee ? parseFloat(values.signupFee) : null,
        contactEmail: values.contactEmail?.trim() || '',
        productImages: Array.isArray(values.productImages) ? values.productImages : [],
      };
      
      let response;
      
      switch (type) {
        case MODAL_TYPES.APPROVE:
          if (values.productStatus != PRODUCT_STATUS.RECEIVED)
          {
            return toast.error('Vui lòng cập nhật trạng thái sản phẩm trước khi duyệt')
          }
          response = await auctionAPI.approve(userId, values._id, formattedValues);
          break;
        case MODAL_TYPES.REJECT:
          if (!rejectReason) {
            toast.error('Vui lòng nhập lý do từ chối');
            return;
          }
          response = await auctionAPI.reject(userId, values._id, rejectReason);
          break;
        case MODAL_TYPES.UPDATE:
          response = await auctionAPI.updateAuction(userId, values._id, formattedValues);
          break;
        case MODAL_TYPES.CANCEL:
          if (!rejectReason) {
            toast.error('Vui lòng nhập lý do hủy phiên đấu giá');
            return;
          }
          response = await auctionAPI.reject(userId, values._id, rejectReason);
          break;
        // case MODAL_TYPES.RECOVER:
        //   response = await auctionAPI.approve(userId, values._id, formattedValues);
        //   break;
        case MODAL_TYPES.END:
          if (!rejectReason) {
            toast.error('Vui lòng nhập lý do đóng phiên đấu giá');
            return;
          }
          response = await auctionAPI.endAuction(userId, values._id, rejectReason);
          break;
        default:
          return;
        }

      if (response.success) {
        toast.success('Thao tác thành công!');
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.log("Auction ID:", values._id);

      console.error("Lỗii:", error);
      toast.error(error.response?.data?.message || 'Có lỗi xảy raa!');
    }
  }

  const handleKickCustomer = async (auctionId, customerId, userId) => {
    const kickCustomer = await auctionAPI.kickCustomerOutOfAuction(auctionId, customerId, userId);
    if(kickCustomer.success){
      setDetailAuction(kickCustomer.data);
      toast.success("Xóa khách hàng khỏi phiên đấu giá thành công");
    }else{
      toast.error(kickCustomer.message || 'Xóa khách hàng khỏi phiên đấu giá thất bại!');
    } 
  }

  const handleDeleteHistory = async (auctionId, managementActionId) => {
    const deleteHistory = await auctionAPI.deleteHistoryManagementAction(auctionId, managementActionId);
    if(deleteHistory.success){
      setDetailAuction(deleteHistory.data);
      toast.success("Xóa lịch sử quản lý đấu giá thành công");
    }else{
      toast.error(deleteHistory.message || 'Xóa lịch sử quản lý đấu giá thất bại!');
    } 
  }

  const renderFormField = (label, name, inputType = 'text', dataSource = [], disabled = false) => (
    <CCol md={name == 'productDescription' ? "12" : "6"} className="mb-3">
      <CRow>
        <CCol md={name == 'productDescription' ? "2" : "4"}>
          <CFormLabel className="mt-1">{label}</CFormLabel>
        </CCol>
        <CCol md={name == 'productDescription' ? "10" : "7"}>
          {inputType === 'textarea' || name === 'productDescription' || name === 'description' ? (
            <CFormTextarea
              name={name}
              value={formik.values[name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!isEditable || disabled}
              rows={6} 
              style={{
                resize: 'none', // Vô hiệu hóa khả năng thay đổi kích thước thủ công
              }}
              className={!isEditable ? 'textarea-readonly' : ''}
            />
          ) : inputType === 'select' ? (
            <CFormSelect
              name={name}
              value={formik.values[name]}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!isEditable || disabled}
              className={!isEditable ? 'select-readonly' : ''}
            >
              <option value=""></option>
              {dataSource.map((item, index) => (
                <option key={index} value={item.value}>
                  {item.label}
                </option>
              ))}
            </CFormSelect>
          ) : (
            <CFormInput
              type={inputType == 'number' ? null : inputType}
              name={name}
              value={inputType == 'number' ? formatCurrency(formik.values[name]) : formik.values[name]}
              onChange={
                inputType == 'number' ?
                  (e) => {
                    const rawValue = parseCurrency(e.target.value);
                    formik.setFieldValue(name, rawValue || null);
                  }
                  : formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!isEditable || disabled}
              className={!isEditable ? 'input-readonly' : ''}
            />
          )}
          {formik.touched[name] && formik.errors[name] && (
            <div className="text-danger">{formik.errors[name]}</div>
          )}
        </CCol>
      </CRow>
    </CCol>
  );
  
  
  const hasPermission = (permission) => permissionValue.includes(permission);

  return (
    <CModal
      visible={visible}
      onClose={onClose}
      className="modal-xl"
    >
      <CModalHeader closeButton>
        {type === MODAL_TYPES.VIEW && 'Xem chi tiết phiên đấu giá'}
        {type === MODAL_TYPES.APPROVE && 'Duyệt phiên đấu giá'}
        {type === MODAL_TYPES.REJECT && 'Từ chối phiên đấu giá'}
        {type === MODAL_TYPES.UPDATE && 'Điều chỉnh phiên đấu giá'}
        {type === MODAL_TYPES.CANCEL && 'Hủy phiên đấu giá'}
        {/* {type === MODAL_TYPES.RECOVER && 'Khôi phục phiên đấu giá'} */}
        {type === MODAL_TYPES.END && 'Đóng phiên đấu giá'}
      </CModalHeader>

      <CModalBody className="p-4">
        <Tabs defaultActiveKey="1">
          <TabPane tab="Thông tin chung" key="1">
            <CForm onSubmit={formik.handleSubmit}>
              <CRow>
                {renderFormField('Title', 'title')}
                {/* {renderFormField('Mô tả', 'description')} */}
                {renderFormField('Người đăng ký', 'sellerName')}
                {renderFormField('Tên đấu phẩm', 'productName')}
                {renderFormField('Email liên hệ', 'contactEmail', 'email')}
                {renderFormField('Giá khởi điểm', 'startingPrice', 'number')}
                {/* {status === 'active' && (renderFormField('Giá hiện tại', 'currentPrice'))} */}

                {renderFormField('Bước giá tối thiểu', 'bidIncrement', 'number')}
                {renderFormField('Thời gian mở đăng ký', 'registrationOpenDate', 'datetime-local')}
                {renderFormField('Thời gian đóng đăng ký', 'registrationCloseDate', 'datetime-local')}
                {renderFormField('Thời gian bắt đầu', 'startTime', 'datetime-local')}
                {renderFormField('Thời gian kết thúc', 'endTime', 'datetime-local')}
                {renderFormField('Phí đặt cọc', 'deposit', 'number')}
                {renderFormField('Phí tham gia đấu giá', 'registrationFee', 'number')}
                {renderFormField('Phí đăng ký', 'signupFee', 'number')}
                {renderFormField('Trạng thái phiên đấu giá', 'status','select',AUCTION_STATUS_DATASOURCE, true)}

                {/* {status === 'active' && (renderFormField('Số lượng người xem', 'viewCount'))} */}

                {(status === AUCTION_STATUS.PENDING || status === AUCTION_STATUS.APPROVED || status === AUCTION_STATUS.DONE) && (renderFormField('Người duyệt', 'approvalBy', undefined, undefined, true))}
                {(status === AUCTION_STATUS.PENDING || status === AUCTION_STATUS.APPROVED || status === AUCTION_STATUS.DONE) && (renderFormField('Thời điểm duyệt', 'approvalTime', 'datetime-local', undefined, true))}
                {/* {(status === 'pending' || status === 'active' || status === 'ended') && (renderFormField('Người điều chỉnh', 'updatedBy'))}
                {(status === 'pending' || status === 'active' || status === 'ended') && (renderFormField('Thời điểm điều chỉnh', 'updatedAt', 'datetime-local'))} */}

                {status === AUCTION_STATUS.DONE && (renderFormField('Người mua', 'winner', undefined, undefined, true))}
                {status === AUCTION_STATUS.DONE && (renderFormField('Giá mua', 'winningPrice', undefined, undefined, true))}

                {status === AUCTION_STATUS.REJECTED && (renderFormField('Lí do từ chối', 'cancellationReason'))}

                {type === MODAL_TYPES.REJECT && (
                  <CCol md="12" className="mb-3">
                    <CFormLabel>Lý do từ chối</CFormLabel>
                    <CFormInput
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do từ chối"
                    />
                  </CCol>
                )}
                {type === MODAL_TYPES.CANCEL && (
                  <CCol md="12" className="mb-3">
                    <CFormLabel>Lý do hủy phiên đấu giá</CFormLabel>
                    <CFormInput
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do hủy phiên đấu giá"
                    />
                  </CCol>
                )}
                {type === MODAL_TYPES.END && (
                  <CCol md="12" className="mb-3">
                    <CFormLabel>Lý do đóng phiên đấu giá</CFormLabel>
                    <CFormInput
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Nhập lý do đóng phiên đấu giá"
                    />
                  </CCol>
                )}
              </CRow>
            </CForm>
          </TabPane>

          <TabPane tab="Thông tin sản phẩm"  key="2">
            <CForm onSubmit={formik.handleSubmit}>
              <CRow className='mb-3' >
                <CCol md="2">
                  <CFormLabel className="mt-1">Hình ảnh</CFormLabel>
                </CCol>
                <CCol md="10">
                  {formik.values.productImages?.map(item => (
                    <Image src={ item} width={150} preview={false} />
                 ))}
                </CCol>
              </CRow>
              <CRow>
                {renderFormField('Tên sản phẩm', 'productName')}
                
                {renderFormField('Giá khởi điểm', 'startingPrice','number')}

                {renderFormField('Địa chỉ sản phẩm', 'productAddress')}
                {renderFormField('Danh mục ', 'productCategory','select',PRODUCT_CATEGORY_DATASOURCE)}
                {renderFormField('Tình trạng ', 'productCondition','select',PRODUCT_CONDITION_DATASOURCE)}
                {renderFormField('Thể loại', 'productType','select',PRODUCT_TYPE_DATASOURCE)}
                {/* {renderFormField('Thời gian xuất hiện', 'productCreate', 'datetime-local')} */}

                {renderFormField('Người bán', 'sellerName')}
                {renderFormField('Trạng thái sản phẩm', 'productStatus','select',PRODUCT_STATUS_DATASOURCE)}
                {/* {renderFormField('Email', 'contactEmail', 'email')} */}

                {/* {status === 'ended' && (renderFormField('Người mua', 'winner'))}
                {status === 'ended' && (renderFormField('Giá mua', 'currentPrice'))} */}

                {renderFormField('Mô tả', 'productDescription')}
              </CRow>
              
            </CForm>
          </TabPane>

          <TabPane tab="Danh sách đăng ký" key="3">
            {detailAuction?.registeredUsers?.length ? (
              <>
                {/* <div className="d-flex w-100 header-row">
                  <div className="flex-grow-1 text-center column">Mã khách hàng</div>
                  <div className="flex-grow-2 text-center column">Họ tên</div>
                  <div className="flex-grow-3 text-center column">Thông tin cá nhân</div>
                  <div className="flex-grow-1 text-center column">Thời gian đăng kí</div>
                </div> */}

                <List
                  className="demo-loadmore-list"
                  itemLayout="horizontal"
                  dataSource={detailAuction?.registeredUsers}
                  renderItem={(customer) => (
                    <List.Item
                      className="d-flex justify-content-start data-row"
                      actions={[
                        <div className="d-flex gap-2">
                          {hasPermission("7") && <CButton key="delete" onClick={() => handleKickCustomer(data._id, customer.customer?._id, userId)}>Xóa khỏi phiên</CButton>}
                          {/* {renderActionButtons(data._id, customer._id)} */}
                        </div>,
                      ]}
                    >
                      <div className="d-flex w-100 align-items-start">

                        <div style={{ width: '60%' }}>
                          <div className="flex-grow-1 text-center column-vertical fw-semibold">Mã khách hàng</div>
                          <div className="flex-grow-1 text-center column-vertical">
                            <CFormLabel className="mb-0">{customer.customer?.userCode}</CFormLabel>
                          </div>
                        </div>
                        
                        <div style={{ width: '60%' }}>
                          <div className="flex-grow-2 column-vertical fw-semibold">Họ tên khách hàng</div>
                          <div className="flex-grow-2 d-flex align-items-center column-vertical">
                            <div>
                              <div className="mb-0">{customer.customer?.fullName}</div>
                              <div className="text-muted">{customer.customer?.username}</div>
                            </div>
                            <div className="me-2">
                              <img
                                src={customer?.customer?.avatar?.[0] ?? noImage}
                                className="rounded"
                                height={50}
                                width={50}
                                alt="Avatar"
                              />
                            </div>
                          </div>
                        </div>

                        <div style={{ width: '60%' }}>
                          <div className="flex-grow-3 column-vertical fw-semibold">Thông tin liên hệ</div>
                          <div className="flex-grow-3 text-start column-vertical">
                            <div>Email: {customer.customer?.email}</div>
                            <div>SĐT: {customer.customer?.phoneNumber || 'Bổ sung sau'}</div>
                            <div>CCCD: {customer.customer?.IndentifyCode || 'Bổ sung sau'}</div>
                            <div>Địa chỉ: {customer.customer?.address || 'Bổ sung sau'}</div>
                          </div>
                        </div>

                        <div style={{ width: '60%' }}>
                          <div className="flex-grow-1 text-center column-vertical fw-semibold">Thời gian đăng kí</div>
                          <div className="flex-grow-1 text-center column-vertical">
                            <CFormLabel className="mb-0">{formatDateTime(customer.registrationTime)}</CFormLabel>
                          </div>
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </>
            ) : (
              <div>Không có khách hàng đăng ký</div>
            )}
          </TabPane>

          {hasPermission("8") && <TabPane tab="Lịch sử quản lý" key="4">
          {detailAuction?.managementAction?.length ? (
            <div>
              <div className="d-flex w-100 justify-content-between header-row mb-3">
                <div style={{ width: '17%' }}><strong>Mã nhân viên</strong></div>
                <div style={{ width: '20%' }}><strong>Tên nhân viên</strong></div>
                <div style={{ width: '20%' }}><strong>Chức vụ</strong></div> 
                <div style={{ width: '30%' }}><strong>Thực hiện hành vi</strong></div>
                <div style={{ width: '20%' }}><strong>Thời gian</strong></div>
              </div>

              <List
                className="demo-loadmore-list"
                itemLayout="horizontal"
                dataSource={detailAuction?.managementAction}
                renderItem={(item, index) => (
                  <List.Item
                  className="d-flex justify-content-start data-row"
                  onMouseEnter={() => setHoveredItem(index)} // Khi di chuột vào dòng
                  onMouseLeave={() => setHoveredItem(null)} // Khi bỏ chuột ra khỏi dòng
                  >
                    <div className="d-flex w-100 align-items-start">
                      <div style={{ width: '17%' }}>
                        <CFormLabel className="mb-0">{item.userBy?.phoneNumber || 'N/A'}</CFormLabel>
                      </div>

                      <div style={{ width: '20%' }}>
                        <CFormLabel className="mb-0">{item.userBy?.fullName} ({item.userBy?.username})</CFormLabel>
                      </div>

                      <div style={{ width: '20%' }}>
                        <CFormLabel className="mb-0">
                        {item.userBy.rolePermission?.role?.name || 'Loading...'}  {/* Render giá trị roleName đã lấy */}
                        </CFormLabel>
                      </div> 
                      
                      <div style={{ width: '30%' }}>
                        <CFormLabel className="mb-0">Đã {item?.action} phiên đấu giá </CFormLabel>
                      </div>

                      <div style={{ width: '20%' }}>
                        <CFormLabel className="mb-0">{moment(item?.timeLine).format('HH:mm || DD-MM-YYYY')}</CFormLabel>
                      </div>

                      {hoveredItem === index && (
                        <div className="d-flex gap-2">
                          {hasPermission("9") && <CButton key="details" size="sm" onClick={() => handleDeleteHistory(data._id, item._id)}>Xóa</CButton>}
                        </div>
                      )}
                    
                    </div>
                  </List.Item>
                )}
              />
            </div>
          ) : (
            <div>Không có lịch sử quản lý phiên đấu giá</div>
          )}
          </TabPane>}

        </Tabs>

      </CModalBody>

      <CModalFooter> 
        {type !== MODAL_TYPES.VIEW && (
          <CButton
            color={(type === MODAL_TYPES.APPROVE || type === MODAL_TYPES.UPDATE) ? 'success' : 'danger'}
            onClick={formik.handleSubmit}
          >
            {type === MODAL_TYPES.APPROVE && 'Duyệt'}
            {type === MODAL_TYPES.REJECT && 'Từ chối'}
            {type === MODAL_TYPES.UPDATE && 'Điều chỉnh'}
            {type === MODAL_TYPES.CANCEL && 'Hủy'}
            {/* {type === MODAL_TYPES.RECOVER && 'Khôi phục'} */}
            {type === MODAL_TYPES.END && 'Đóng phiên'}
          </CButton>
        )}
        <CButton color="secondary" onClick={onClose}>
          Đóng
        </CButton>
      </CModalFooter>
    </CModal>
  );
};

export default AuctionModal;