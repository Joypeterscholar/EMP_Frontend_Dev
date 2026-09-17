import React from 'react';
import { MdOutlineCancel } from 'react-icons/md';
import { SectionTitle } from '../components';
import { getRealFileUrl } from '../utils';

// eslint-disable-next-line react/prop-types
const EvidenceImage = ({ showModal, setShowModal, images, name }) => {
  const closeModal = () => {
    setShowModal(!showModal);
  };
  return (
    <>
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 py-4'>
          <form className='card relative flex max-w-md flex-grow flex-col justify-center gap-4 bg-base-100 px-4 h-[90%] z-40'>
            <div className='absolute right-3 top-1 z-50' onClick={closeModal}>
              <MdOutlineCancel className='h-5 w-5' />
            </div>
            <div className='rounded-lg justify-center flex items-center'>
              {images ? (
                <img
                  src={getRealFileUrl(images)}
                  alt='Something wrong with Evidence attached'
                  className='w-full h-[85%] object-cover rounded-lg'
                />
              ) : (
                <SectionTitle text={`No Evidence attached to ${name}`} />
              )}
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default EvidenceImage;
