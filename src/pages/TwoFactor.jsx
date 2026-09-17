// eslint-disable-next-line no-unused-vars
import React from 'react';
import '../styles/Login.css';
import '../styles/AddUser.css';
import '../styles/TwoFactor.css';
import png from '../assets/mask.png';

const TwoFactor = () => {
  return (
    <div className='TwoFactor h-screen'>
      <div className='LoginWrapper'>
        <div className='Login'>
          <div className='Wrapper'>
            <div className='background1'></div>
            <div className='background2'>
              <img src={png} alt='' />
            </div>
          </div>
          <div className='loginContainer'>
            <div className='twofaImg'>
              <img
                src='/img/9004687_shield_security_safety_secure_protect_icon 1.png'
                alt=''
              />
            </div>
            <h1>Two-factor Authentication</h1>
            <p className='txt'>Enter the code sent to your email</p>
            <div className='inputWrapper'>
              <p>Authentication code</p>
              <input type='text' name='' id='' />
            </div>
            <div className='twofaBtn'>
              <button>Verify</button>
            </div>
            <div className='resendWrapper'>
              <h4>0:58</h4>
              <p>Re-send code</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TwoFactor;
