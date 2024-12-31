
import { CButton, CCol, CForm, CFormInput, CFormLabel, CFormSelect, CModal, CModalBody, CModalFooter, CModalHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import { useFormik } from 'formik';
import roleApi from '../../service/RoleService';
import { Checkbox, Space, DatePicker } from 'antd';
import moment from 'moment';
import { toast } from 'react-toastify';


function RoleManagerModal(props) {
    let { type, setShowModal, data } = props;
    const [show, setShow] = useState(false);
    let value = data?.selectedRows?.[0] || null;
    const [rolePermissionInfo, setRolePermissionInfo] = useState();

    const userId = JSON.parse(localStorage.getItem('userId')); 

    useEffect(() => {
        type !== null ? setShow(true) : setShow(false);
    }, [type]);

    useEffect(() => {
        const fetchData = async () => {
            if (data !== null) {
                await roleApi.getRolePermissionByID(data?.selectedRows[0]?._id).then(result => {
                    setRolePermissionInfo(result.data)
                })
            } else {
                setRolePermissionInfo(null)
            }

        }
        fetchData();
        console.log("rolePermissiondata: ", data)

        console.log("rolePermission: ", rolePermissionInfo)
    }, [data]);

    const handleSubmit = async (values) => {
        if (!values.RoleName || !values.RoleDescription) {
            toast.error("Vui lòng nhập đầy đủ thông tin");
            return;
        };
        if (type == "Thêm") {
            try {
                const createRole = await roleApi.createRolePermission({
                    name: values.RoleName,
                    description: values.RoleDescription,
                    createdBy: userId,
                    })
                    console.log("Create: ", createRole)
                if(createRole.success){
                    setRolePermissionInfo(null)
                    setShow(false);
                }else{
                    toast.error(createRole.message || "Thêm vai trò thất bại!!")
                }                
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi sửa vai trò!";
                console.error("Lỗi: ", errorMessage);
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            }
        } else if (type == "Sửa") {
            try {
                const updateRole = await roleApi.updateRolePermission(values._id, {
                    name: values.RoleName,
                    description: values.RoleDescription,
                    updatedBy: userId,
                })
                if(updateRole.success){
                    setRolePermissionInfo(null)
                    setShow(false);
                }else{
                    toast.error(updateRole.message || "Sửa vai trò thất bại!!");
                    return;
                }                
            } catch (error) {
                const errorMessage = error.response?.data?.message || "Có lỗi xảy ra khi sửa vai trò!";
                console.error("Lỗi: ", errorMessage);
                toast.error(errorMessage);
                return { success: false, message: errorMessage };
            }
            
        } else if (type == "Xóa") {
            try {
                const deleteRole = await roleApi.deleteRolePermission(values._id);
                if(deleteRole.success){
                    setRolePermissionInfo(null)
                    setShow(false);
                }else{
                    toast.error(deleteRole.message || "Xóa vai trò thất bại!!")
                }                
            } catch (error) {
                toast.error(error?.response?.data?.message || "Có lỗi xảy ra khi xóa vai trò!");
            }
        }
        
        setShowModal(null);
    }

    const formik = useFormik({
        enableReinitialize: true,
        initialValues: {
            _id: !!rolePermissionInfo ? rolePermissionInfo?._id : '',

            RoleName: !!rolePermissionInfo ? rolePermissionInfo?.role?.name : '',
            RoleDescription: !!rolePermissionInfo ? rolePermissionInfo?.role?.description : '',
            RoleIsSystem: !!rolePermissionInfo ? rolePermissionInfo?.role?.isSystemRole : '',
            RoleCreatedBy: !!rolePermissionInfo ? rolePermissionInfo?.role?.createdBy : '',
            RoleCreatedAt: !!rolePermissionInfo ? rolePermissionInfo?.role?.createdAt : '',
            RoleUpdatedBy: !!rolePermissionInfo ? rolePermissionInfo?.role?.updatedBy : '',
            RoleUpdatedAt: !!rolePermissionInfo ? rolePermissionInfo?.role?.updatedAt : '',

            RolePermissionName: !!rolePermissionInfo ? rolePermissionInfo?.permissions?.name : '',
            RolePermissionDescription: !!rolePermissionInfo ? rolePermissionInfo?.permissions?.description : '',
            RolePermissionCreatedBy: !!rolePermissionInfo ? rolePermissionInfo?.permissions?.createdBy : '',
            RolePermissionCreatedAt: !!rolePermissionInfo ? rolePermissionInfo?.permissions?.createdAt : '',
            RolePermissionUpdatedBy: !!rolePermissionInfo ? rolePermissionInfo?.permissions?.updatedBy : '',
            RolePermissionUpdatedAt: !!rolePermissionInfo ? rolePermissionInfo?.permissions?.updatedAt : '',

            createdBy: !!rolePermissionInfo ? rolePermissionInfo?.createdBy?.username : '',
            createdAt: !!rolePermissionInfo ? rolePermissionInfo?.createdAt : '',
            updatedBy: !!rolePermissionInfo ? rolePermissionInfo?.updatedBy : '',
            updatedAt: !!rolePermissionInfo ? rolePermissionInfo?.updatedAt : '',
        },
        onSubmit: values => {
            handleSubmit(values)
        },
    });
    return (
        <CModal
            show={show}
            onClose={() => { setShow(false); setShowModal(null) }}
            visible={show}
            className='modal-xl'
        >
            <CModalHeader closeButton>{type} Vai Trò</CModalHeader>
            <CModalBody className='p-4' >
                <CForm onSubmit={formik.handleSubmit} id='RoleForm'>
                    <CRow>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Mã chức vụ</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className='input-readonly' value={formik.values._id} />
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Tên chức vụ</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='RoleName' value={formik.values.RoleName} onChange={formik.handleChange}/>
                                </CCol>
                            </CRow>
                        </CCol>
                        <CCol md="6" className='mb-3'>
                            <CRow>
                                <CCol md="4" >
                                    <CFormLabel className='mt-1'>Mô tả</CFormLabel>
                                </CCol>
                                <CCol md="7" >
                                    <CFormInput className={type === 'Xem' ? 'input-readonly' : ''} name='RoleDescription' value={formik.values.RoleDescription} onChange={formik.handleChange}/>
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
                                        <DatePicker size='large' className='w-100 input-readonly' value={moment(formik.values.createdAt)} format="HH:mm || DD/MM/YYYY"/>
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
                                <CFormInput className="input-readonly" value={formik.values.createdBy} />
                                </CCol>
                            </CRow>
                        </CCol>

                        {/* <CCol md="5">
                            <Space direction="vertical" size={17} className="w-100">
                                <label className="form-label">Đặt làm mặc định</label>
                                <Checkbox
                                    checked={!!formik.values.RoleIsSystem} // Lấy giá trị hiện tại
                                    onChange={(e) => formik.setFieldValue("RoleIsSystem", e.target.checked)} // Cập nhật giá trị
                                >
                                    Làm mặc định
                                </Checkbox>
                            </Space>
                        </CCol> */}

                    </CRow>
                </CForm>

            </CModalBody>
            <CModalFooter>
                <CButton color="primary" type='submit' form='RoleForm'>Lưu</CButton>{' '}
                <CButton
                    color="secondary"
                    onClick={() => { setShow(false); setShowModal(null) }}
                >Đóng</CButton>
            </CModalFooter>
        </CModal>

    )
}

export default RoleManagerModal
