'use client';

import React, { useState, useContext, useEffect, useMemo } from 'react';
import {
  UserOutlined,
  HistoryOutlined,
  GiftOutlined,
  TransactionOutlined,
  WalletOutlined,
  CrownOutlined,
  EditOutlined,
  SaveOutlined
} from '@ant-design/icons';
import { Upload, message, Table, Timeline, Tag, Space, Typography } from 'antd';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { AppContext } from '../../AppContext';
import ProfileService from '../../services/ProfileService';
import { formatCurrency, formatDate, formatDateTime, openNotify } from '../../commons/MethodsCommons';
import { Helmet } from 'react-helmet';

const SIDEBAR_SECTIONS = [
  {
    key: 'account',
    icon: <UserOutlined />,
    title: 'Thông tin tài khoản',
    subtitle: 'Quản lý thông tin cá nhân'
  },
  {
    key: 'registration',
    icon: <HistoryOutlined />,
    title: 'Lịch sử đăng ký',
    subtitle: 'Theo dõi quá trình tài khoản'
  },
  {
    key: 'auction',
    icon: <GiftOutlined />,
    title: 'Lịch sử đấu giá',
    subtitle: 'Danh sách các phiên đấu giá'
  },
  {
    key: 'transaction',
    icon: <TransactionOutlined />,
    title: 'Lịch sử giao dịch',
    subtitle: 'Thống kê nạp và rút tiền'
  },
  {
    key: 'membership',
    icon: <CrownOutlined />,
    title: 'Cấp độ thành viên',
    subtitle: 'Quyền lợi và ưu đãi'
  }
];

const ProfilePage = () => {
  const { user } = useContext(AppContext);
  const [activeSection, setActiveSection] = useState('account');
  const [userData, setUserData] = useState(null);
  const [fileList, setFileList] = useState([]);
  const [registerData, setRegisterData] = useState(null);
  const [transactionData, setTransactionData] = useState(null);


  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const { userId } = user;
        const [fetchedData, registerList, transactionList] = await Promise.all([
          ProfileService.getById(userId),
          ProfileService.getHistoryRegister(),
          ProfileService.getHistoryTransaction(),
        ]);
  
        setUserData(fetchedData);
        setRegisterData(registerList);
        setTransactionData(transactionList);
  
      } catch (error) {
        openNotify('error', 'Không thể tải dữ liệu người dùng');
        console.error("User data fetch error:", error);
      }
    };
  
    // Chỉ chạy khi userId tồn tại
    if (user?.userId) {
      fetchUserData();
    }
  }, [user?.userId]);

  const renderContent = () => {
    const contentMap = {
      account: <AccountSection
        userData={userData}
        fileList={fileList}
        setFileList={setFileList}
      />,
      registration: <RegistrationHistory data={registerData} />,
      auction: <AuctionHistory data={registerData} />,
      transaction: <TransactionHistory data={transactionData} />,
      membership: <MembershipLevel />
    };

    return contentMap[activeSection] || null;
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Helmet>
        <title>Profile</title>
        <meta property="og:title" content="Profile" />
        <meta property="og:description" content="Profile" />
      </Helmet>
      <div className="w-1/4 bg-white shadow-md">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold">Hồ Sơ</h1>
        </div>
        <div className="py-4">
          {SIDEBAR_SECTIONS.map((item) => (
            <div
              key={item.key}
              className={`
                flex items-center p-4 cursor-pointer transition-all duration-300
                ${activeSection === item.key
                  ? 'bg-blue-50 border-r-4 border-blue-500 text-blue-600'
                  : 'hover:bg-gray-100'}
              `}
              onClick={() => setActiveSection(item.key)}
            >
              <div className="mr-4 text-2xl">{item.icon}</div>
              <div>
                <h3 className="font-semibold">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Content Area */}
      <div className="w-3/4 p-8">
        {renderContent()}
      </div>
    </div>
  );
};

const AccountSection = ({ userData, fileList, setFileList }) => {
  const [isEditing, setIsEditing] = useState(false);

  const handleUploadChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const validationSchema = useMemo(() =>
    Yup.object({
      fullName: Yup.string().required('Vui lòng nhập họ và tên'),
      email: Yup.string().email('Địa chỉ email không hợp lệ').required('Vui lòng nhập email'),
      phone: Yup.string()
        .matches(/^[0-9]{10,11}$/, 'Số điện thoại phải có 10-11 chữ số')
        .required('Vui lòng nhập số điện thoại'),
    }),
    []);

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <Formik
        enableReinitialize={true}
        initialValues={{
          fullName: userData?.fullName || "",
          username: userData?.username || "",
          email: userData?.email || "",
          phone: userData?.phoneNumber || "",
          userCode: userData?.userCode || "", // Mã khách hàng
          createdAt: formatDate(userData?.createdAt ) || "", // Ngày tham gia
          identifyCode: userData?.identifyCode || "", // CCCD/CMND
          address: userData?.address || "",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { setSubmitting }) => {
          try {
            if (isEditing) {
              const updated = await ProfileService.updateProfile(values);
              if (updated) {
                openNotify("success", "Cập nhật thông tin thành công");
                setIsEditing(false);
              } else {
                openNotify("error", "Cập nhật thất bại. Vui lòng thử lại!");
              }
            }
          } catch (error) {
            openNotify("error", "Có lỗi xảy ra. Vui lòng thử lại!");
            console.error("Update profile error:", error);
          } finally {
            setSubmitting(false);
          }
        }}
      >
        {({ isSubmitting, handleSubmit }) => (
          <Form onSubmit={handleSubmit}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Thông tin tài khoản</h2>
              {isEditing ? (
                <button
                  type="submit"
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition"
                >
                  <SaveOutlined className="mr-2" /> Lưu
                </button>
              ) : (
                <span
                  onClick={() => setIsEditing(true)}
                  className="flex items-center bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition cursor-pointer"
                >
                  <EditOutlined className="mr-2" /> Chỉnh sửa
                </span>
              )}
            </div>

            <div className="mb-6">
              <label className="block text-lg font-bold mb-2">Avatar</label>
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleUploadChange}
                maxCount={1}
                disabled={!isEditing}
              >
                {fileList.length < 1 && isEditing && (
                  <div>
                    <UserOutlined style={{ fontSize: "24px" }} />
                    <div style={{ marginTop: 8 }}>Tải lên</div>
                  </div>
                )}
              </Upload>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { field: "userCode", label: "Mã khách hàng", disabled: true },
                { field: "username", label: "Tên đăng nhập", disabled: true },
                { field: "fullName", label: "Họ và tên" },
                { field: "email", label: "Email" },
                { field: "phone", label: "Số điện thoại" },
                { field: "identifyCode", label: "CCCD/CMND" },
                { field: "address", label: "Địa chỉ" },
                { field: "createdAt", label: "Ngày tham gia", disabled: true },
              ].map(({ field, label, disabled }) => (
                <div key={field}>
                  <label className="block text-lg font-bold mb-1">{label}</label>
                  <Field
                    type="text"
                    name={field}
                    disabled={disabled || !isEditing}
                    className={`w-full px-3 py-2 border rounded-lg ${
                      isEditing && !disabled ? "bg-white" : "bg-gray-100"
                    } ${isEditing && !disabled ? "cursor-text" : "cursor-not-allowed"}`}
                  />
                  <ErrorMessage
                    name={field}
                    component="div"
                    className="text-red-600 text-sm mt-1"
                  />
                </div>
              ))}
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

const RegistrationHistory = ({ data }) => {
  const columns = [
    {
      title: "Thời Gian Đăng Ký",
      dataIndex: "registrationTime",
      key: "registrationTime",
      render: data => formatDateTime(data)
    },
    {
      title: "Mã Phiên Đấu Giá",
      dataIndex: "_id",
      key: "_id",
    },
    {
      title: "Thời Gian Đấu Giá",
      dataIndex: "startTime",
      key: "startTime",
      render: data => formatDateTime(data)
    },
    {
      title: "Sản Phẩm",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Số Tiền Đăng Ký",
      dataIndex: "registrationFee",
      key: "registrationFee",
      render: (fee) => `${fee.toLocaleString()} VND`,
    },
    {
      title: "Trạng Thái Đăng Ký",
      dataIndex: "status",
      key: "status",
      render: (status) => (
        <Tag color={status === "active" ? "green" : "red"}>
          {status === "active" ? "Đã Xác Nhận" : "Đang Chờ"}
        </Tag>
      ),
    },
  ];


  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <h2 className="text-2xl font-bold mb-6">Lịch Sử Đăng Ký Đấu Giá</h2>
      <Table
        columns={columns}
        dataSource={data}
        bordered
        pagination={{ pageSize: 5 }}
        rowKey="key"
      />
    </div>
  );
};

