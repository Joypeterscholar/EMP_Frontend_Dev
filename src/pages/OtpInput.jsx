import { useCallback, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Login.css';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { useDispatch } from 'react-redux';
import { CiLock } from 'react-icons/ci';
import png from '../assets/mask.png';
import { OtpInput } from '../components';

const TimerDisplay = ({ timer }) => {
  const minutes = Math.floor(timer / 60);
  const seconds = timer % 60;
  return (
    <p>
      Time remaining: {minutes} m {seconds} s
    </p>
  );
};

const Otpinput = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(3 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setTimer((prevTimer) => Math.max(0, prevTimer - 1));
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const handleResendClick = () => {
    setTimer(30 * 60);
    setOtp('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    navigate('/new-password');
    //     setIsSubmitting(true);
    //     try {
    //       const response = await customFetch.post('/user/login', {
    //         email,
    //       });
    //       const userData = response.data.status !== 'error' ? response.data : null;
    //       if (userData) {
    //         dispatch(loginUser(userData));
    //         toast.success('Kindly check your email');
    //         navigate('/otp-input');
    //       } else {
    //         toast.error(`${response.data.message}`);
    //       }
    //     } catch (err) {
    //       const errorMessage =
    //         err?.response?.data?.msg || 'please double check your credentials';
    //       toast.error(errorMessage);
    //       return null;
    //     } finally {
    //       setIsSubmitting(false);
    //     }
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
            <p>
              A Four-Digit verification Code has been sent to your email, kindly
              enter the four digit code.
            </p>
            <div className='items-center justify-center flex'>
              <OtpInput value={otp} onChange={setOtp} length={4} />
            </div>
          </div>
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
          <div className='items-center justify-center flex flex-col'>
            <TimerDisplay timer={timer} />
            {timer === 0 && (
              <button onClick={handleResendClick} className='btn btn-sm'>
                Resend
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default Otpinput;
