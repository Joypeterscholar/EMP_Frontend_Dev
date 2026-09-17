import './index.css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import 'react-toastify/dist/ReactToastify.css';
import { ToastContainer } from 'react-toastify';
import { store } from './redux/store.js';
import { Provider } from 'react-redux';
import { StyledEngineProvider } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

ReactDOM.createRoot(document.getElementById('root')).render(
  <StyledEngineProvider injectFirst>
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Provider store={store}>
        <ToastContainer
          position='top-right'
          autoClose={5000}
          closeOnClick
          pauseOnHover
          theme='colored'
        />
        <App />
      </Provider>
    </LocalizationProvider>
  </StyledEngineProvider>
);