const AuctionHistory = ({ data }) => {
  const { Title } = Typography;
  const columns = [
    {
      title: 'Mã phiên đấu giá',
      dataIndex: '_id',
      key: '_id',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Trạng thái ',
      dataIndex: 'isWin',
      key: 'isWin',
      render: data => !!data ? 'Đấu giá thành công' : 'Đấu giá thất bại'
    },
    {
      title: 'Giá trúng',
      dataIndex: 'winningPrice',
      key: 'winningPrice',
      render: (text) =>!text ? '' : formatCurrency(text),
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <Title level={2}>Lịch sử đấu giá</Title>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

const TransactionHistory = ({ data}) => {
  const { Title } = Typography;

  const columns = [
    {
      title: 'Mã giao dịch',
      dataIndex: '_id',
      key: '_id',
      render: (text) => <span>{text}</span>,
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (text) =>formatDateTime(text),
    },
    {
      title: 'Mã phiên đấu giá',
      dataIndex: 'auctionId',
      key: 'auctionId',
    },
    {
      title: 'Sản phẩm',
      dataIndex: 'auctionTitle',
      key: 'auctionTitle',
    },
    {
      title: 'Số tiền',
      dataIndex: 'amount',
      key: 'amount',
      render: (text) =>formatCurrency(text),
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        let color = status === 'COMPLETED' ? 'green' : status === 'PENDING' ? 'blue' : 'red';
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  return (
    <div className="bg-white shadow-lg rounded-lg p-8">
      <Title level={2}>Lịch sử giao dịch</Title>
      <Table
        dataSource={data}
        columns={columns}
        rowKey="_id"
        pagination={{ pageSize: 10 }}
        bordered
      />
    </div>
  );
};

const MembershipLevel = () => (
  <div className="bg-white shadow-lg rounded-lg p-8">
    <h2 className="text-2xl font-bold mb-6">Cấp độ thành viên</h2>
    <div className="flex items-center space-x-4">
      <div className="text-6xl text-yellow-500"><CrownOutlined /></div>
      <div>
        <h3 className="text-xl font-semibold">Hạng Bạc</h3>
        <p>Ưu đãi: Giảm 5% phí đấu giá, hỗ trợ ưu tiên</p>
      </div>
    </div>
  </div>
);

export default ProfilePage;