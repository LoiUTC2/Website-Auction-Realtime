
import { CButton, CCardBody, CCardHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react'
import SalesManagerModal from './SalesManagerModal';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SaleTable from './SalesTable';
import invoiceApi from '../../../service/InvoiceService';
import { VND } from '../../../utils/validateField';

function SalesManager() {
  const [showModal, setShowModal] = useState(null);
  const [modalValue, setModalValue] = useState({});
  const [data, setData] = useState(null);
  const [invoicePending, setInvoicePending] = useState([]);
  const [invoiceList, setInvoiceList] = useState([]);
  const [invoiceSelected, setInvoiceSelected] = useState();
  const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];

  useEffect(() => {
    fetchData()
  }, []);
  const fetchData =async () => {
    await invoiceApi.getInvoicePending().then(result => {
      setInvoicePending(result.data)
    });
    await invoiceApi.getInvoiceList().then(result => {
      setInvoiceList(result.data)
    })
  }
  const listOrderHeader = [
    {
      name: 'Số HĐ',
      selector: row => row.invoiceID,
      sortable: true,
      maxWidth: "70px"
    },
    {
      name: 'Khách hàng',
      selector: row => row.customer,
      sortable: true,
      minWidth: "140px"
    },  
    {
      name: 'Ngày đặt hàng',
      selector: row => row.createAt,
      minWidth: "160px",
      sortable:true
    },
    {
      name: 'Số lượng',
      selector: row => row.quantity,
      sortable: true,
      maxWidth: "115px",
    },
    {
      name: 'Tổng tiền',
      selector: row => row.subTotal,
      sortable: true,
      minWidth: "150px",
      cell: (row)=>(VND.format(row.subTotal))
    },
    {
      name: 'Ghi chú',
      selector: row => row.note,
      sortable: true,
      maxWidth: "210px",
    },
    {
      cell: (row) => (
        <>
        <button id={row.ID} className='button-table btn btn-warning' onClick={()=>handleShowInvoice(row.invoiceID)}>Xem</button>
        <button className='button-table btn btn-success' onClick={()=>handleApprove(row.invoiceID)}>Duyệt</button>
        <button className='button-table btn btn-danger' onClick={()=>{handleReject(row.invoiceID)}}>Từ chối</button>
        </>
      ),
      minWidth:"220px",
      ignoreRowClick: true,
      allowOverflow: true,
      button: true,
      
    },
]
  const listInvoiceHeader = [
    {
      name: 'Số HĐ',
      selector: row => row.invoiceID,
      sortable: true,
      maxWidth: "70px"
    },
    {
      name: 'Khách hàng',
      selector: row => row.customer,
      sortable: true,
      minWidth: "140px"
    },  
    {
      name: 'Ngày đặt hàng',
      selector: row => row.createAt,
      minWidth: "160px",
      sortable:true
    },
    {
      name: 'Số lượng',
      selector: row => row.quantity,
      sortable: true,
      maxWidth: "115px",
    },
    {
      name: 'Tổng tiền',
      selector: row => row.subTotal,
      sortable: true,
      minWidth: "150px",
      cell: (row)=>(VND.format(row.subTotal))
    },
    {
      name: 'Nhân viên',
      selector: row => row.userName,
      sortable: true,
      maxWidth: "210px",
    },
  ]

const tableValues = {
  listOrderHeader,
  listOrderBody:invoicePending,
  }
  const tableValue2 = {
    listInvoiceHeader,
    listInvoiceBody:invoiceList
}
  
  
  const handleShowModal = (type) => {
    if (type === 'Xem' || type === 'Xóa' || type === 'Sửa') {
      if (modalValue.selectedCount != 1) {
        return toast.info('Vui lòng chỉ chọn 1 dòng dữ liệu ')
      }
      console.log(modalValue)
      setInvoiceSelected(modalValue.selectedRows[0].invoiceID)
      setShowModal(type);
    }else {
      
    }
  }
  const handleShowInvoice = (invoiceId) => {
    setInvoiceSelected(invoiceId);
    setShowModal("Xem");
  }
  const handleApprove =async (invoiceId) => {
    await invoiceApi.approveInvoice(invoiceId).then(result => {
      if (result.success)
      {
        toast.success("Duyệt hóa đơn thành công.")
        setTimeout(() => {
          fetchData();
        }, 1000);
        }
    })
  }
  const handleReject =async (invoiceId) => {
    await invoiceApi.rejectInvoice(invoiceId).then(result => {
      if (result.success)
      {
        toast.success("Từ chối hóa đơn thành công.")
        setTimeout(() => {
          fetchData();
        }, 1000);
        }
    })
  }
  const handleShowError = () => {
    return toast.error("Không thể thao tác với hóa đơn đã duyệt.")
  }
  const hasPermission = (permission) => permissionValue.includes(permission);
return (
  <>
    {hasPermission(23) && (
    <SaleTable value1={tableValues} value2={tableValue2} selectValue={setModalValue } />
    )}
    <div className="d-flex flex-row docs-highlight mb-3 mt-3"  >
    {hasPermission(22) && (
      <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowModal('Xem') } >Xem</CButton>
    )}
    {hasPermission(24) && (
      <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={() => handleShowError()}>Sửa</CButton>
    )}
    {hasPermission(25) && (
      <CButton className='mx-2 btn btn-warning' style={{ minWidth: 70 }} onClick={()=>handleShowError()}>Xóa</CButton>
    )}
    </div>
    <SalesManagerModal type={showModal} setShowModal={setShowModal} invoiceId={invoiceSelected} />
  </>
)
}

export default SalesManager
