
import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CRow } from '@coreui/react';
import { bool } from 'prop-types';
import React, { useEffect, useState } from 'react'
import { DatePicker, Radio, Space } from 'antd';
import moment from 'moment';
import { useFormik } from 'formik';
// import invoiceApi from 'src/service/InvoiceService';
import noImage from '../../../assets/images/no-image.jpg'
import { VND } from '../../../utils/validateField';
function SalesManagerModal(props) {
    let { type, setShowModal, invoiceId } = props;
    console.log(invoiceId)
    const [show, setShow] = useState(false);
    //let value = data?.selectedRows?.[0] || null;
    const [productList, setProductList] = useState([]);
    const [invoiceInfo, setInvoiceInfo] = useState();


    useEffect(() => {
        type !== null ? setShow(true) : setShow(false);
    }, [type]);

    // useEffect(() => {
    //     invoiceId && invoiceApi.getByID(invoiceId).then(result => {
    //         console.log('from modal:',result)
    //         if (result.success)
    //         {
    //             setInvoiceInfo(result.data)
    //             setProductList(result.data.invoiceDetail)
    //             }
    //     })
    // }, [invoiceId]);
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            InvoiceID: !!invoiceInfo ? invoiceInfo?.invoiceID : '',
            Customer: !!invoiceInfo ? invoiceInfo?.customer : '',
            Quantity: !!invoiceInfo ? invoiceInfo?.partner : '',
            StatusInvoice: !!invoiceInfo ? invoiceInfo?.statusInvoice : 3,
            User: !!invoiceInfo ? invoiceInfo?.userName : JSON.parse(localStorage.getItem("userinfo")).displayname || '',
            Note: !!invoiceInfo ? invoiceInfo?.note : '',
            Quantity: !!invoiceInfo ? invoiceInfo?.quantity : 0,
            VoucherCode: !!invoiceInfo ? invoiceInfo?.voucherCode : '',
            TotalDiscount: !!invoiceInfo ? invoiceInfo?.totalDiscount : 0,
            Location: !!invoiceInfo ? invoiceInfo?.location : '',
            Total: !!invoiceInfo ? invoiceInfo?.subtotal : 0,
            CreatedAt: !!invoiceInfo ? invoiceInfo?.createAt : new Date().toLocaleDateString()
        },
        onSubmit: values => {
            // handleSubmit(values)

        },
    })
    return (
        <CModal
            show={show}
            onClose={() => { setShow(false); setShowModal(null) }}
            visible={show}
            className='modal-xl ' 
            scrollable={true}
        >
            <CModalHeader closeButton>Chi tiết hóa đơn</CModalHeader>
            <CModalBody className='p-4' >
                <CForm >
                    <CRow>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Số hóa đơn</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className='input-readonly' value={formik.values.InvoiceID} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tên khách hàng</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.Customer} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Số lượng đơn hàng</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.Quantity} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tổng tiền</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={VND.format(formik.values.Total + formik.values.TotalDiscount)}/>
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Khuyến mãi</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.VoucherCode} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tổng khuyến mãi</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={VND.format(formik.values.TotalDiscount)} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tổng đơn hàng</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={VND.format(formik.values.Total)} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Địa chỉ</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.Location} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Ngày tạo</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <Space direction="vertical" size={17} className='w-100 '>
                                            <DatePicker size='large' className='w-100 input-readonly' value={moment(formik.values.CreatedAt, 'DD/MM/YYYY')}/>
                                        </Space>
                                    </CCol>
                                </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Nhân viên</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.User} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Trạng thái</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormSelect className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.StatusInvoice}>
                                        <option value={3}>Chờ duyệt</option>
                                        <option value={4}>Duyệt</option>
                                        <option value={5}>Từ chối</option>
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </CCol>

                    </CRow>
                    <CRow md="6 " className='overflow-y-scroll mt-3' style={{ maxHeight: "500px" }}>
                        <CFormLabel className='fs-4 fixed text-center w-100' >Chi tiết đơn hàng</CFormLabel>
                        <CRow md={12} className='mb-2 fw-medium'>
                            <CCol md={5} className='text-center'>Sản phẩm</CCol>
                            <CCol md={2}>Số lượng</CCol>
                            <CCol md={2}>Đơn giá</CCol>
                            <CCol md={2}>Tổng giá trị</CCol>
                        </CRow>
                        {productList && productList.map((item) => (
                            <CRow md={12} className='mb-3'>
                                <CCol md={2}>
                                    <img src={item.urlImage || noImage} alt='Not found' className='img-thumbnail' />
                                </CCol>
                                <CCol md={3}>
                                    <CFormLabel className='fs-6 text-center overflow-hidden align-items-center mt-auto '>{item.productName}</CFormLabel>
                                </CCol>
                                <CCol md={2}>{item.quantity}</CCol>
                                <CCol md={2}>{VND.format(item.price)}</CCol>
                                <CCol md={2}>{VND.format(item.subTotal)}</CCol>
                            </CRow>
                        ))}
                    </CRow>
                </CForm>

            </CModalBody>
            <CModalFooter>
                <CButton color="primary">Lưu</CButton>{' '}
                <CButton
                    color="secondary"
                    onClick={() => { setShow(false); setShowModal(null) }}
                >Đóng</CButton>
            </CModalFooter>
        </CModal>

    )
}

export default SalesManagerModal
