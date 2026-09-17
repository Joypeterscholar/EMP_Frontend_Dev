"use client";
import { createReducer } from '@reduxjs/toolkit';
import { toggleSetting } from '../actions/settingActions';


const settingState = {
    setting:true
};

const settingReducer = createReducer(settingState, builder => {
    builder.addCase(toggleSetting, (state, action) => {
        return {...state, setting: action.payload};
    });
    
});

export default settingReducer;