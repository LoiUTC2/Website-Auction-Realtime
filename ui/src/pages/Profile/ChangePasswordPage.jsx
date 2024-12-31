'use client'

import React, { useState } from 'react';

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const validatePassword = () => {
    const { newPassword, confirmPassword } = formData;
    if (newPassword.length < 8) {
      setErrorMessage('Password must be at least 8 characters long!');
      return false;
    }
    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match!');
      return false;
    }
    setErrorMessage('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (validatePassword()) {
      // Here you can call the API to handle the password change
      console.log('Password changed:', formData);
      setSuccessMessage('Password changed successfully!');
      // Reset the form after successful change
      setFormData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-10 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl font-semibold mb-6 text-center text-gray-800">Change Password</h1>
        <form onSubmit={handleSubmit}>
          {/* Current Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="currentPassword">
              Current Password
            </label>
            <input
              type="password"
              id="currentPassword"
              name="currentPassword"
              value={formData.currentPassword}
              onChange={handleInputChange}
              placeholder="Enter your current password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              required
            />
          </div>

          {/* New Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="newPassword">
              New Password
            </label>
            <input
              type="password"
              id="newPassword"
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              placeholder="Enter your new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              required
            />
          </div>

          {/* Confirm New Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium mb-2 text-gray-700" htmlFor="confirmPassword">
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              placeholder="Confirm your new password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-150"
              required
            />
          </div>

          {/* Display error message if exists */}
          {errorMessage && <p className="text-red-500 text-sm mb-4">{errorMessage}</p>}
          {/* Display success message if exists */}
          {successMessage && <p className="text-green-500 text-sm mb-4">{successMessage}</p>}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition duration-200"
          >
            Change Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
