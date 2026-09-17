/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React from 'react';

const ChartBox = (props) => {
  const { number } = props;
  return (
    <div className='flex h-full w-full flex-col sm:max-md:min-w-96'>
      <div className='flex flex-col items-center justify-center gap-4 p-5'>
        <div
          className={`${props.bg === 'text' ? 'text-white' : ''
            } flex justify-center items-center  font-extrabold text-5xl max-md:text-5xl text-center`}>
          {number}
        </div>
      </div>
    </div>
  );
};

export default ChartBox;
