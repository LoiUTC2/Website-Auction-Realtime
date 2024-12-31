
import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import rolePermissionApi from '../../service/RoleService';
import employeeApi from '../../service/EmployeeService';
import { useFormik } from 'formik';
import { toast } from 'react-toastify';

function UserManagerModal(props) {
    let { type, setShowModal, data  } = props;
    const [show, setShow] = useState(false);
    const [userInfo, setUserInfo] = useState();
    const [rolePermissionByID, setrolePermissionByID] = useState();
    const [rolePermission, setrolePermission] = useState([]);

    useEffect(() => {
        type !== null ? setShow(true) : setShow(false);
    }, [type])
    useEffect(() => {
        const fetchData = async () => {
            if (data !== null ) {
                await employeeApi.getByID(data?.selectedRows[0]?._id).then(result => {
                    setUserInfo(result.data) 
                    setrolePermissionByID(result.data.rolePermission);
                })
            } else {
                setUserInfo(null)
            }
            await rolePermissionApi.getAllRolePermission().then(result => {
                setrolePermission(result.data)
            })

        }
        fetchData();
        // console.log("em: ", userInfo);
        // console.log("ro: ", rolePermission);

    }, [data]);

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            _id: !!userInfo ? userInfo?._id: '',
            email: !!userInfo ? userInfo?.email : '',
            username: !!userInfo ? userInfo?.username : '',
            fullName: !!userInfo ? userInfo?.fullName : '',
            password: '',
            status: !!userInfo ? userInfo?.status : '',
            phoneNumber: !!userInfo ? userInfo?.phoneNumber : '',
            gender: !!userInfo ? userInfo?.gender : 'Nam',
            address: !!userInfo ? userInfo?.address : '',
            rolePermission: !!userInfo ? userInfo?.rolePermission : '6750149f148318b86e3eb569',
            passwordConfirm: ''
        },
        onSubmit: values => {
            handleSubmit(values)

        },
    });

    const getRoleNameById = (rolePermissionId) => {
        const role = rolePermission.find(r => r._id === rolePermissionId);
        return role ? role.role?.name : 'Unknown Role';
      };

    const handleSubmit = async (values) => {
        if (!values.username || !values.email || !values.phoneNumber || !values.gender) {
            toast.error("Vui lòng điền đầy đủ thông tin");
            return;
        };
        if (values.passwordConfirm !== values.password) {
            toast.error("Mật khẩu không trùng khớp");
            return
        }
        if (type == "Thêm") {
            try {
                const createUSer = await employeeApi.create({
                    fullName: values.fullName.trim() === '' ? 'Bổ sung sau' : values.fullName,
                    username: values.username,
                    email: values.email,
                    gender: values.gender,
                    address: values.address.trim() === '' ? 'Bổ sung sau' : values.address,
                    password: values.password,
                    phoneNumber: values.phoneNumber,
                    rolePermission: values.rolePermission,
                });
                if (createUSer.success){
                    setUserInfo(null)
                    setShow(false);
                }else{
                    return;
                }
            } catch (error) {
                console.error("Lỗi: ", error.message);
                const errorMessage = error.response?.data?.message || "Thêm nhân viên thất bại!";
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            } 
            
        } else if (type == "Sửa") {
            try {
                const updateUser = await employeeApi.update(values._id, values)
            } catch (error) {
                console.error("Lỗi: ", error.message);
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
            onClose={() => { setShow(false); setShowModal(null); setUserInfo(null); formik.resetForm(); }}
            visible={show}
            className='modal-xl'
        >
            <CModalHeader closeButton>{type} người dùng</CModalHeader>
            <CModalBody className='p-4' >
                <CForm onSubmit={formik.handleSubmit} id='UserForm'>
                    <CRow>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>ID</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className='input-readonly' value={formik.values.phoneNumber} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Họ tên nhân viên</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='fullName' onChange={formik.handleChange} value={formik.values.fullName} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tên gọi</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='username' onChange={formik.handleChange} value={formik.values.username} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Email</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} type='email' name='email' onChange={formik.handleChange} value={formik.values.email} />
                                </CCol>
                            </CRow>
                        </CCol>
                        
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Chức vụ</CFormLabel>
                                </CCol>
                                <CCol md="7" >

                                    <CFormSelect className={type === 'Xem' ? 'input-readonly' : ''} 
                                                name='rolePermission' 
                                                onChange={formik.handleChange} 
                                                // onChange={(e) => formik.setFieldValue('rolePermission', e.target.value)}
                                                value={formik.values.rolePermission._id} defaultValue="">  
                                        <option value="">-- Chọn chức vụ --</option>
                                        {rolePermission && rolePermission.map(item => (
                                            <option key={item?._id} value={item?._id}>{getRoleNameById(item?._id)}</option>

                                        ))}
                                            
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </CCol> 
                    
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Số điện thoại</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='phoneNumber' onChange={formik.handleChange} value={formik.values.phoneNumber} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Địa chỉ</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='address' onChange={formik.handleChange} defaultValue={formik.values.address} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Giới tính</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormSelect className={type === 'Xem' ? 'input-readonly' : ''} name='gender' onChange={formik.handleChange} value={formik.values.gender}>
                                        {/* <option value={0}>Chọn</option>  */}
                                        <option value={'Nam'}>Nam</option>
                                        <option value={'Nữ'}>Nữ</option>
                                        <option value={'Khác'}>Khác</option>
                                    </CFormSelect>
                                </CCol>
                            </CRow>
                        </CCol>

                        {data && (
                            <CCol md="6" className='mb-3'>
                                <CRow>
                                    <CCol md="4" >
                                        <CFormLabel className='mt-1'>Trạng thái</CFormLabel>
                                    </CCol>
                                    <CCol md="7" >
                                        <CFormSelect className={type === 'Xem' ? 'input-readonly' : ''} name='status' onChange={formik.handleChange} value={formik.values.status }>
                                            <option value={'Hoạt động'}>Hoạt động</option>
                                            <option value={'Không hoạt động'}>Không hoạt động</option>
                                            <option value={'Cấm'}>Cấm</option>
                                        </CFormSelect>
                                    </CCol>
                                </CRow>
                            </CCol>
                        )}
                                                
                        {!data && (
                            <>
                                <CCol md="6" className='mb-3'>
                                    <CRow>
                                        <CCol md="4" >
                                            <CFormLabel className='mt-1' >Mật khẩu đăng nhập</CFormLabel>
                                        </CCol>
                                        <CCol md="7" >
                                            <CFormInput name='password' type='password' value={formik.values.password} onChange={formik.handleChange} />
                                        </CCol>
                                    </CRow>
                                </CCol>

                                <CCol md="6" className='mb-3'>
                                    <CRow>
                                        <CCol md="4" >
                                            <CFormLabel className='mt-1'>Nhập lại mật khẩu</CFormLabel>
                                        </CCol>
                                        <CCol md="7" >
                                            <CFormInput name='passwordConfirm' value={formik.values.passwordConfirm} onChange={formik.handleChange} type='password' />
                                        </CCol>
                                    </CRow>
                                </CCol>
                            </>

                        )}

                    </CRow>
                </CForm>

            </CModalBody>
            <CModalFooter>
                <CButton color="primary" type='submit' form='UserForm'>Lưu</CButton>
                <CButton
                    color="secondary"
                    onClick={() => { setShow(false); setShowModal(null) }}
                >Đóng</CButton>
            </CModalFooter>
        </CModal>

    )
}

export default UserManagerModal
