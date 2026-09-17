// eslint-disable-next-line no-unused-vars
import React from 'react';
import success from '../assets/success.png';

// eslint-disable-next-line react/prop-types
function Successful({ text, showModal, setShowModal }) {
  const closeModal = () => {
    setShowModal(!showModal);
  };

  return (
    <>
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50'>
          <div className='max-w-md rounded-lg bg-white p-8 text-center'>
            <div className='mb-4'>
              <img src={success} alt='' className='mx-auto h-24 w-24' />
              <p className='text-xl font-semibold'>{`${text} Successfully`}</p>
            </div>
            <div className='flex justify-center gap-4'>
              <button
                className='rounded bg-blue-500 px-4 py-2 text-white transition duration-300 hover:bg-blue-600'
                onClick={closeModal}>
                Close
              </button>
              <button
                className='rounded bg-gray-500 px-4 py-2 text-white transition duration-300 hover:bg-gray-600'
                onClick={closeModal}>
                close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Successful;
