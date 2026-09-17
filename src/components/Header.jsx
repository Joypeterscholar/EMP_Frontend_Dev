// eslint-disable-next-line no-unused-vars
import React from 'react';
import '../styles/Header.css';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation } from 'react-router-dom';
import HeaderDropDown from './HeaderDropdown';
import { toggleMenu } from '../redux/actions/menuActions';
import { memoize } from 'proxy-memoize';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import { getRealFileUrl } from '../utils';

// eslint-disable-next-line react/prop-types
const Header = ({ className, style }) => {
  const location = useLocation();
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  const links = [
    {
      id: 1,
      url: `${['admin', 'superAdmin'].includes(currentUser.role)
        ? '/admin'
        : `/${['sampler', 'tagger'].includes(currentUser.role) ? '/sampler': '/reviewer'}`
        }`,
      text: 'Dashboard',
    },
    { id: 2, url: 'models', text: 'Facilities' },
    { id: 3, url: 'users', text: 'Users' },
    { id: 4, url: 'location', text: 'Locations' },
    { id: 5, url: 'sample', text: 'Sample Type' },
    { id: 6, url: 'report', text: 'Report' },
    { id: 7, url: 'trash', text: 'Recycle Bin' },
  ];
  const path = useLocation().pathname.split('/').pop();
  const activeLinkText = String(path).replace('-', ' ');
  const activeText =
    links.find(
      (link) =>
        location.pathname ===
        '/' +
        (['admin', 'superAdmin'].includes(currentUser.role)
          ? 'admin'
          : currentUser.role) +
        '/' +
        link.url
    )?.text ?? `${activeLinkText !== 'undefined' ? activeLinkText : 'Dashboard'}`;

  const dispatch = useDispatch();
  const mobile = useSelector(memoize((state) => state.menuState.mobile));
  const mobileMode = () => {
    dispatch(toggleMenu(!mobile));
  };
  const isHexString = (inputString) => {
    const uuidPattern = new RegExp('^[0-9a-f]+$','i');
    return uuidPattern.test(inputString);
};

const isRoleValue = (inputString) => {
  return ['admin', 'sampler', 'reviewer', 'tagger'].includes(inputString)
}
  return (
    <div
      className={`flex justify-center items-center py-5 w-full headerTop h-[100px] ${className}`}
      style={style}>
      <nav className='flex flex-row flex-grow justify-between items-center px-10 w-auto h-full max-md:px-2'>
        <div className='flex gap-3 justify-center items-center max-sm:flex-grow max-sm:justify-around'>
          <div
            className='flex p-2 rounded-md border border-solid sm:hidden'
            onClick={mobileMode}>
            <img src='/img/icons8-menu-24.png' alt='' />
          </div>
          <div className='flex text-2xl font-medium tracking-wider capitalize max-sm:text-lg'>
            {isHexString(activeText) ? '' : isRoleValue(activeText) ? 'Dashboard' : activeText }
          </div>
        </div>
        <div className='flex gap-1 py-2 pl-4 rounded-md userInfo bg-slate-300'>
          <div className='avatar'>
            <div className='w-10 h-10 rounded-full'>
              <img
                src={`${currentUser?.imageUrl ? getRealFileUrl(currentUser.imageUrl) :
                  "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=1000&auto=format&fit=crop"
                }`}
                alt=''
              />
            </div>
          </div>
          <div className='flex flex-row justify-center items-center text-lg font-bold capitalize sm:text-sm'>
            <span className='max-sm:hidden'>
              {currentUser?.username} &nbsp;
            </span>
            <HeaderDropDown />
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Header;
