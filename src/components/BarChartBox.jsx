// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  LabelList,
} from 'recharts';

const BarChartBox = (props) => {
  const [selectedChartData, setSelectedChartData] = useState('dailyData');

  const handleChartDataChange = (event) => {
    setSelectedChartData(event.target.value);
  };

  // eslint-disable-next-line react/prop-types
  const chartData = props.barChartData[selectedChartData];

  return (
    <div className='items-between flex h-full w-full flex-grow flex-col justify-between gap-5 p-2'>
      <div className='flex w-full flex-row items-center justify-between'>
        <div className='items-center justify-center font-bold'>
          {props.barChartData.title}
        </div>
        <div className='flex items-center justify-center'>
          <select
            value={selectedChartData}
            onChange={handleChartDataChange}
            className='rounded-md border px-2 py-1'>
            <option value='dailyData'>Daily Facility Sections</option>
            <option value='monthlyData'>Monthly Facility Sections</option>
          </select>
        </div>
      </div>
      <div className='flex h-auto w-full flex-col items-center mt-3 justify-center'>
        <ResponsiveContainer width='100%' height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey='name' />
            <Tooltip
              contentStyle={{ background: '#2a3447', borderRadius: '5px' }}
              labelStyle={{ display: 'none' }}
              cursor={{ fill: 'none' }}
            />
            <Bar
              dataKey={props.barChartData.dataKey}
              fill={props.barChartData.color}>
              <LabelList dataKey={props.barChartData.dataKey} position='top' />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BarChartBox;
