"use client";
import { createReducer } from '@reduxjs/toolkit';
import { loginUser, logoutUser } from '../actions/userActions';
import { toast } from 'react-toastify';

export const getUserFromLocalStorage = () => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : {};
};

export const getAccessTokenFromLocalStorage = () => {
    const accessToken = localStorage.getItem('accessToken');
    return accessToken ? accessToken : '';
};

const userState = {
    user: {},
    accessToken: ''
};

const userReducer = createReducer(userState, builder => {
    builder.addCase(loginUser, (state, action) => {
        const userData = action.payload;
        localStorage.setItem('user', JSON.stringify(userData.data.user));
        localStorage.setItem('accessToken', userData.data.accessToken)
        return { ...state, user: userData.data.user, accessToken: userData.data.accessToken };
    });
    // eslint-disable-next-line no-unused-vars
    builder.addCase(logoutUser, (state, action) => {
        localStorage.removeItem('user');
        localStorage.removeItem('accessToken');
        toast.success('Logged out successfully');
        return { ...state, user: null, accessToken: null }
    });
});

export default userReducer;