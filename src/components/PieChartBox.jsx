// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

const PieChartBox = ({ data }) => {
  return (
    <div className='flex h-full w-full flex-col justify-between overflow-x-auto p-2'>
      <h1 className='font-bold'>Location</h1>
      <div className='flex h-full w-full items-center justify-center'>
        <ResponsiveContainer width='99%' height={300}>
          <PieChart>
            <Tooltip
              contentStyle={{ background: 'white', borderRadius: '5px' }}
            />
            <Pie
              data={data}
              innerRadius={'70%'}
              outerRadius={'90%'}
              paddingAngle={5}
              dataKey='value'>
              {data.map((item, i) => (
                <Cell key={i} fill={item.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className='siz-[14px] flex flex-row flex-wrap content-center justify-between gap-2 max-md:gap-1 max-md:text-sm'>
        {data.map((item, i) => (
          <div className='flex flex-col items-center gap-2' key={i}>
            <div className='flex items-center gap-2'>
              <div
                className='h-[10px] w-[10px] rounded-full'
                style={{ backgroundColor: item.color }}
              />
              <span>{item.name}</span>
            </div>
            <span>{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PieChartBox;
