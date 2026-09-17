/* eslint-disable no-unused-vars */
import React, { useState } from 'react';
import '../styles/DashBoard.css';
import Sample from './Sample';
import Incident from './Incident';

const FeatureForm = () => {
  const [activeItem, setActiveItem] = useState('sample');

  const handleItemClick = (item) => {
    setActiveItem(item);
  };
 
  return (
    <div className='flex w-auto flex-grow flex-col'>
      <div className='flex flex-col items-center justify-center'>
        <div className='flex items-center justify-center gap-4 rounded-full bg-slate-300 px-4 py-1'>
          <h3
            className={`${
              activeItem === 'sample' ? 'text-white bg-black' : ''
            } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick('sample')}>
            Sample Type
          </h3>
          <h3
            className={`${
              activeItem === 'incident' ? 'text-white bg-black' : ''
            } px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold`}
            onClick={() => handleItemClick('incident')}>
            Incident Type
          </h3>
        </div>
      </div>
      <div className='flex flex-col justify-center items-center'>
      {activeItem === 'sample' ? (
        <section className='w-full flex flex-col'>
          <Sample />
        </section>
      ) : (
        <section className='w-full flex flex-col'>
          <Incident />
        </section>
      )}
      </div>
    </div>
  );
};

export default FeatureForm;
