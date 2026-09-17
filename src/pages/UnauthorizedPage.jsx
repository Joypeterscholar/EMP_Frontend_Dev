import React from 'react';
import { Link } from 'react-router-dom';

const UnauthorizedPage = () => {
  return (
    <div className='min-h-screen bg-gray-100 flex flex-col justify-center items-center'>
      <div className='bg-white p-8 rounded-lg shadow-md text-center'>
        <h1 className='text-3xl font-bold mb-4'>Unauthorized Access</h1>
        <p className='text-gray-600'>
          You are not authorized to view this page.
        </p>
        <Link
          to='/login'
          className='mt-8 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
          Go to Login
        </Link>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
