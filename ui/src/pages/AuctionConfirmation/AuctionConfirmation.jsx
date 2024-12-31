import React, { useEffect, useState } from 'react';
import { CheckCircleOutlined } from '@ant-design/icons';
import {
    Layout,
    Typography,
    Space,
    Radio,
    Button,
    Card,
    Row,
    Col,
    Form,
    Checkbox,
    Spin,
    message,
} from 'antd';
import productTemplate from '../../assets/productTemplate.jpg';
import mastercardLogo from '../../assets/mastercardLogo.png';
import vnpaylogo from '../../assets/vnpaylogo.jpg';
import { usePaymentPolling } from '../ProductDetail/RegistrationSteps';
import { formatCurrency, formatDate, openNotify } from '../../commons/MethodsCommons';
import { Helmet } from 'react-helmet';
import { useParams } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import AuctionService from '../../services/AuctionService';
import NotFound from '../NotFound';
import { AUCTION_STATUS } from '../../commons/Constant';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

export default function AuctionConfirmation() {
    const { token } = useParams()
    const [paymentMethod, setPaymentMethod] = useState('pickup');
    const [paymentType, setPaymentType] = useState('pickup');
    const [isPaid, setIsPaid] = useState(false);
    const [isConfirm, setIsConfirm] = useState(false);
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [termsChecked, setTermsChecked] = useState(false);
    const [confirmData, setConfirmData] = useState(null);
    const [auction, setAuction] = useState(null);
    const [product, setProduct] = useState(null);
    const [user, setUser] = useState(null);
    const { handleVnpayPayment, paymentStatus, error, isPolling } = usePaymentPolling(
        (response) => {
            // setIsPaid(true);
            setPaymentLoading(false);
            fetchData();
        },
        (error) => {
            openNotify('error', 'Payment failed. Try again!!')
        }
    );
    const fetchData = async () => {
        const { auctionId, customerId, productId } = jwtDecode(token);
        const data = await AuctionService.confirmAuction({ auctionId, customerId, productId });
        setConfirmData(data)
        setIsPaid(data.isPaied)
        setAuction(data.auction)
        setProduct(data.product);
        setIsConfirm(data.auction?.status == AUCTION_STATUS.WINNER_PAYMENTED);
    }
    
    useEffect(() => {
       try {
           const { auctionId, customerId, productId } = jwtDecode(token);
           setUser(customerId)
           fetchData();
       } catch (error) {
           return <NotFound/>
       }
    },[])
    

    const handleStartPayment = () => {
        handleVnpayPayment({ _id: auction._id, userId: user, amount: (auction.winningPrice - auction.deposit )}, 'confirm');
        setPaymentLoading(true);
    };

    // Hàm render card phương thức thanh toán
    const renderPaymentMethodCard = (value, title, description, logo = null, disabled) => (
        <Radio value={value} className="w-full" disabled ={disabled}>
            <Card
                className="w-full h-full hover:shadow-md transition-all duration-300 rounded-lg p-4 flex items-center"
                bodyStyle={{ display: 'flex', alignItems: 'center', width: '100%' }}
                onClick={() => setPaymentMethod(value)}
            >
                {logo && <img src={logo} alt={title} className="w-12 h-12 mr-4" />}
                <div className="flex-grow">
                    <h4 className="font-semibold text-base">{title}</h4>
                    <p className="text-sm text-gray-500">{description}</p>
                </div>
            </Card>
        </Radio>
    );
    const handleConfirm =async () => {
        if (!termsChecked) {
            message.error('You must agree to the terms and conditions.');
            return;
        }

        if (paymentMethod === 'payment_methods' && !isPaid) {
            message.error('Please complete the payment before confirming.');
            return;
        }

       try {
           const confirm = await AuctionService.updateStatus(auction._id, AUCTION_STATUS.WINNER_PAYMENTED)
           if (!!confirm)
               openNotify('success', 'Confirm successfully')
               setIsConfirm(true);
       } catch (error) {
        console.log(error)
       }
    };
    return auction && product && (
        <>
            <Helmet>
                <title>Auction Confirm</title>
                <meta property="og:title" content="Auction Confirm" />
                <meta property="og:description" content="Auction Confirm" />
            </Helmet>
            <Layout className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100">

                <Content className="py-12 px-4 lg:px-10">

                    <Card
                        className="max-w-3xl mx-auto shadow-2xl rounded-2xl overflow-hidden hover:shadow-xl transition-shadow duration-300"
                        style={{ borderRadius: '16px' }}
                    >
                        {/* Header */}
                        <Header className="bg-gradient-to-r from-blue-600 to-blue-500 text-center mb-3 ">
                            <Title level={2} className="text-white mt-1 tracking-wide flex items-center justify-center">
                                <div><CheckCircleOutlined className="mr-3 text-white" />
                                    Auction Confirmation</div>
                            </Title>
                            <Text className="text-black text-sm" >
                                Please confirm payment by <strong>{formatDate(new Date(new Date(auction.endTime).setDate(new Date(auction.endTime).getDate() + 2)))}</strong>
                            </Text>
                        </Header>

                        <Space direction="vertical" size="large" className="w-full p-6">
                            {/* Product Details */}
                            <Row gutter={16} align="middle" className="bg-gray-50 p-4 rounded-lg">
                                <Col xs={24} sm={6} className="text-center mb-4 sm:mb-0">
                                    <img
                                        src={product?.images[0] || productTemplate}
                                        alt="Product Image"
                                        className="mx-auto rounded-xl border-2 border-blue-100 shadow-md max-w-[120px] max-h-[120px] object-cover"
                                    />
                                </Col>
                                <Col xs={24} sm={18}>
                                    <Title level={3} className=" text-center sm:text-left">
                                        {product.productName}
                                    </Title>
                                    <div className="text-center sm:text-left">
                                        {/* <Text className="text-green-600 text-lg font-bold block">
                                        Winning Bid: ${auction.winningBid}
                                    </Text> */}
                                        <Text type="secondary" className="text-sm block ">
                                            Transaction ID: {auction._id}
                                        </Text>
                                        <div className="flex justify-between">
                                            <span className="font-medium w-28 mr-4">Winning Bid:</span>
                                            <span className="font-normal text-left w-1/2">{formatCurrency(auction.winningPrice)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="font-medium w-28 mr-4">Deposit:</span>
                                            <span className="font-normal text-left w-1/2">- {formatCurrency(auction.deposit)}</span>
                                        </div>

                                        <div className="flex justify-between">
                                            <span className="font-medium w-28 mr-4">Total Receiving:</span>
                                            <span className=" text-left w-1/2 font-bold"> {formatCurrency(
                                                auction.winningPrice - auction.deposit
                                            )}</span>
                                        </div>

                                    </div>
                                </Col>
                            </Row>

                            {/* Payment Methods */}
                            <Space direction="vertical" className="w-full">
                                <Title level={4} className="mb-4">Payment Method</Title>
                                {isPaid ? (
                                    <Card className="bg-green-50 border-green-200 p-4 text-center">
                                        <Text strong className="text-green-600 text-lg">Payment Completed</Text>
                                        <Text className="block mt-1">Thank you for your payment!</Text>
                                    </Card>
                                ) : (
                                    <>
                                        <Radio.Group
                                            onChange={(e) => setPaymentMethod(e.target.value)}
                                            value={paymentMethod}
                                            className="w-full"
                                        >
                                            <Row gutter={[16, 16]} className="w-full">
                                                <Col xs={24} sm={12}>
                                                    {renderPaymentMethodCard(
                                                        'pickup',
                                                        'Thanh toán khi nhận hàng',
                                                        'Thanh toán khi nhận hàng'
                                                    )}
                                                </Col>
                                                <Col xs={24} sm={12}>
                                                    {renderPaymentMethodCard(
                                                        'payment_methods',
                                                        'Thanh toán chuyển khoản',
                                                        'Thanh toán trước khi nhận hàng'
                                                    )}
                                                </Col>
                                            </Row>
                                        </Radio.Group>

                                        {paymentMethod === 'payment_methods' && (
                                            <Radio.Group
                                                onChange={(e) => setPaymentType(e.target.value)}
                                                className="w-full mt-4"
                                            >
                                                <Row gutter={[16, 16]} className="w-full">
                                                    <Col xs={24} sm={12}>
                                                        {renderPaymentMethodCard(
                                                            'vnpay',
                                                            'VNPay',
                                                            'Thanh toán an toàn qua VNPay',
                                                            vnpaylogo,
                                                        )}
                                                        {paymentType === 'vnpay' && (
                                                            <div className="mt-4 text-center">
                                                                {paymentLoading ? (
                                                                    <Spin />
                                                                ) : (
                                                                    <Button type="primary" onClick={handleStartPayment}>
                                                                        Thanh toán
                                                                    </Button>
                                                                )}
                                                            </div>
                                                        )}
                                                    </Col>
                                                    <Col xs={24} sm={12}>
                                                        {renderPaymentMethodCard(
                                                            'bank_transfer',
                                                            'Chuyển khoản ngân hàng',
                                                            'Thanh toán qua liên ngân hàng',
                                                            mastercardLogo,
                                                            true
                                                        )}
                                                    </Col>
                                                </Row>
                                            </Radio.Group>
                                        )}
                                    </>
                                )}
                            </Space>

                            {/* Pickup Details */}
                            <Space direction="vertical" className="w-full">
                                <Title level={4} className="mb-4">Pickup Location</Title>
                                <Card className="bg-gray-100 rounded-lg p-4">
                                    <Text strong className="block mb-2">Pickup Address:</Text>
                                    <Text className="block">Le Van Viet, Thu Duc, TP. Ho Chi Minh</Text>
                                </Card>
                            </Space>

                            {/* Terms and Confirmation */}
                            <Space direction="vertical" className="w-full">

                                <Checkbox checked={termsChecked || isConfirm} disabled={isConfirm} onClick={(e) => setTermsChecked(!termsChecked)}>
                                    I agree to the <a href="#" className="text-blue-600 hover:underline">terms and conditions</a>
                                </Checkbox>
                                {!isConfirm ? (
                                    <Button type="primary" block onClick={handleConfirm}>
                                        Confirm & Proceed
                                    </Button>
                                )
                                    : (
                                        <Button type="primary" disabled block onClick={handleConfirm}>
                                            Confirmed
                                        </Button>
                                    )}
                            </Space>
                        </Space>
                    </Card>
                </Content>
            </Layout>
        </>

    );
}