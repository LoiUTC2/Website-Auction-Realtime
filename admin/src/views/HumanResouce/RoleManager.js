
import { CButton, CCardBody, CCardHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import RoleManagerModal from './RoleManagerModal.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import RoleTableResult from './RoleTableResult.js';
import PermissionModal from './PermissionModal.js';
import roleApi from '../../service/RoleService.js';
import moment from 'moment';

function RoleManager() {
    const [allRole, setAllRole] = useState();
    const [showModal, setShowModal] = useState(null); //show kiểu gì
    const [showPermissionModal, setShowPermissionModal] = useState(null);
    const [modalValue, setModalValue] = useState({}); //dữ liệu dòng dã chọn
    const [data, setData] = useState(null);
    const [roleSelected, setRoleSelected] = useState();
    const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];
    useEffect(() => {
        fetchData();
        console.log("role: ", allRole)

    }, [])

    const fetchData = async () => {
        await roleApi.getAllRolePermission().then(result => {
            setAllRole(result.data)
            
        });
    }
    
    //reset data
    useEffect(() => {
        setModalValue({})
        setTimeout(() => {
            fetchData();
        },"1000")
        console.log("role: ", allRole)
    }, [showModal])
    
    const tableHeaderValue = [

        {
            name: 'Mã chức vụ',
            selector: row => row._id,
            sortable: true,
            maxWidth: "170px"
        },
        {
            name: 'Tên chức vụ',
            selector: row => row.role?.isSystemRole 
            ? `${row.role?.name} ⭐` 
            : row.role?.name,
            sortable: true,
            maxWidth: "200px"

        },
        {
            name: 'Mô tả',
            selector: row => row.description,
            sortable: true,
            maxWidth: "500px"

        },
        {
            name: 'Ngày tạo',
            selector: row => moment(row.createdAt).format('HH:mm || DD/MM/YYYY '),
            sortable: true,
            maxWidth: "170px"
        },
        {
            name: 'Người tạo',
            selector: row => row.createdBy.username,
            sortable: true,
            maxWidth: "170px"
        },
    ]
    const tableValues = {
        tableHeaderValue:tableHeaderValue,
        tableBodyValue:allRole,
    }

    const handleShowPermissionModal = () => {
        if (modalValue.selectedCount != 1) {
            return toast.info('Vui lòng chỉ chọn 1 dòng dữ liệu ')
        }
        setRoleSelected(modalValue)
        setShowPermissionModal(!showPermissionModal);
    }
    const handleShowModal = (type) => {
        if (type === 'Xem' || type === 'Xóa' || type === 'Sửa') {
            if (modalValue.selectedCount != 1) {
                return toast.info('Vui lòng chỉ chọn 1 dòng dữ liệu ');
            }
            setData(modalValue)
            setShowModal(type);
        } else if (type === 'Thêm') {
            setData(null)
            setShowModal(type)
        }
    }
    const hasPermission = (permission) => permissionValue.includes(permission);

    return (
        <>
            <RoleTableResult value={tableValues} selectValue={setModalValue} />
            
            <div className="d-flex flex-row docs-highlight mb-3 mt-3"  >
            {hasPermission('14') && (
                <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Xem')} >Xem</CButton>
                )}
            {hasPermission('15') && (
                <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Thêm')}>Thêm</CButton>
                )}
            {hasPermission('16') && (
                <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Xóa')}>Xóa</CButton>
                )}
            {hasPermission('17') && (
                <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Sửa')}>Sửa</CButton>
                )}
            {hasPermission('18') && (
                <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={()=>handleShowPermissionModal()}>Phân quyền</CButton>
                )}
            </div>

            <RoleManagerModal type={showModal} setShowModal={setShowModal} data={data} />
            <PermissionModal setShowModal={ setShowPermissionModal} type={showPermissionModal} data={roleSelected} />
        </>
    )
}

export default RoleManager
