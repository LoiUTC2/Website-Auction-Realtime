import React, { useState, useEffect, useCallback } from 'react';
import { Steps, Button, Modal, Result, Card, Radio, Spin, Col, Form, Statistic, Row, Input } from 'antd';
import { CheckCircleOutlined, DollarCircleOutlined, SafetyOutlined } from '@ant-design/icons';
import AuctionService from '../../services/AuctionService';
import { useSearchParams, useNavigate } from 'react-router-dom';
import mastercardLogo from '../../assets/mastercardLogo.png'
import vnpaylogo from '../../assets/vnpaylogo.jpg'
import { PAYMENT_STATUS, POLLING_CONFIG } from '../../commons/Constant';
import { formatCurrency, formatDateTime } from '../../commons/MethodsCommons';
import { CheckCircle2 } from 'lucide-react';
const { Step } = Steps;
const RegistrationSteps = ({ auction, onClose, userId, callback }) => {
  const [current, setCurrent] = useState(0);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(null); // trạng thái thanh toán
  const [paymentInfo, setPaymenInfo] = useState(null); // thông tin biên lai

  // Kiểm tra trạng thái giao dịch
  const { handleVnpayPayment, paymentStatus, error, isPolling } = usePaymentPolling(
    (response) => {
      setPaymentSuccess(true);
      setPaymenInfo(response);
      setPaymentLoading(false);
      callback("RegisterSuccess")
    },
    (error) => {
      setPaymentSuccess(false);
      setPaymenInfo(null)
      setPaymentLoading(false)
      setCurrent(2);
    }
  );
  const handleStartPayment = () => {
    handleVnpayPayment({ ...auction, userId });
    setPaymentLoading(true)
  }

  const steps = [
    {
      title: 'Xác nhận thông tin',
      icon: <SafetyOutlined />,
      content: (
<div className="w-full bg-white rounded-xl shadow-lg overflow-hidden">
        {/* Header gradient */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-400 p-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <SafetyOutlined className="w-5 h-5" />
            Thông tin xác nhận
          </h3>
        </div>

        <div className="p-6 space-y-6">
          {/* Product Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-600 mb-2">
              Tên sản phẩm
            </label>
            <input 
              type="text" 
              value={auction.productName}
              disabled
              className="w-full bg-white border border-gray-200 rounded-md py-2 px-3 text-gray-700"
            />
          </div>

          {/* Price Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Registration Fee */}
            <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg">
              <label className="block text-sm font-medium text-red-700 mb-2">
                Phí tham gia
              </label>
              <div className="text-xl font-bold text-red-700">
                {formatCurrency(auction.registrationFee)}
              </div>
            </div>

            {/* Deposit */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Tiền đặt cọc
              </label>
              <div className="text-xl font-bold text-blue-700">
                  {formatCurrency(auction.deposit)}
                </div>
              </div>

              {/* Starting Price */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <label className="block text-sm font-medium text-green-700 mb-2">
                Tổng thanh toán
              </label>
              <div className="text-xl font-bold text-green-700">
                {formatCurrency(auction.deposit + auction.registrationFee)}
              </div>
              </div>
              
            </div>

            

          {/* Warning Message */}
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-lg text-sm">
            Vui lòng kiểm tra kỹ thông tin trước khi xác nhận
          </div>
        </div>
      </div>
      )
    },
    {
      title: 'Thanh toán',
      icon: <DollarCircleOutlined />,
      content: (
        <Card className="w-full shadow-lg rounded-lg p-6 mb-6">
          {paymentSuccess === null ? (
            <Radio.Group
              onChange={(e) => setPaymentMethod(e.target.value)}
              value={paymentMethod}
              className="space-y-4"
            >
              <Radio value="vnpay" className="w-full">
                <Card className="w-full hover:shadow-md transition-all duration-300 rounded-lg p-4">
                  <div className="flex items-center">
                    <img src={vnpaylogo} alt="VNPay" className="w-12 h-12 mr-4" />
                    <div>
                      <h4 className="font-semibold">VNPay</h4>
                      <p className="text-sm text-gray-500">Thanh toán an toàn qua VNPay</p>
                    </div>
                  </div>
                  {paymentMethod === 'vnpay' && (
                    <div className="mt-4 flex justify-end">
                      {paymentLoading ? (
                        <Spin />
                      ) : (
                        <Button type="primary" onClick={handleStartPayment}>
                          Thanh toán
                        </Button>
                      )}
                    </div>
                  )}
                </Card>
              </Radio>
              <Radio value="bank_transfer" className="w-full " disabled>
                <Card className="w-full hover:shadow-md transition-all duration-300 rounded-lg p-4">
                  <div className="flex items-center">
                    <img src={mastercardLogo} alt="Chuyển khoản ngân hàng" className="w-12 h-12 mr-4" />
                    <div>
                      <h4 className="font-semibold">Chuyển khoản ngân hàng</h4>
                      <p className="text-sm text-gray-500">Chuyển khoản trực tiếp đến tài khoản của chúng tôi</p>
                    </div>
                  </div>
                </Card>
              </Radio>
            </Radio.Group>
          ) : paymentSuccess ? (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-center mb-6">
                <CheckCircle2 className="w-12 h-12 text-green-500 mr-3" />
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-green-500">Thanh toán thành công</h2>
                </div>
              </div>
              <div className="border-b border-gray-200 my-6"></div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Mã giao dịch</p>
                      <p className="font-medium">{paymentInfo._id}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Mã phiên đấu giá</p>
                      <p className="font-medium">{paymentInfo.auctionId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Thời gian thanh toán</p>
                      <p className="font-medium">{formatDateTime(paymentInfo.createdAt)}</p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm text-gray-600">Phí tham gia</p>
                      <p className="font-medium text-gray-900">{formatCurrency(auction.registrationFee)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tiền đặt cọc</p>
                      <p className="font-medium text-gray-900">{formatCurrency(auction.deposit)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Tổng tiền</p>
                      <p className="font-semibold text-lg text-green-600">{formatCurrency(paymentInfo.amount)}</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-6 text-sm text-gray-500">
                <p>* Vui lòng lưu lại mã giao dịch để tra cứu khi cần thiết</p>
                <p>* Email xác nhận sẽ được gửi đến địa chỉ email của bạn</p>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
              <Result
                status="error"
                title="Thanh toán thất bại!"
                subTitle="Xin vui lòng thử lại."
                extra={[
                  <Button type="primary" key="console" onClick={() => setCurrent(1)}>
                    Thử lại
                  </Button>
                ]}
              />
            </div>
          )}
        </Card>
      )
    },
    {
      title: 'Hoàn thành',
      icon: <CheckCircleOutlined />,
      content: paymentSuccess === true ? (
        <Result
          status="success"
          title="Đăng ký thành công!"
          subTitle="Bạn đã đăng ký tham gia đấu giá thành công. Chúng tôi sẽ thông báo cho bạn khi phiên đấu giá bắt đầu."
          extra={[
            <Button type="primary" key="console" onClick={onClose}>
              Đóng
            </Button>
          ]}
        />
      ) : paymentSuccess === false ? (
        <Result
          status="error"
          title="Thanh toán thất bại!"
          subTitle="Xin vui lòng thử lại."
          extra={[
            <Button type="primary" key="console" onClick={() => setCurrent(1)}>
              Thử lại
            </Button>
          ]}
        />
      ) : (
        <div>Loading...</div>
      )
    }
  ];

  return (
    <Modal
      title={<h2 className="text-2xl font-bold">Đăng ký tham gia đấu giá</h2>}
      open={isModalVisible}
      onCancel={onClose}
      footer={null}
      width={800}
      className="custom-modal"
    >
      <Steps current={current} className="mb-8">
        {steps.map((item) => (
          <Step key={item.title} title={item.title} icon={item.icon} />
        ))}
      </Steps>
      <div className="steps-content mb-8">{steps[current]?.content}</div>
      <div className="steps-action flex justify-between">
        {current > 0 && (
          <Button onClick={() => setCurrent(current - 1)}>Quay lại</Button>
        )}
        {current < steps.length - 1 && (
          <Button
            type="primary"
            onClick={() => setCurrent(current + 1)}
            disabled={paymentLoading || (current === 1 && !paymentInfo)}
          >
            Tiếp tục
          </Button>
        )}
      </div>
    </Modal>
  );
};

export const usePaymentPolling = (onSuccess, onFailure) => {
  const [isPolling, setIsPolling] = useState(false);
  const [currentTransactionId, setCurrentTransactionId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState(PAYMENT_STATUS.DRAFT);
  const [error, setError] = useState(null);

  const checkTransactionStatus = useCallback(async (transactionId) => {
    try {
      const response = await AuctionService.checkPaymentStatus(transactionId);

      if (response.status !== PAYMENT_STATUS.DRAFT) {
        setPaymentStatus(response.status);
        setIsPolling(false);

        if (response.status === PAYMENT_STATUS.SUCCESSED) {
          onSuccess?.(response);
        } else {
          onFailure?.(response.failureReason);
        }
      }
    } catch (err) {
      setError(err.message);
      setIsPolling(false);
      onFailure?.(err.message);
    }
  }, [onSuccess, onFailure]);

  useEffect(() => {
    let pollingInterval;
    let timeoutId;

    if (isPolling && currentTransactionId) {
      checkTransactionStatus(currentTransactionId);

      timeoutId = setTimeout(() => {
        setIsPolling(false);
        setError('Payment timeout');
        onFailure?.('Payment timeout');
      }, POLLING_CONFIG.TIMEOUT);

      // Đặt interval để tiếp tục polling
      pollingInterval = setInterval(() => {
        checkTransactionStatus(currentTransactionId);
      }, POLLING_CONFIG.INTERVAL);
    }

    return () => {
      if (pollingInterval) clearInterval(pollingInterval);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [isPolling, currentTransactionId, checkTransactionStatus]);

  const handleVnpayPayment = useCallback((auction,type=null) => {
    const paymentData = {
      amount: !!type ? auction.amount : (auction.registrationFee + auction.deposit) || 0,
      bankCode: "",
      auctionId: auction._id,
      userId:auction.userId
    };

    AuctionService.getURlPayment(paymentData)
      .then(response => {
        if (response.paymentUrl) {
          setCurrentTransactionId(response.transactionId);
          setIsPolling(true);
          setPaymentStatus(PAYMENT_STATUS.DRAFT);
          setError(null);

          window.open(response.paymentUrl, '_blank');
        }
      })
      .catch(error => {
        setError(error.message);
        onFailure?.(error.message);
      });
  }, []);

  return {
    handleVnpayPayment,
    paymentStatus,
    error,
    isPolling
  };
};

export default RegistrationSteps;
