'use client'

import React, { useEffect, useState } from 'react'
import { Layout, Typography, Input, Select, Button, Modal, Tag, message } from 'antd'
import { SearchOutlined, BankOutlined } from '@ant-design/icons'
import BankInfoForm from './BankInfoForm'
import TransactionReportButton from './AuctionSubmissionReport'
import AuctionService from '../../services/AuctionService'
import { formatCurrency, formatDateTime, openNotify } from '../../commons/MethodsCommons'
import { Helmet } from 'react-helmet'
import { AUCTION_STATUS } from '../../commons/Constant'

const { Header, Content } = Layout
const { Title } = Typography
const { Option } = Select

export default function AuctionSubmissions() {
  const [searchText, setSearchText] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [isBankInfoModalVisible, setIsBankInfoModalVisible] = useState(false)
  const [selectedAuction, setSelectedAuction] = useState(null)
  const [auctionsList, setAuctionsList] = useState([])
  const [loading, setLoading] = useState(false)

  // Fetch auctions from server
  useEffect(() => {
    const fetchAuctions = async () => {
      setLoading(true)
      try {
        const { docs } = await AuctionService.getMyAuctions({
          limit: 10,
          page: 1,
        })
        setAuctionsList(docs)
      } catch (error) {
        console.error('Error fetching auctions:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchAuctions()
  }, [])

  // Handle status color
  const getStatusColor = (status) => {
    const colors = {
      pending: 'yellow',
      active: 'blue',
      successful: 'green',
      ended: 'red',
      cancelled: 'gray',
    }
    return colors[status] || 'default'
  }

  // Handle update bank info
  const handleUpdateBankInfo = async (values) => {
    try {
      await AuctionService.updateBankInfo(selectedAuction._id, values)
      openNotify('success','Bank information updated successfully')
      setIsBankInfoModalVisible(false)

      // Refresh auction list
      const updatedAuctions = auctionsList.map(auction =>
        auction._id === selectedAuction._id
          ? { ...auction, winnerBankInfo: values }
          : auction
      )
      setAuctionsList(updatedAuctions)
    } catch (error) {
      console.error('Error updating bank info:', error)
      message.error('Failed to update bank information')
    }
  }

  // Filter auctions
  const filteredAuctions = auctionsList.filter(auction =>
    (statusFilter === 'All' || auction.status === statusFilter) &&
    (auction.product.productName?.toLowerCase().includes(searchText.toLowerCase()) ||
      auction._id?.toLowerCase().includes(searchText.toLowerCase()))
  )

  return (
    <>
      <Helmet>
        <title>Auction Submissions</title>
        <meta property="og:title" content="Auction Submissions" />
        <meta property="og:description" content="Auction Submissions" />
      </Helmet>
      <Layout className="min-h-screen bg-gray-50 container max-w-[80%] mx-auto">
        <Header className="bg-white">
          <Title level={2} className="text-center py-4 border-0">My Auctioned Products</Title>
        </Header>
        <Content className="p-6">
          <div className="flex justify-between mb-6">
            <Input
              placeholder="Search by product name or auction ID"
              prefix={<SearchOutlined />}
              className="w-1/2"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
            <Select
              defaultValue="All"
              className="w-1/4"
              onChange={(value) => setStatusFilter(value)}
            >
              <Option value="All">All Status</Option>
              <Option value="pending">Pending</Option>
              <Option value="active">Active</Option>
              <Option value="successful">Successful</Option>
              <Option value="ended">Ended</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="text-center">Loading...</div>
            ) : filteredAuctions.map(auction => (
              <div
                key={auction._id}
                className="bg-white rounded-lg shadow-md p-6 flex items-center space-x-6 hover:shadow-lg transition-shadow"
              >
                <img
                  src={auction.product?.images?.at(-1) || '/placeholder.svg'}
                  alt={auction.product.productName}
                  className="w-24 h-24 object-cover rounded-md"
                />
                <div className="flex-grow">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold">{auction.product.productName}</h3>
                    <Tag color={getStatusColor(auction.status)}>
                      {auction.status}
                    </Tag>
                  </div>
                  <p className="text-gray-600 mt-2 line-clamp-3">{auction.product.description}</p>
                  <div className="mt-2 text-sm text-gray-500">
                    <span>Auction ID: {auction._id}</span>
                    <span className="ml-4">Start: {formatDateTime(auction.startTime)}</span>
                    <span className="ml-4">End: {formatDateTime(auction.endTime)}</span>
                  </div>
                  <div className="mt-2 flex justify-between items-start space-x-8">
                    <div className="flex flex-col space-y-2 w-auto">
                      <div className="flex justify-between">
                        <span className="font-medium w-28 mr-4">Winning Price:</span>
                        <span className="font-normal text-left w-1/2">{formatCurrency(auction.winningPrice)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium w-28 mr-4">Register Fee:</span>
                        <span className="font-normal text-left w-1/2">- {formatCurrency(auction.signupFee)}</span>
                      </div>

                      <div className="flex justify-between">
                        <span className="font-medium w-28 mr-4">Total Receiving:</span>
                        <span className=" text-left w-1/2 font-bold"> {formatCurrency(
                          auction.winningPrice - auction.signupFee
                        )}</span>
                      </div>
                    </div>
                    {auction.status === AUCTION_STATUS.WINNER_PAYMENTED && (
                      <div className="flex space-x-4 items-center mt-auto">
                        {!auction.winnerBankInfo && (
                          <Button
                            icon={<BankOutlined />}
                            onClick={() => {
                              setSelectedAuction(auction)
                              setIsBankInfoModalVisible(true)
                            }}
                          >
                            Update Bank Info
                          </Button>
                        )}
                        <TransactionReportButton
                          disabled={!auction.winnerBankInfo}
                          data={auction}
                        />
                      </div>
                    )}
                  </div>

                </div>
              </div>
            ))}
          </div>
        </Content>

        <Modal
          title="Update Bank Information"
          visible={isBankInfoModalVisible}
          onCancel={() => setIsBankInfoModalVisible(false)}
          footer={null}
        >
          <BankInfoForm onSubmit={handleUpdateBankInfo} />
        </Modal>
      </Layout>
    </>
  
  )
}
