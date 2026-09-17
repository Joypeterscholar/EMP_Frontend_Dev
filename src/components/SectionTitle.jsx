// eslint-disable-next-line no-unused-vars
import React from 'react';
// eslint-disable-next-line react/prop-types
const SectionTitle = ({ text }) => {
  return (
    <div className='border-b border-base-300 pb-5'>
      <h2 className='text-2xl font-medium tracking-wider capitalize'>{text}</h2>
    </div>
  );
};
export default SectionTitle;
