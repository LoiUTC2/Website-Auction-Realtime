import { CButton, CCol, CForm, CFormCheck, CModal, CModalBody, CModalFooter, CModalHeader, CRow } from '@coreui/react';
import React, { useEffect, useState } from 'react';
import { SYSTEM_PERMISSION } from '../../commons/PermissionCommons';
import roleApi from '../../service/RoleService';
import { toast } from 'react-toastify';

function PermissionModal(props) {
  let { type, setShowModal, data } = props;
  const id_rolePermission = data?.selectedRows[0]._id;
  const [show, setShow] = useState(false);
  const [listRolePermission, setListRolePermission] = useState([]);
  const [idPer, setIdPer] = useState();

  const [loading, setLoading] = useState(true); 

  const [checkboxes, setCheckboxes] = useState([]);

  const permissionValue = JSON.parse(localStorage.getItem('permission')) || [];
  const userId = JSON.parse(localStorage.getItem('userId'));


  useEffect(() => {
    type !== null ? setShow(true) : setShow(false);
  }, [type]);

  const fetchData = async () => {
    try {
      const listData = await roleApi.getRolePermissionByID(id_rolePermission);
      if(listData.success){
        console.log("PerAPI:", listData.data.permissions)

        setListRolePermission(listData.data.permissions);
        setIdPer(listData.data._id)
        setLoading(false); // Kết thúc quá trình tải
      }
      
    } catch (error) {
      console.error('Error fetching permissions:', error);
    }
    console.log("Per:", listRolePermission)

  };

  useEffect(() => {
      fetchData();
      console.log("PerUse:", listRolePermission)
  }, [id_rolePermission]);

  useEffect(() => {
    if (!loading) {
      const dataPermission = listRolePermission && SYSTEM_PERMISSION.flatMap(group => (
        group.Permission.map((permission) => ({
          id: permission.PermissionID,
          // isChecked: listRolePermission.map(l => l.key).includes(permission.PermissionID),
          isChecked: listRolePermission.some((l) => Number(l.key) === permission.PermissionID), 

          label: permission.PermissionName,
          groupLabel: group.Label,
        }))
      ));
      console.log("Data Permission:", dataPermission); 

      setCheckboxes(dataPermission);
    }
  }, [listRolePermission, loading]); 

  const handleChange = (id) => {
    setCheckboxes((prevCheckboxes) =>
      prevCheckboxes.map((checkbox) =>
        checkbox.id === id ? { ...checkbox, isChecked: !checkbox.isChecked } : checkbox
      )
    );
  };

  const handleSave =async () => {
    const listData = [];
    checkboxes.forEach(item => {
      if (item.isChecked) {
        listData.push(item.id)
      }
    });

    const modelValue = {
      // id_RolePermission: id_rolePermission,
      key: listData,
      updateBy: userId,
    }
    console.log("listdata:", listData)
    try {
      const resultUpdate = await roleApi.updateRolePermission(id_rolePermission, modelValue);
      if (resultUpdate.success) {
        setShow(false)
      }else{
        toast.error("Không thể thay đổi quyền của vai trò mặc định")
      }      
    } catch (error) {
      toast.error(error.response?.data?.message || "Lỗi khi thay đổi quyền của vai trò");
    }
  }

  return (
    <CModal
      onClose={() => { setShow(false); setShowModal(null) }}
      visible={show}
      className='modal-xl'
    >
      <CModalHeader closeButton>Phân Quyền Vai Trò</CModalHeader>
      <CModalBody className='p-4'>
        {loading ? (
          <div>Loading...</div>
        ) : (
          <CForm>
            {!!checkboxes && Array.from(new Set(checkboxes.map(item => item.groupLabel))).map((groupLabel, index) => (
              <React.Fragment key={index}>
                <CRow className='fs-5 fw-semibold'>{groupLabel}</CRow>
                <CRow className='d-flex justify-content-start m-1'>
                  {checkboxes
                    .filter(item => item.groupLabel === groupLabel)
                    .map(item => (
                      <CCol md="4" className='mt-2' key={item.id}>
                        <CFormCheck
                          id={item.id}
                          label={item.label}
                          checked={item.isChecked}
                          onChange={() => handleChange(item.id)}
                        />
                      </CCol>
                    ))}
                </CRow>
              </React.Fragment>
            ))}
          </CForm>
        )}
      </CModalBody>
      <CModalFooter>
        <CButton color="primary" onClick={()=>handleSave()}>Lưu</CButton>{' '}
        <CButton
          color="secondary"
          onClick={() => { setShow(false); setShowModal(null) }}
        >Đóng</CButton>
      </CModalFooter>
    </CModal>
  );
}

export default PermissionModal;
