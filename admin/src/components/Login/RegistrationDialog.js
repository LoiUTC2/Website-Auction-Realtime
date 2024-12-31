import React, { useEffect, useState } from 'react'
import Cookies from 'js-cookie'
import '../../scss/register.scss';
import {
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
  CButton,
  CForm,
  CFormLabel,
  CCol,
  CFormInput,
  CFormSelect
} from '@coreui/react';
import { useNavigate } from 'react-router-dom';
import { useFormik } from 'formik';
import employeeAPI from 'service/EmployeeService';
import { toast } from 'react-toastify';

const RegistrationDialog = ({ isOpen, toggle }) => {
  const navigate = useNavigate();
 
  // const [showDialog, setShowDialog] = useState(isOpen);

  const handleCreate = async (values) => {
    console.log("Submitted Values:", values); 
    if (!values.username || !values.password || !values.email || !values.phoneNumber || !values.password || !values['re-password'] || !values.gender) {
      toast.error("Missing information");
      return;
    }
    else if (values.password !== values['re-password']) {
      toast.error("Non Duplicate Password");
      return;
    }
    try {
      const result = await employeeAPI.create({
        fullName: values.fullName.trim() === '' ? 'Bổ sung sau' : values.fullName,
        username: values.username,
        email: values.email,
        gender: values.gender,
        address: values.address.trim() === '' ? 'Bổ sung sau' : values.address,
        password: values.password,
        phoneNumber: values.phoneNumber,
        rolePermission: values.rolePermission,
      });
      // console.log('result',result)  
      if (result && result.success) {
        toggle();
        // dispatch(setPermission(result.data.listPermission));
        localStorage.setItem("permission", JSON.stringify(result.data.listPermission));
        localStorage.setItem("userinfo", JSON.stringify(result.data));
      }
    } catch (error) {
        console.error("Error logging in:", error.message);
        // toast.error(`Đăng kí thất bại !`);
    }
  };
  
  const formik=useFormik(
    {
      initialValues: {
        fullName: '',
        username: '',
        email: '',
        gender: '',
        address: '',
        password:'',
        phoneNumber: '',
        status: '',
        rolePermission: '6750149f148318b86e3eb569',
      },
      onSubmit: values => {
        handleCreate(values)
      },
    }
  )

  return (
    <CModal visible={isOpen}>
      <CModalHeader onClick={toggle}>Register Now!</CModalHeader>
      <CModalBody>
        <CForm onSubmit={formik.handleSubmit}>
          <CCol>
            <CFormLabel>Full Name</CFormLabel>
            <CFormInput type="text" placeholder="Enter full name" name='fullName' onChange={formik.handleChange}/>
          </CCol>
          <CCol>
            <CFormLabel className='required-label'>Username</CFormLabel>
            <CFormInput type="text" placeholder="Enter username" name='username' onChange={formik.handleChange}/>
          </CCol>
          <CCol>
            <CFormLabel className='required-label'>Email</CFormLabel>
            <CFormInput type="email" placeholder="Enter email" name='email' onChange={formik.handleChange}/>
          </CCol>
          <CCol>
            <CFormLabel className='required-label'>Gender</CFormLabel>
            <CFormSelect name='gender' onChange={formik.handleChange} value={formik.values.gender}>
              <option value="">Select Gender</option>
              <option value="Nam">Male</option>
              <option value="Nữ">Female</option>
              <option value="Khác">Other</option>
            </CFormSelect>
          </CCol>
          <CCol>
            <CFormLabel>Address</CFormLabel>
            <CFormInput type="text" placeholder="Enter address" name='address' onChange={formik.handleChange}/>
          </CCol>
          <CCol>
            <CFormLabel className='required-label'>Password</CFormLabel>
            <CFormInput type="password" placeholder="Enter password" name='password' onChange={formik.handleChange}/>
          </CCol>
          <CCol>
            <CFormLabel className='required-label'>Comfirm Password</CFormLabel>
            <CFormInput type="password" placeholder="Re-Enter password" name='re-password' onChange={formik.handleChange}/>
          </CCol>
          
          <CCol>
            <CFormLabel className='required-label'>Phone Number</CFormLabel>
            <CFormInput type="text" placeholder="Enter phone number" name='phoneNumber' onChange={formik.handleChange}/>
          </CCol>
          <CModalFooter>
            <CButton color="primary" className="px-4" type='submit' >Register</CButton>
            <CButton color="secondary" onClick={toggle}>Cancel</CButton>
          </CModalFooter>
        </CForm>
      </CModalBody>
      
    </CModal>
  );
};

export default RegistrationDialog;

