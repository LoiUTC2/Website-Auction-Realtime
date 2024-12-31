import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import auctionAPI from '../../service/AuctionService';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';
// import "../../scss/AuctionsComponentManager.scss"
function AuctionApproveModal(props) {
    let { type, setShowModal, data  } = props;
    const [show, setShow] = useState(false);
    const [auctionInfo, setAuctionInfo] = useState();
   
    useEffect(() => {
        type !== null ? setShow(true) : setShow(false);
    }, [type])
    useEffect(() => {
        
    }, [data]);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            _id: !!data ? data?._id: '',
            title: !!data ? data?.title : '',
            description: !!data ? data?.description : '',
            sellerName: !!data ? data?.sellerName : '',
            contactEmail: !!data ? data?.contactEmail : '',
            startTime: !!data ? data?.startTime || 'Đợi duyệt': 'Đợi duyệt',
            endTime: !!data ? data?.endTime || 'Đợi duyệt': 'Đợi duyệt',
            startingPrice: !!data ? data?.startingPrice : '',
            reservePrice: !!data ? data?.reservePrice || 'Đợi duyệt': 'Đợi duyệt',
            bidIncrement: !!data ? data?.bidIncrement : '',
            registrationOpenDate: !!data ? data?.registrationOpenDate || 'Đợi duyệt': 'Đợi duyệt',
            registrationCloseDate: !!data ? data?.registrationCloseDate || 'Đợi duyệt': 'Đợi duyệt',
            deposit: !!data ? data?.deposit : '',
            registrationFee: !!data ? data?.registrationFee : 'Đợi duyệt',
            registrationFee: !!data ? data.registrationFee || 'Đợi duyệt' : 'Đợi duyệt',
            productName: !!data ? data?.productName : '',
            productImages: !!data ? data?.productImages : '',
            productDescription: !!data ? data?.productDescription : '',
            productAddress: !!data ? data?.productAddress : '',
        },
        onSubmit: values => {
            handleSubmit(values)
        },
    });
    const handleSubmit = async (values) => {
        // if (!values.username || !values.email || !values.phoneNumber || !values.gender) {
        //     toast.error("Vui lòng điền đầy đủ thông tin");
        //     return;
        // };
        // if (values.passwordConfirm !== values.password) {
        //     toast.error("Mật khẩu không trùng khớp");
        //     return
        // }
        if (type == "Duyệt") {
            try {
                const approve = await auctionAPI.approve(values._id);
                if (approve.success){
                    setAuctionInfo(null)
                    setShow(false);
                }else{
                    return;
                }
            } catch (error) {
                console.error("LỗiD: ", error.message);
                const errorMessage = error.response?.data?.message || "Thêm nhân viên thất bại!";
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            } 
            
        } else if (type == "Từ chối") {
            try {
                const reject = await auctionAPI.reject(values._id, reason)
            } catch (error) {
                console.error("LỗiTC: ", error.message);
                const errorMessage = error.response?.data?.message || "Sửa nhân viên thất bại!";
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            }    
        }
        setShowModal(null);
        
    }
    return (
        <CModal
            show={show}
            onClose={() => { setShow(false); setShowModal(null); formik.resetForm(); }}
            visible={show}
            className='modal-xl'
        >
            <CModalHeader closeButton>Chi tiết phiên đấu giá</CModalHeader>
            <CModalBody className='p-4' >
                <CForm onSubmit={formik.handleSubmit} id='UserForm'>
                    <CRow>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Title</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className='input-readonly' value={formik.values.title} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Người đăng kí</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='sellerName' onChange={formik.handleChange} value={formik.values.sellerName} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Email</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} type='email' name='contactEmail' onChange={formik.handleChange} value={formik.values.contactEmail} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tên đấu phẩm</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='productName' onChange={formik.handleChange} value={formik.values.productName} />
                                </CCol>
                            </CRow>
                        </CCol>
                        
                        
                    
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Giá khởi điểm</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='startingPrice' onChange={formik.handleChange} value={formik.values.startingPrice} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Giá tối thiểu</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='reservePrice' onChange={formik.handleChange} defaultValue={formik.values.reservePrice} />
                                </CCol>
                            </CRow>
                        </CCol>
                        
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Bước giá tối thiểu</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='bidIncrement' onChange={formik.handleChange} defaultValue={formik.values.bidIncrement} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Thời gian mở đăng kí</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='registrationOpenDate' onChange={formik.handleChange} defaultValue={formik.values.registrationOpenDate} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Thời gian đóng đăng kí</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='registrationCloseDate' onChange={formik.handleChange} defaultValue={formik.values.registrationCloseDate} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Phí đặt cọc</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='deposit' onChange={formik.handleChange} defaultValue={formik.values.deposit} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Phí tham gia</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='registrationFee' onChange={formik.handleChange} defaultValue={formik.values.registrationFee} />
                                </CCol>
                            </CRow>
                        </CCol>
                                                
                        
                        
                    </CRow>
                </CForm>
            </CModalBody>
            <CModalFooter>
                {/* <CButton color="primary" type='submit' form='UserForm'>Lưu</CButton> */}
                <CButton
                    color="secondary"
                    onClick={() => { setShow(false); setShowModal(null) }}
                >Đóng</CButton>
            </CModalFooter>
        </CModal>
        
  );
};
export default AuctionApproveModal