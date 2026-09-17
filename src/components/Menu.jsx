// Menu.jsx
import React from 'react';
import NavLinks from './NavLinks';
import '../styles/menu.css';
import logo from '../assets/logo.png';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { memoize } from 'proxy-memoize';
import { toggleMenu } from '../redux/actions/menuActions';
import { logoutUser } from '../redux/actions/userActions';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import { Button } from "../components/ui/button"; // Using Shadcn button instead of MUI

function Menu() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const mobile = useSelector(memoize((state) => state.menuState.mobile));
  const user = getUserFromLocalStorage();

  const mobileMode = () => {
    dispatch(toggleMenu(!mobile));
  };

  const handleLogout = () => {
    dispatch(logoutUser());
    localStorage.clear();
    return navigate('/login');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between py-4 w-full">
      {/* Top Section */}
      <div className="flex flex-col space-y-8">
        {/* Logo Section */}
        <div className="px-4">
          {/* Mobile Hamburger */}
          <div className="md:hidden w-full flex justify-end mb-4">
            <button onClick={mobileMode} className="p-2">
              <img src="/img/icons8-menu-24 (1).png" alt="menu" className="w-6 h-6" />
            </button>
          </div>
          
          {/* Logo */}
          <div className="flex justify-center items-center">
            <img 
              src={logo} 
              alt="logo" 
              className="w-[150px] max-w-full h-auto object-contain"
            />
          </div>
        </div>

        {/* Navigation Links */}
        <div className="w-full">
          <nav className="px-2">
            <ul className="flex flex-col space-y-2">
              <NavLinks />
            </ul>
          </nav>
        </div>
      </div>

      {/* Bottom Section */}
      <div className="px-4 space-y-4">
        {/* Location Display */}
        <div className="text-center text-blue-900 font-medium">
          {user?.role === "superAdmin" ? "All locations" : user?.locations?.name}
        </div>
        
        {/* Logout Button */}
        <Button 
          onClick={handleLogout}
          className="w-full bg-primary hover:bg-primary/90 text-white"
        >
          Logout
        </Button>
      </div>
    </div>
  );
}

export default Menu;