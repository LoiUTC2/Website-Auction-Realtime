import React, { useEffect, useState } from 'react';
import { useFormik } from 'formik';
import { CModal, CModalHeader, CModalBody, CModalFooter, CButton, CForm, CFormInput, CInputGroup, CInputGroupText } from '@coreui/react';
import { toast } from 'react-toastify';
import authApi from '../../service/AuthService';

const ForgotPasswordDialog = ({ isOpen, toggle }) => {
  const [otpSent, setOtpSent] = useState(false);
  const [email, setEmail] = useState('');

  useEffect(()=>{
    setOtpSent(false);
  }, [isOpen])

  const formik = useFormik({
    initialValues: {
      email: '',
      username: '',
      otp: '',
      newPassword: ''
    },
    onSubmit: async (values) => {
      if (!otpSent) {
        // Send OTP
        try {
          const result = await authApi.sendOTP({ email: values.email });
          if (result.success) {
            toast.success("OTP sent successfully");
            setOtpSent(true);
            setEmail(values.email);
          } else {
            toast.error(result.message || "Failed to send OTP");
          }
        } catch (error) {
          const errorMessage = error.response?.data?.message || "Failed to send OTP!";
          toast.error(errorMessage);
        }
      } else {
        // Reset Password
        try {
            console.log("email: ", email);
            const result = await authApi.resetPassword({
                username: values.username,
                otp: values.otp,
                newPassword: values.newPassword
            });
            if (result.success) {
                toast.success("Password has been reset successfully");
                toggle();
                setOtpSent(false);
            } else {
                setOtpSent(false);
                toast.error(result.message || "Failed to reset password");
            }
        } catch (error) {
            console.error("Lỗi: ", error.message);
            const errorMessage = error.response?.data?.message || "Failed to reset password!!";
            toast.error(errorMessage);
            return { success: false, message: errorMessage };
        }
      }
    }
  });

  return (
    <CModal visible={isOpen}>
      <CModalHeader onClick={toggle}>Forgot Password</CModalHeader>
      <CModalBody>
        <CForm onSubmit={formik.handleSubmit}>
          {!otpSent ? (
            <>
              <CInputGroup className="mb-3">
                <CInputGroupText>@</CInputGroupText>
                <CFormInput
                  type="email"
                  placeholder="Email"
                  name="email"
                  // value={formik.values.email}
                  onChange={formik.handleChange}
                  required
                />
              </CInputGroup>
              <CButton type="submit" color="primary">Send OTP</CButton>
            </>
          ) : (
            <>
                <CInputGroup className="mb-3">
                    <CInputGroupText>OTP</CInputGroupText>
                    <CFormInput
                    type="text"
                    placeholder="OTP"
                    name="otp"
                    // value={formik.values.otp}
                    onChange={formik.handleChange}
                    required
                    />
                </CInputGroup>

                <CInputGroup className="mb-3">
                <CInputGroupText>Username</CInputGroupText>
                <CFormInput
                    type="text"
                    placeholder="Username"
                    name="username"
                    value={formik.values.username}
                    onChange={formik.handleChange}
                    required
                />
                </CInputGroup>

                <CInputGroup className="mb-3">
                    <CInputGroupText>Password</CInputGroupText>
                    <CFormInput
                    type="password"
                    placeholder="New Password"
                    name="newPassword"
                    // value={formik.values.newPassword}
                    onChange={formik.handleChange}
                    required
                    />
              </CInputGroup>
              <CButton type="submit" color="primary">Reset Password</CButton>
            </>
          )}
        </CForm>
      </CModalBody>
      <CModalFooter>
        <CButton color="secondary" onClick={toggle} >Close</CButton>
      </CModalFooter>
    </CModal>
  );
};

export default ForgotPasswordDialog;