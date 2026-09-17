// eslint-disable-next-line no-unused-vars
import React from 'react';
import { Button } from '@mui/material';
import { useRouteError, Link } from 'react-router-dom';

const Error = () => {
  const error = useRouteError();
  console.log(error);

  if (error.status === 404) {
    return (
      <main className='grid min-h-[100vh] place-items-center px-8'>
        <div className='text-center'>
          <p className='text-9xl font-semibold text-red-600'>404</p>
          <h1 className='mt-4 text-3xl font-bold tracking-tight sm:text-5xl'>
            Page not found
          </h1>
          <p className='mt-6 text-lg leading-7'>
            Sorry, we couldn’t find the page you’re looking for.
          </p>
          <div className='mt-10'>
            <Link to='/' className='btn btn-primary'>
              Back Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <div className='flex h-screen w-full flex-grow flex-col items-center justify-center gap-5'>
      <h4 className='flex text-4xl font-bold'>Opps</h4>
      <p className='flex w-full flex-row items-center justify-center'>Sorry, An unexpected error just occured</p>
      <p className='flex w-full flex-row items-center justify-center text-red-950'>Seems your network connection is very low</p>
      <Button className="bg-blue-950 px-10 py-3" onClick={()=>location.reload()}>Please try again</Button>
    </div>
  );
};
export default Error;
