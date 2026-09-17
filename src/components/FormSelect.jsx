// eslint-disable-next-line no-unused-vars
import React from 'react';
/* eslint-disable react/prop-types */
// eslint-disable-next-line react/prop-types
const FormSelect = ({ label, name, list, defaultValue, size, onChange }) => {
  return (
    <div className='form-control'>
      <label htmlFor={name} className='label'>
        <span className='label-text capitalize'>{label}</span>
      </label>
      <select
        name={name}
        id={name}
        onChange={onChange}
        className={`select select-bordered h-10 ${size}`}
        defaultValue={defaultValue}
      >
        {Array.isArray(list) && list.map((item, index) => {
          return (
            <option key={index} value={item}>
              {item}
            </option>
          );
        })}
      </select>
    </div>
  );
};
export default FormSelect;
