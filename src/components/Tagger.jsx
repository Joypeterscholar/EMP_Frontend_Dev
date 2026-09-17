// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Users } from '../assets/data';
import { Button, Card } from '@mui/material';
import { getRealFileUrl } from '../utils';

const Tagger = () => {
  return (
    <div className='items-around flex flex-col justify-evenly'>
      <h1 className='mb-3 font-bold'>Recent taggers</h1>
      <div className='overflow-x-auto max-sm:w-full'>
        <div className='mb-4 flex h-48 items-center justify-evenly gap-1 max-md:w-[fit-content] max-md:justify-center'>
          {Users.map((user, index) => (
            <Card
              className='flex min-w-32 flex-grow flex-col items-center justify-between gap-2 p-2 shadow-none'
              key={index}>
              <div className='flex'>
                <img
                  src={getRealFileUrl(user.img)}
                  alt='avatar'
                  className='h-[70px] w-[70px] rounded-full object-cover'
                />
              </div>
              <div className='flex'>
                <span className='truncate'>{user.username}</span>
              </div>
              <div className='flex'>
                <Button className='btn btn-neutral btn-sm rounded-lg text-sm capitalize max-sm:truncate'>
                  View profile
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      <Button className='btn btn-outline btn-neutral w-full capitalize max-sm:truncate'>
        {' '}
        View all taggers
      </Button>
    </div>
  );
};

export default Tagger;
