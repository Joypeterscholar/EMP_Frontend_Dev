"use client";
import { createReducer } from '@reduxjs/toolkit';
import { toggleMenu } from '../actions/menuActions';


const menuState = {
    mobile: false
};

const menuReducer = createReducer(menuState, builder => {
    builder.addCase(toggleMenu, (state, action) => {
        return { ...state, mobile: action.payload };
    });
});

export default menuReducer;