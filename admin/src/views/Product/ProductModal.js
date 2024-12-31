import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CRow, CSpinner } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import { DatePicker, Radio, Space } from 'antd';
import { useDropzone } from 'react-dropzone';
import productApi from '../../service/ProductService';
import moment from 'moment';
import { useFormik } from 'formik';
import { toast } from "react-toastify";
import { SyncLoader } from 'react-spinners';
import { cilDelete } from '@coreui/icons';
import CIcon from '@coreui/icons-react';
function ProductModal(props) {
    let { type, setShowModal, data } = props;
    const [show, setShow] = useState(false);
    let value = data?.selectedRows?.[0] || null;
    const [productInfo, setProductInfo] = useState();
    const [productImages, setProductImages] = useState([]);
    const [pending, setPending] = useState(false);
    const [newImage, setNewImage] = useState([]);
    const [dialShape, setDialShape] = useState([]);
    const [dialSize, setDialSize] = useState([]);
    const [waterResistance, setWaterResistance] = useState([]);
    const [brand, setBrand] = useState([]);
    const [strapMaterial, setStrapMaterial] = useState([]);

    useEffect(() => {
        type !== null ? setShow(true) : setShow(false);
    }, [type]);

    useEffect(() => {
        const fetchData = async () => {

            try {
                setPending(true)
                if (data !== null) {
                    await productApi.getByID(data?.selectedRows[0]?.productID).then(result => {
                        setProductInfo(result.data.product)
                        setProductImages(result.data.productImage)
                    })
                }
                else {
                    setProductInfo(null)
                }
                const [dialShapeData, dialSizeData, waterResistanceData, strapMaterialData, brandData] = await Promise.all([
                    // dialShapeApi.getAll(),
                    // dialSizeApi.getAll(),
                    // waterResistanceApi.getAll(),
                    // strapMaterialApi.getAll(),
                    // brandApi.getAll()
                ]).then(setPending(false));
                setDialShape(dialShapeData.data);
                setDialSize(dialSizeData.data);
                setWaterResistance(waterResistanceData.data);
                setStrapMaterial(strapMaterialData.data);
                setBrand(brandData.data);
            } catch (error) {
                toast.error("Lỗi không xác định")
            }


        }
        fetchData();
    }, [data]);

    const {
        acceptedFiles,
        fileRejections,
        getRootProps,
        getInputProps
    } = useDropzone({
        accept: {
            'image/jpeg': [],
            'image/png': []
        }
    });
    const acceptedFileItems = acceptedFiles.map(file => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
        </li>
    ));

    const fileRejectionItems = fileRejections.map(({ file, errors }) => (
        <li key={file.path}>
            {file.path} - {file.size} bytes
            <ul>
                {errors.map(e => (
                    <li key={e.code}>{e.message}</li>
                ))}
            </ul>
        </li>
    ));

    // useEffect(() => {
    //     type !== null ? setShow(true) : setShow(false);
    // }, [type]);
    // console.log(acceptedFileItems)
    // const getUploadParams = ({ meta }) => { return { url: 'https://httpbin.org/post' } }

    // // called every time a file's `status` changes
    // const handleChangeStatus = ({ meta, file }, status) => { console.log(status, meta, file) }

    // // receives array of files that are done uploading when submit button is clicked
    // const handleSubmit = (files) => { console.log(files.map(f => f.meta)) }

    const handleSubmit = (values) => {
        if (!values.ProductName || !values.OriginPrice || !values.SellPrice) {
            toast.error("Dữ liệu không hợp lệ");
        };
        setPending(true)
        if (type == "Thêm") {
            const createRole = productApi.create(values, acceptedFiles).then((result) => {
                setPending(false);
                if (result.success) {
                    setShowModal(null);
                    setProductInfo(null);
                }
            })
        } else if (type == "Sửa") {
            productImages && productImages.forEach(item => {
                newImage.push(item.imagesID)
            })
            const updateRole = productApi.update(values, acceptedFiles, newImage).then(result => {
                if (result.success) {
                    setPending(false);
                    setShowModal(null);
                    setProductInfo(null);
                }
            })
        }

        //setShowModal(null);
    }

    const handleDeleteImage = (id) => {
        console.log(id)
        setProductImages((prev) => {
            return prev.filter((image) => image.imagesID !== id);
        });
    };
    const handleSelectOrigin = (id) => {
        const brandSelected = brand && brand.find((item) => item.brandID == id);
        return brandSelected ? brandSelected.origin : '';
    }
    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            ProductID: !!productInfo ? productInfo?.productID : '',
            ProductName: !!productInfo ? productInfo?.productName : '',
            Description: !!productInfo ? productInfo?.description : '',
            OriginPrice: !!productInfo ? productInfo?.originPrice : '',
            SellPrice: !!productInfo ? productInfo?.sellPrice : '',
            TotalRating: !!productInfo ? productInfo?.totalRating : '',
            BrandID: !!productInfo ? productInfo?.brandID : 1,
            Original: !!productInfo ? productInfo?.original : 1,
            GenderID: !!productInfo ? productInfo?.genderID : 1,
            DialSizeID: !!productInfo ? productInfo?.dialSizeID : 1,
            StrapMaterialID: !!productInfo ? productInfo?.strapMaterialID : 1,
            WaterResistanceID: !!productInfo ? productInfo?.waterResistanceID : 1,
            DialShapeID: !!productInfo ? productInfo?.dialShapeID : 1,
            Color: !!productInfo ? productInfo?.color : '',
            Tag: !!productInfo ? productInfo?.tagID : 1,
            StatusID: !!productInfo ? productInfo?.statusID : 1,
            CreatedAt: !!productInfo ? productInfo?.createdAt : new Date().toLocaleDateString('en-GB'),
            createdBy: !!productInfo ? productInfo?.createdBy : JSON.parse(localStorage.getItem("userinfo")).displayname || '',
            Import_count: !!productInfo ? productInfo?.import_count : 0,
            Sold_count: !!productInfo ? productInfo?.sold_count : 0,
        },
        onSubmit: values => {
            handleSubmit(values)
        },
    });
    const cssOverride = {
        display: 'flex',
        margin: '20px auto',
        height: '80px'
    };
    return (
        <CModal
            show={show}
            onClose={() => { setShow(false); setShowModal(null); setProductInfo(null); setProductImages([])}}
            visible={show}
            className='modal-xl overflow-scroll max-vh-100'
            scrollable
        >{pending === true ?
            <SyncLoader
                color="#36d7b7"
                loading={pending}
                cssOverride={cssOverride}
            />
            :
            <>

                <CModalHeader closeButton>{type} sản phẩm</CModalHeader>
                <CModalBody className='p-4 ' >
                    <CForm id='productForm' onSubmit={formik.handleSubmit}>
                        <CRow>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>ID</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput name='ProductID' className='input-readonly' value={formik.values.ProductID} />
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Tên sản phẩm</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput name='ProductName' className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.ProductName} onChange={formik.handleChange} />
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Giá gốc</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                            <CFormInput name='OriginPrice' className={type === 'Xem' ? 'input-readonly' : ''} type='number' value={formik.values.OriginPrice}
                                                onChange={formik.handleChange}
                                            />
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Giá bán</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput name='SellPrice' className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.SellPrice} onChange={formik.handleChange} />
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Tag</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='Tag' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.Tag}>
                                            <option value={1}>Sản phẩm bán chạy</option>
                                            <option value={2}>Sản phẩm mới</option>
                                            <option value={3}>Sản phẩm nổi bật</option>
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Giới tính</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='GenderID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.GenderID}>
                                            <option value={1}>Nam</option>
                                            <option value={2}>Nữ</option>
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Hãng</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='BrandID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.BrandID}>
                                            {brand && brand.map(item => (
                                                <option value={item.brandID}>{item.brandName}</option>
                                            ))}
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Xuất xứ</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput className='input-readonly' value={handleSelectOrigin(formik.values.BrandID)} />
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Màu sắc</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput name='Color' className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.Color} onChange={formik.handleChange} />
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Chất liệu dây</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='StrapMaterialID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.StrapMaterialID}>
                                            {
                                                strapMaterial && strapMaterial.map(item => (
                                                    <option value={item.strapMaterialID}>{item.strapMaterialName}</option>
                                                ))
                                            }
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Kích cỡ mặt kính</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='DialSizeID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.DialSizeID}>
                                            {
                                                dialSize && dialSize.map(item => (
                                                    <option value={item.dialSizeID}>{item.dialSizeName}</option>
                                                ))
                                            }
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Hình dạng mặt kính</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='DialSizeID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.DialShapeID}>
                                            {
                                                dialShape && dialShape.map(item => (
                                                    <option value={item.dialShapeID}>{item.dialShapeName}</option>
                                                ))
                                            }
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Mức chống nước</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='WaterResistanceID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.WaterResistanceID}>
                                            {
                                                waterResistance && waterResistance.map(item => (
                                                    <option value={item.waterResistanceID}>{item.waterResistanceName}</option>
                                                ))
                                            }
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Trạng thái</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect name='StatusID' onChange={formik.handleChange} className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.StatusID}>
                                            <option value={1}>Kích hoạt</option>
                                            <option value={2}>Ngừng kích hoạt</option>
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Mô tả</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput name='Description' className={type === 'Xem' ? 'input-readonly' : ''} value={formik.values.Description} onChange={formik.handleChange} />
                                    </CCol>
                                </CRow>
                            </CCol>
                            {
                                type == 'Xem' && <>

                                    <CCol md="6" className='mb-3'>
                                        <CRow>
                                            <CCol md="4" >
                                                <CFormLabel className='mt-1'>Số lượng đã nhập</CFormLabel>
                                            </CCol>
                                            <CCol md="7" >
                                                <CFormInput name='Import_count' className={'input-readonly' } value={formik.values.Import_count} />
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                    <CCol md="6" className='mb-3'>
                                        <CRow>
                                            <CCol md="4" >
                                                <CFormLabel className='mt-1'>Số lượng đã bán</CFormLabel>
                                            </CCol>
                                            <CCol md="7" >
                                                <CFormInput name='Sold_count' className={'input-readonly'  } value={formik.values.Sold_count} />
                                            </CCol>
                                        </CRow>
                                    </CCol>
                                </>
                            }

                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Ngày tạo</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <Space direction="vertical" size={17} className='w-100 '>
                                            <DatePicker size='large' className='w-100 input-readonly' value={moment(formik.values.CreatedAt, 'dd/MM/yyyy')} />
                                        </Space>
                                    </CCol>
                                </CRow>
                            </CCol>
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Người tạo</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormInput className='input-readonly' value={formik.values.createdBy} />
                                    </CCol>
                                </CRow>
                            </CCol>

                        </CRow>
                    </CForm>
                    <CForm className='mt-3 border border-secondary p-3 '>
                        <CRow className=''>Hình ảnh sản phẩm</CRow>
                        <CRow>
                            <CCol md="12" className='mb-3 '>
                                <CRow>
                                    <CCol md="2" >
                                        <CFormLabel className='mt-1 fw-semibold'>Thêm hình ảnh</CFormLabel>
                                    </CCol>
                                    <CCol md="10" >
                                        <CCol {...getRootProps({ className: 'dropzone border border-dashed border-light rounded p-2' })}>
                                            <CFormInput {...getInputProps()} />
                                            <p>Kéo thả ảnh tại đây, hoặc click để chọn ảnh (*.jpeg, .png)</p>

                                        </CCol>
                                        {acceptedFileItems && acceptedFileItems.map((file) => (
                                            <CRow>
                                                <CFormLabel className='mx-3 mt-2'>{file.key}</CFormLabel>
                                            </CRow>
                                        ))}

                                    </CCol>
                                </CRow>
                                <CRow md="12" className='mt-3'>
                                    {productImages.map((file) => (
                                        <CCol md="4" className='mt-2'>
                                            <img src={file.imagesUrl} class="img-thumbnail" alt="Not found" />
                                            {type != 'Xem' ? <CIcon icon={cilDelete} className='z-3 position-absolute fs-2' size='lg' role='button' onClick={() => handleDeleteImage(file.imagesID)} /> : ''}
                                        </CCol>
                                    ))}
                                </CRow>

                            </CCol>
                        </CRow>
                    </CForm>
                </CModalBody>
                <CModalFooter>
                    <CButton color="primary" type='submit' form='productForm'>Lưu</CButton>{' '}
                    <CButton
                        color="secondary"
                        onClick={() => { setShow(false); setShowModal(null) }}
                    >Đóng</CButton>
                </CModalFooter></>
            }



        </CModal>


    )
}

export default ProductModal
