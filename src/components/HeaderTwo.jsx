// eslint-disable-next-line no-unused-vars
import React, { useEffect } from 'react';
import '../styles/Header.css';
import logo from '../assets/logo.png';
import { useSelector } from "react-redux";
import HeaderDropDown from './HeaderDropdown';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import { useNavigate } from 'react-router-dom';

// eslint-disable-next-line react/prop-types
const HeaderTwo = ({ className, style }) => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  return (
    <div className={`flex justify-center items-center py-8 w-full headerTop ${className}`} style={style}>
      <nav className='flex flex-row flex-grow justify-between items-center px-10 w-auto h-full'>
        <div className='flex'>
          <div onClick={() => navigate('/')} className='text-2xl font-medium tracking-wider capitalize'>
            <div>
              <img className='mx-auto h-24 w-[15vw] object-contain max-md:w-[40vw]' src={logo} alt='Emapping' />
            </div>
          </div>
        </div>
        <div className='flex gap-4 userInfo'>
          <div className='avatar'>
            <div className='w-10 h-10 rounded-full'>
              {/* <img src='https://daisyui.com/images/stock/photo-1534528741775-53994a69daeb.jpg' /> */}
            </div>
          </div>
          <div className='flex flex-row justify-center items-center text-lg font-bold capitalize sm:text-sm'>
            <span>{currentUser.username} &nbsp;</span>
            <HeaderDropDown />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default HeaderTwo;
