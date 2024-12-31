import React, { useEffect, useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'

import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import authApi from '../../../service/AuthService'
import { ToastContainer, toast } from 'react-toastify'
import { useFormik } from 'formik'
import Cookies from 'js-cookie'
import { useDispatch, useSelector } from 'react-redux'
import ForgotPasswordDialog from '../../../components/Login/ForgotPasswordDialog'; 
import RegistrationDialog from '../../../components/Login/RegistrationDialog';
const DefaultLayout = React.lazy(() => import('../../../layout/DefaultLayout'))

const Login = (props) => {
  const navigate = useNavigate();
  const [loginSuccess, setLoginSuccess] = useState(false);

  const [isForgotPasswordOpen, setForgotPasswordOpen] = useState(false); 

  const [isRegistrationOpen, setRegistrationOpen] = useState(false);

  const toggleForgotPassword = () => {
    setForgotPasswordOpen(!isForgotPasswordOpen);
  };

  const toggleRegistration = () => {
    setRegistrationOpen(!isRegistrationOpen);
  };
 
  const handleLogin = async (values) => {
    console.log("Submitted Values:", values); 
    if (!values.username || !values.password) {
      toast.error("Email và mật khẩu bắt buộc nhập");
      return;
    }
    try {
      // const result = await authApi.login(values);
      const result = await authApi.login({
        username: values.username,
        password: values.password
      });
      if (result.success) {
        toast.success("Đăng nhập thành công");
        setLoginSuccess(true);
        // dispatch(setPermission(result.data.listPermission));
        localStorage.setItem("permission", JSON.stringify(result.data.permissions));
        localStorage.setItem("accessToken", JSON.stringify(result.data.accessToken));
        localStorage.setItem("userId", JSON.stringify(result.data._id));
        localStorage.setItem("userinfo", JSON.stringify(result.data));
        
        if (props.onLoginSuccess) {
          props.onLoginSuccess(); // Cập nhật trạng thái trong component cha
        }
        navigate('/')
        // checkCookie()
      }else {
        toast.error(result.message || "Đăng nhập thất bại");
      }
    } catch (error) {
        console.error("Error logging in:", error.message);
        toast.error(`Đăng nhập thất bại !`);
    }
  };
  const checkCookie = () => {
    // const userData = Cookies.get('username');
    // console.log('User Data:', userData); 
    // if (userData) {
    //   console.log('login sucess');
    //   navigate('/')
    // }
    const accessToken = Cookies.get('accessToken');  
    const userId = Cookies.get('userId');            
    
    if (accessToken && userId) {
        console.log('User is authenticated');
        navigate('/')
        return true;       
    } else {
        console.log('User is not authenticated');
        return false;
    }
  };

 
  const formik=useFormik(
    {
      initialValues: {
        username: '',
        password:''
      },
      onSubmit: values => {
        handleLogin(values)
      },
  }
  )

  // useEffect(() => {
  //   checkCookie()
  // }, [])
  // console.log('render')

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={formik.handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-medium-emphasis">Sign In to your account</p>

                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput 
                        placeholder="Username" 
                        autoComplete="username" 
                        name='username' 
                        value={formik.values.username}
                        onChange={formik.handleChange} 
                        />
                    </CInputGroup>

                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        name='password'                      
                        value={formik.values.password}
                        onChange={formik.handleChange}

                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type='submit' >
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                      <CButton color="link" className="px-0" onClick={toggleForgotPassword}>
                      Forgot password?
                        </CButton>
                      </CCol>
                    </CRow>
                  </CForm>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <CButton color="primary" className="mt-3" active tabIndex={-1} onClick={toggleRegistration}>
                      Register Now!
                    </CButton>

                    <RegistrationDialog isOpen={isRegistrationOpen} toggle={toggleRegistration} />
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
      <ForgotPasswordDialog isOpen={isForgotPasswordOpen} toggle={toggleForgotPassword} /> 

    </div>
  )
}

export default Login
