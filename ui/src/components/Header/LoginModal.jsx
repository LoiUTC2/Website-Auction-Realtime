import React, { useContext, useEffect, useState } from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import { Formik, Field, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import 'react-tabs/style/react-tabs.css';
import { XIcon, Eye, EyeOff, Loader } from 'lucide-react';
import HomeService from '../../services/HomeService';
import { AppContext } from '../../AppContext';
import { openNotify } from '../../commons/MethodsCommons';

const InputField = ({ label, name, type = 'text', ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const inputType = type === 'password' && showPassword ? 'text' : type;
  return (
    <div className="mb-4">
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <div className="relative">
        <Field
          id={name}
          name={name}
          type={inputType}
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 outline-0"
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-5 w-5 text-gray-400" /> : <Eye className="h-5 w-5 text-gray-400" />}
          </button>
        )}
      </div>
      <ErrorMessage name={name} component="div" className="mt-1 text-sm text-red-600" />
    </div>
  );
};

const Button = ({ children, ...props }) => (
  <button
    {...props}
    className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
  >
    {children}
  </button>
);

const LoginModal = ({ isOpen, setIsOpen, onLoginSuccess,languageText }) => {
  const {openLoginModal,toggleLoginModal } = useContext(AppContext)
  const [showOtp, setShowOtp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [loadingSendMail, setLoadingSendMail] = useState(false);
  const { setUserData } = useContext(AppContext);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [otpKey, setOtpKey] = useState(null);
  useEffect(() => {
    if (openLoginModal == true) {
      // toggleLoginModal();
      setIsOpen(true)
    }
  },[openLoginModal])
  if (!isOpen) return null;

  const signupSchema = Yup.object().shape({
    fullName: Yup.string().required('Full Name is required'),
    username: Yup.string().required('Username is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
    confirmPassword: Yup.string()
      .oneOf([Yup.ref('password'), null], 'Passwords must match')
      .required('Confirm your password'),
    phone: Yup.string().matches(/^[0-9]+$/, 'Phone number is not valid').required('Phone number is required'),
    otp: Yup.string().required('OTP is required'),
    agreement: Yup.boolean().oneOf([true], 'You must accept the terms and conditions'),
  });

  return (
    <div className="fixed inset-0 mt-auto flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 shadow-lg w-full max-w-md relative overflow-auto max-h-[95%] custom-scrollbar" >
        <button
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          onClick={() => { setIsOpen(false);  toggleLoginModal(false)}}
        >
          <XIcon className="h-6 w-6" />
        </button>

        <Tabs>
          <TabList className="flex space-x-4 mb-6 border-b border-gray-200">
            <Tab
              selectedClassName="border-b-2 border-blue-600 text-blue-600"
              className="px-4 py-2 cursor-pointer font-medium text-gray-600 focus:outline-none"
            >
              {isForgotPassword ? languageText.forgotPassword : languageText.loginButton }
            </Tab>
            <Tab
              selectedClassName="border-b-2 border-blue-600 text-blue-600"
              className="px-4 py-2 cursor-pointer font-medium text-gray-600 focus:outline-none"
            >
              {languageText.signUpTitle}
            </Tab>
          </TabList>

          <TabPanel>
            {!isForgotPassword ? (
              <Formik
                initialValues={{ username: '', password: '' }}
                validationSchema={Yup.object({
                  username: Yup.string().required('Username is required'),
                  password: Yup.string().required('Password is required'),
                })}
                onSubmit={async (values, { setSubmitting }) => {
                  try {
                    const login = await HomeService.login(values.username, values.password);
                    if (!!login) {
                      setUserData(login);
                      openNotify('success', 'Login successfully');
                      onLoginSuccess();
                    } 
                  } catch (error) {
                    openNotify('error', error.message || 'An error occurred during login');
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <InputField label= {languageText.loginUsernameLabel} name="username" />
                    <InputField label= {languageText.loginPasswordLabel} name="password" type="password" />
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? languageText.loggingInButton : languageText.loginButton}
                    </Button>
                  </Form>
                )}
              </Formik>
            ) : (
              <Formik
                initialValues={{ email: '', otp: '', newPassword: '', confirmPassword: '' }}
                onSubmit={async (values, { setSubmitting }) => {
                  if (!showOtp) {
                    if (!values.email) {
                      openNotify('error', 'Email is invalid!');
                      return;
                    }

                    setSubmitting(true);
                    try {
                      const otp = await HomeService.sendOTPForgotPassword(values.email);
                      if (otp) {
                        openNotify('success', 'OTP is sent successfully. Check your email!');
                        setShowOtp(true);
                      } else {
                        openNotify('error', 'Send OTP failed. Try again!');
                      }
                    } catch (error) {
                      openNotify('error', 'Cannot send OTP');
                    } finally {
                      setSubmitting(false);
                    }
                  }
                  //Verify OTP
                  else if (showOtp && !showNewPassword) {
                    try {
                      const verifyOTP = await HomeService.verifyOTP({
                        otp: values.otp,
                        email: values.email
                      });
                      if (verifyOTP) {
                        setOtpKey(verifyOTP.key);
                        setShowNewPassword(true);
                        openNotify('success', 'OTP verified successfully. Please set your new password.');
                      }
                    } catch (error) {
                      console.log(error)
                    } finally {
                      setSubmitting(false);
                    }
                  }
                  //Verify thành công
                  else if (showNewPassword) {
                    try {
                      if (!values?.newPassword || values?.newPassword?.length < 6)
                        return openNotify('error', 'Password must be least 6 character!');
                      if (values.newPassword !== values.confirmPassword)
                        return openNotify('error', 'Password not match');
                      const resetPassword = await HomeService.resetPassword(
                        {
                          email: values.email,
                          otpKey,
                          newPassword: values.newPassword
                        });
                      if (!!resetPassword) {
                        openNotify('success', 'Password reset successfully. You can now login with your new password.');
                        setIsForgotPassword(false);
                      } else {
                        openNotify('error', 'Failed to reset password. Please try again.');
                      }
                    } catch (error) {
                      openNotify('error', 'Error resetting password');
                    } finally {
                      setSubmitting(false);
                    }
                  }
                }}
              >
                {({ isSubmitting }) => (
                  <Form className="space-y-4">
                    <InputField label={languageText.signUpEmailLabel} name="email" type="email" disabled={showOtp} />
                    {showOtp && <InputField label={languageText.signUpOtpLabel} name="otp" />}
                    {showNewPassword && (
                      <>
                        <InputField label={languageText.signUpPasswordLabel}  name="newPassword" type="password" />
                        <InputField label={languageText.signUpConfirmPasswordLabel}  name="confirmPassword" type="password" />
                      </>
                    )}
                    <Button type="submit" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <Loader className="animate-spin mr-2 h-4 w-4" />
                          {showNewPassword ? 'Resetting...' : showOtp ? 'Verifying...' : 'Sending...'}
                        </div>
                      ) : (
                        showNewPassword ? languageText.forgotPasswordResetPasswordButton : showOtp ? languageText.forgotPasswordVerifyOtpButton : languageText.forgotPasswordSendOtpButton
                      )}
                    </Button>
                  </Form>
                )}
              </Formik>
            )}
            <div className="text-sm mt-4 text-center">
              <span
                className="cursor-pointer text-blue-600 hover:underline"
                onClick={() => {
                  setIsForgotPassword(!isForgotPassword);
                  setShowOtp(false);
                  setShowNewPassword(false);
                }}
              >
                {isForgotPassword ? languageText.loginButton : languageText.forgotPassword}
              </span>
            </div>
          </TabPanel>

          <TabPanel className="overflow-auto ">
            <Formik
              initialValues={{
                fullName: '',
                username: '',
                email: '',
                password: '',
                confirmPassword: '',
                phone: '',
                otp: '',
                agreement: false,
              }}
              validationSchema={signupSchema}
              onSubmit={async (values, { resetForm }) => {
                const register = await HomeService.createAccount(values);
                if (!!register) {
                  openNotify('success', 'Register successfully!!');
                  resetForm();
                } else {
                }
              }}
              className="overflow-auto"
            >
              {({ values, setFieldValue }) => (
                <Form className="space-y-4">
                  <InputField label={languageText.signUpFullNameLabel} name="fullName" />
                  <InputField label={languageText.signUpUsernameLabel} name="username" /> {/* Added username input */}
                  <div className="relative">
                    <InputField label="Email" name="email" type="email" />
                    <button
                      type="button"
                      className={`absolute right-2 top-8 bg-blue-600 text-white py-1 px-3 rounded-md hover:bg-blue-700 text-sm ${loadingSendMail ? 'opacity-50 cursor-not-allowed' : ''}`}
                      onClick={async () => {
                        if (!values.email) {
                          openNotify('error', 'Email is invalid!');
                          return;
                        }

                        setLoadingSendMail(true);
                        try {
                          const otp = await HomeService.sendOTP(values.email);
                          if (!!otp) {
                            openNotify('success', 'OTP is sent successfully. Check your email!');
                          } else {
                            // openNotify('error', 'Send OTP failed. Try again!');
                          }
                        } catch (error) {
                          openNotify('error', 'Cannot send OTP');
                        } finally {
                          setLoadingSendMail(false);
                        }
                      }}
                      disabled={loadingSendMail}
                    >
                      {loadingSendMail ? (
                        <div className="flex items-center">
                          <Loader className="animate-spin mr-2 h-4 w-4" />
                          Sending...
                        </div>
                      ) : (
                        languageText.forgotPasswordSendOtpButton
                      )}
                    </button>
                  </div>
                  <InputField label={languageText.signUpPhoneLabel} name="phone" />
                  <InputField label={languageText.signUpOtpLabel} name="otp" />
                  <InputField label={languageText.signUpPasswordLabel} name="password" type="password" />
                  <InputField label={languageText.signUpConfirmPasswordLabel} name="confirmPassword" type="password" />
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="agreement"
                      name="agreement"
                      checked={values.agreement}
                      onChange={() => setFieldValue('agreement', !values.agreement)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="agreement" className="ml-2 block text-sm text-gray-900">
                    {languageText.signUpAgreementLabel}
                    </label>
                  </div>
                  <ErrorMessage name="agreement" component="div" className="mt-1 text-sm text-red-600" />
                  <Button type="submit">{languageText.signUpTitle}</Button>
                </Form>
              )}
            </Formik>
          </TabPanel>

        </Tabs>
      </div>
    </div>
  );
};

export default LoginModal;