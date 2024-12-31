
import { CButton, CCardBody, CCardHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import UserManagerModal from './UserManagerModal.js';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import UserTableResult from './UserTableResult.js';
import employeeApi from '../../service/EmployeeService.js';
// import rolePermission from
import ModalQuestion from '../Nofitication/ModalQuestion.js';
import { useSelector } from 'react-redux';
function UserManager() {
  const tableHeaderValue = [

    {
      name: 'ID',
      selector: row => row?.phoneNumber,
      sortable: true,
      maxWidth: "150px"
    },
    {
      name: 'Tên nhân viên',
      selector: row => `${row?.fullName} (${row?.username})`, 
      sortable: true
    },
    
    {
      name: 'Chức vụ',
      // cell: () => 'Chưa có',
      selector: row => row.rolePermission?.role?.name || 'Chưa có', 
      sortable: true,
    },
    {
      name: 'Email',
      selector: row => row.email,
    },
    {
      name: 'Trạng thái',
      selector: row => row.status,
      sortable: true,
      maxWidth: "170px",
    },
  ]

  const [showModal, setShowModal] = useState(null); //show kiểu gì: xem sửa xóa
  const [modalValue, setModalValue] = useState({}); //lấy dòng dữ liệu trong bảng
  const [data, setData] = useState(null);
  const [allUser, setAllUser] = useState();
  const [isModalVisible, setIsModalVisible] = useState(false); //hiển thị bảng câu hỏi chắc chắn
  const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];
  
  const fetchData = async () => {
    await employeeApi.getAllEmployee().then(result => {
      setAllUser(result.data);
      console.log("employee: ", result.data)
    });
  }
  useEffect(() => {
    fetchData();
  }, []);
  useEffect(() => {
    setTimeout(() => {
      fetchData();
    }, "1000");
  }, [showModal])

  const handleDeleteClick = () => {
    if (modalValue.selectedCount != 1) {
      return toast.info('Vui lòng chỉ chọn 1 dòng dữ liệu ')
    }

    setIsModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (modalValue.selectedCount !== 1) {
      return toast.info('Vui lòng chọn 1 dòng dữ liệu để xóa');
    }
    console.log("value:", modalValue.selectedRows[0]._id)

    await employeeApi.delete(modalValue.selectedRows[0]._id);
    setModalValue(null);
    await fetchData();

    setIsModalVisible(false);
  };

  const handleCancelDelete = () => {
    setIsModalVisible(false);
  };

  const tableValues = {
    tableHeaderValue: tableHeaderValue,
    tableBodyValue: allUser,
  }

  const handleShowModal = (type) => {
    if (type === 'Xem' || type === 'Xóa' || type === 'Sửa') {
      if (modalValue.selectedCount != 1) {
        return toast.info('Vui lòng chọn 1 dòng dữ liệu ')
      }
      setData(modalValue)
      setShowModal(type);
    } else if (type === 'Thêm') {
      setData(null)
      setShowModal(type)
    }
  }

  const hasPermission = (permission) => {
    if (!Array.isArray(permissionValue)) {
        console.error("permissionValue không phải là một mảng");
        return false;
    }
    // console.log("Checking permission for:", permission);
    // console.log("Permission values from localStorage:", permissionValue);
    
    const hasPerm = permissionValue.includes(permission);
    
    // console.log("Permission found:", hasPerm);

    return hasPerm;
};
  return (
    <>
      <UserTableResult value={tableValues} selectValue={setModalValue} />
      <div className="d-flex flex-row docs-highlight mb-3 mt-3"  >
      
        {hasPermission("10") && (
          <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Xem')}>Xem</CButton>
        )}
        {hasPermission("11") && (
          <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Thêm')}>Thêm</CButton>
        )}
        {hasPermission("12") && (
          <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Sửa')}>Sửa</CButton>
        )}
        {hasPermission("13") && (
          <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleDeleteClick()}>Xóa</CButton>
        )}
        
      </div>
      <UserManagerModal type={showModal} setShowModal={setShowModal} data={data} />
      <ModalQuestion
        visible={isModalVisible}
        setVisible={setIsModalVisible}
        title="Xóa người dùng"
        message="Bạn có chắc chắn muốn xóa người dùng này?"
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
      />
    </>
  )
}

export default UserManager
