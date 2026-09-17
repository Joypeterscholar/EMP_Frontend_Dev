// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line no-unused-vars
import { useNavigation } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const SubmitBtn = ({ text, isSubmitting }) => {

  return (
    <button
      type='submit'
      className='btn btn-neutral btn-block'
      disabled={isSubmitting}>
      {isSubmitting ? (
        <>
          <span className='loading loading-spinner'></span>
          sending...
        </>
      ) : (
        text || 'submit'
      )}
    </button>
  );
};
export default SubmitBtn;
