import React, { useState, useRef } from 'react';

const OtpInput = ({ value, onChange, length }) => {
  const inputs = useRef([]);
  const [internalValue, setInternalValue] = useState(
    value || Array(length).fill('')
  );
  const handleChange = (event, index) => {
    const newValue = event.target.value.slice(0, 1);
    const updatedValue = [...internalValue];
    updatedValue[index] = newValue;
    setInternalValue(updatedValue);
    onChange(updatedValue);

    if (newValue && index < length - 1) {
      inputs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (event, index) => {
    if (event.key === 'Backspace' && index > 0) {
      onChange('', index - 1);
      inputs.current[index - 1].focus();
    }
  };

  return (
    <div className='otp-container flex space-x-2 gap-4'>
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => (inputs.current[index] = el)}
          type='tel'
          maxLength='1'
          value={value[index] || ''}
          onChange={(e) => handleChange(e, index)}
          onKeyDown={(e) => handleKeyDown(e, index)}
          autoFocus={index === 0}
          className='w-2 h-10 border border-gray-300 rounded px-2 text-center focus:outline-none focus:ring-2 focus:ring-indigo-500'
        />
      ))}
    </div>
  );
};

export default OtpInput;
