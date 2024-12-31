import { CButton, CCardBody, CCardHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import ProductTableResult from './ProductTableResult';
import ProductModal from './ProductModal';
import productApi from '../../service/ProductService';
import ModalQuestion from '../Nofitication/ModalQuestion';
import { VND } from '../../utils/validateField';
function ProductManager() {
  const tableHeader = [

    {
      name: 'ID',
      selector: row => row.productID,
      sortable: true,
      maxWidth: "100px"
    },
    {
      name: 'Tên sản phẩm',
      selector: row => row.productName,
      sortable: true
    },
    {
      name: 'Giá bán',
      selector: row => row.price,
      cell:(row)=>(VND.format(row.price) )
    },
    {
      name: 'Giới tính',
      selector: row => row.genderName,
    },
    {
      name: 'Tag',
      selector: row => row.tagName,
    },
    {
      name: 'Ngày tạo',
      selector: row => row.createdAt,
      sortable: true,
      maxWidth: "170px"
    },
    {
      name: 'Người tạo',
      selector: row => row.createdBy,
      sortable: true,
      maxWidth: "170px"
    },
  ]

  const [showModal, setShowModal] = useState(null);
  const [modalValue, setModalValue] = useState({});
  const [data, setData] = useState(null);
  const [allProduct, setAllProduct] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];

  useEffect(() => {
    fetchData();
  }, [])
  useEffect(() => {
    setModalValue(null)
    setTimeout(() => {
      fetchData();
    }, 1000);
  },[showModal])

  const fetchData = async () => {
    await productApi.getAllProduct().then(result=>{
      if (result.success) {
      setAllProduct(result.data)
       }
     })
  }

  const handleShowModal = (type) => {
    if (type === 'Xem' || type === 'Xóa' || type === 'Sửa') {
      if (modalValue == null || modalValue.selectedCount != 1) {
        return toast.info('Vui lòng chỉ chọn 1 dòng dữ liệu ')
      }
      setData(modalValue)
      setShowModal(type);
    } else if (type === 'Thêm') {
      setData(null)
      setShowModal(type)
    }
  }
  const tableValues = {
    tableHeader: tableHeader,
    tableBody: allProduct,
  }
  const handleDeleteClick = () => {
    if (modalValue==null || modalValue.selectedCount !== 1 ) {
      return toast.info('Vui lòng chọn 1 dòng dữ liệu để xóa');
    }
    setIsModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    await productApi.delete(modalValue.selectedRows[0].productID);
    setModalValue(null);
    await fetchData();

    setIsModalVisible(false);
  };
  
  const handleCancelDelete = () => {
    setIsModalVisible(false);
  };
  
  const hasPermission = (permission) => permissionValue.includes(permission);

  return (
    <>
      {!!allProduct && <ProductTableResult value={tableValues} selectValue={setModalValue} />}

      <div className="d-flex flex-row docs-highlight mb-3 mt-3"  >
        {hasPermission(10) && (
        <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Xem')} >Xem</CButton>
        )}
        {hasPermission(11) && (
       <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Thêm')}>Thêm</CButton>
        )}
        {hasPermission(12) && (
        <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Sửa')}>Sửa</CButton>
        )}
        {hasPermission(13) && (
        <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={()=>handleDeleteClick()}>Xóa</CButton>
        )}
        
      </div>
      <ProductModal type={showModal} setShowModal={setShowModal} data={data} />
      <ModalQuestion
              visible={isModalVisible}
              setVisible={setIsModalVisible}
              title="Xóa sản phẩm"
              message="Bạn có chắc chắn muốn xóa sản phẩm này?"
              onConfirm={handleConfirmDelete}
              onCancel={handleCancelDelete}/>
    </>
  )
}

export default ProductManager
