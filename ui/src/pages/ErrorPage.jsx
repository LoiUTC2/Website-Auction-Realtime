import React from 'react';
import { useRouteError, Link } from 'react-router-dom';

const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <h1 className="text-6xl font-bold text-red-500 mb-4">Oops!</h1>
      <p className="text-xl text-gray-600 mb-4">Đã xảy ra lỗi không mong muốn.</p>
      <p className="text-lg text-gray-500 mb-8">
        {error.statusText || error.message}
      </p>
      <Link 
        to="/" 
        className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
      >
        Quay về Trang chủ
      </Link>
    </div>
  );
};

export default ErrorPage;