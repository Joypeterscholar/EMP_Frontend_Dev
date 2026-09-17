// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { Button, Card } from '@mui/material';
import '../styles/DashBoard.css';
import { Link } from 'react-router-dom';
import { formatDate, formatTime, getRealFileUrl } from '../utils';

const ModelList = ({ text, users = [] }) => {
  const [viewAll, setViewAll] = useState(false);

  return (
    <div className=''>
      <div className='mx-2 flex items-center justify-between'>
        <h3>{text}</h3>
        <p
          onClick={() => setViewAll(!viewAll)}
          className='cursor-pointer font-semibold'>
          {viewAll ? 'view less' : 'view all'}
        </p>
      </div>
      <div>
        {users?.slice(0, viewAll ? users.length : 6).map((item, i) => {
          const { _id, coverPicture, createdAt, user, location } = item;
          return (
            <Card
              className={`my-3 flex  gap-4 flex-row items-center rounded-lg border-2 p-2 shadow ${viewAll ? 'slideFromTop' : 'slideBack'
                }`}
              key={i}>
              <div className='flex w-[90%] flex-row items-center gap-8 max-sm:flex-grow'>
                <div className='flex w-[20%] gap-2'>
                  <img
                    src={getRealFileUrl(coverPicture)}
                    alt=''
                    className='h-[50px] w-[50px] rounded-xl'
                  />
                  <div className='flex flex-col gap-2'>
                    <h1 className='truncate text-sm font-semibold'>
                      {location?.name}
                    </h1>
                    <p className='truncate text-xs font-normal'>
                      {location?.location}
                    </p>
                  </div>
                </div>
                <div className='item'>
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <p className='truncate text-xs font-normal'>Uploaded by</p>
                    <h1 className='truncate text-sm font-semibold'>
                      {user?.username}
                    </h1>
                  </div>
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <p className='truncate text-xs font-normal'>Time</p>
                    <h1 className='truncate text-sm font-semibold'>
                      {formatTime(createdAt)}
                    </h1>
                  </div>
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <p className='truncate text-xs font-normal'>Date</p>
                    <h1 className='truncate text-sm font-semibold'>
                      {formatDate(createdAt)}
                    </h1>
                  </div>
                </div>
              </div>
              <div className='flex w-[10%] justify-end'>
                <Link to={`/view-model/${_id}`}>
                  <Button className='text-sm capitalize'>View Facility Section</Button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ModelList;
