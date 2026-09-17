/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useRef, useState, useEffect } from 'react';
import { BarChart as CustomBarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';

const BarChart = ({ data, barColor = "#8884d8", xAxisKey = "name", barDataKey = "uv", margin = { top: 0, right: 0, bottom: 0, left: 0 }, barCategoryGap = "20%", barGap = 5 }) => {
  const [width, setWidth] = useState(600);
  const [height, setHeight] = useState(300);
  const divRef = useRef();

  useEffect(() => {
    if (divRef.current) {
      setWidth(divRef.current.offsetWidth);
      setHeight(divRef.current.offsetHeight);
    }
  }, [divRef]);

  return (
    <div className='block w-full h-full' ref={divRef}>
      <CustomBarChart width={width} height={height} data={data} margin={margin} 
      barCategoryGap={barCategoryGap} barGap={barGap}
      >
        <Bar dataKey={barDataKey} fill={barColor} />
        <CartesianGrid strokeDasharray="5 5" />
        <XAxis dataKey={xAxisKey} />
        <YAxis />
        <Tooltip />
        <Legend />
      </CustomBarChart>
    </div>
  );
};

export default BarChart;
