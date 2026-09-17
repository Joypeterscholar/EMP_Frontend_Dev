// eslint-disable-next-line no-unused-vars
import React from "react";
import { Link, useRouteError } from "react-router-dom";

const ErrorElement = () => {
  const error = useRouteError();
  console.log(error.response?.status);

  if (error.response?.status === 401) {
    return (
      <div className="w-full flex flex-col flex-grow gap-5 justify-center items-center h-full min-h-[600px]">
        <h4 className="flex font-bold text-4xl">Opps</h4>
        <p className="flex flex-row justify-center items-center w-full">
          Your credentials have expired, please re-login
        </p>
        <Link
          to='/login'
          className='mt-8 inline-block bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded'>
          Go to Login
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col flex-grow gap-5 justify-center items-center h-full min-h-[600px]">
      <h4 className="flex font-bold text-4xl">Opps</h4>
      <p className="flex flex-row justify-center items-center w-full">
        Sorry, The server is temporarily Unavialable
      </p>
      <p className="flex flex-row justify-center items-center w-full text-red-950">
        Not Found
      </p>
    </div>
  );
};
export default ErrorElement;
