import React, { useState } from 'react'
import { Form, Input, Button } from 'antd'

const BankInfoForm = ({ onSubmit }) => {
  const [form] = Form.useForm()

  const handleSubmit = () => {
    form.validateFields().then(values => {
      onSubmit(values)
      form.resetFields()
    })
  }

  return (
    <Form 
      form={form} 
      layout="vertical" 
      onFinish={handleSubmit}
      className="space-y-4"
    >
      <Form.Item
        name="bankName"
        label="Bank Name"
        rules={[{ required: true, message: 'Please input the bank name!' }]}
        className="mb-4"
      >
        <Input 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        name="accountHolderName"
        label="Account Holder Name"
        rules={[{ required: true, message: 'Please input the account holder name!' }]}
        className="mb-4"
      >
        <Input 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item
        name="accountNumber"
        label="Account Number"
        rules={[{ required: true, message: 'Please input the account number!' }]}
        className="mb-4"
      >
        <Input 
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </Form.Item>
      <Form.Item className="mb-0">
        <Button 
          type="primary" 
          htmlType="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-md transition-colors"
        >
          Save Bank Information
        </Button>
      </Form.Item>
    </Form>
  )
}

export default BankInfoForm
