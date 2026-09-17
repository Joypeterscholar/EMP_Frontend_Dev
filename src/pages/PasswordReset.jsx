import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { CiLock } from 'react-icons/ci';
import png from '../assets/mask.png';

const PasswordReset = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate('/password-otp');
    //   setIsSubmitting(true);
    //   try {
    //     const response = await customFetch.post('/user/login', {
    //       email,
    //     });
    //     const userData = response.data.status !== 'error' ? response.data : null;
    //     if (userData) {
    //       dispatch(loginUser(userData));
    //       toast.success('Kindly check your email');
    //       navigate('/otp-input');
    //     } else {
    //       toast.error(`${response.data.message}`);
    //     }
    //   } catch (err) {
    //     const errorMessage =
    //       err?.response?.data?.msg || 'please double check your credentials';
    //     toast.error(errorMessage);
    //     return null;
    //   } finally {
    //     setIsSubmitting(false);
    //   }
  };

  return (
    <div className='LoginWrapper h-screen'>
      <form method='POST' className='Login' onSubmit={handleSubmit}>
        <div className='Wrapper'>
          <div className='background1'></div>
          <div className='background2 h-screen'>
            <img src={png} className='h-screen' alt='' />
          </div>
        </div>
        <div className='loginContainer'>
          <p className='items-center justify-center flex'>
            <CiLock className='w-10 h-10' />
          </p>
          <p className='text-center font-bold mb-3'>Forgot Password</p>
          <div className='emailContainer'>
            <p>Email Address</p>
            <input
              type='text'
              placeholder='enter your email'
              onChange={(e) => setEmail(e.target.value)}
              value={email}
              required
            />
          </div>
          <div></div>
          <button
            className='btn btn-neutral w-full'
            type='submit'
            disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <span className='loading loading-spinner'></span>
                sending...
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PasswordReset;
