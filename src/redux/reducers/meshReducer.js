"use client";
import { createReducer } from '@reduxjs/toolkit';
import { dispatchSelectedMesh, dispatchSelectedMeshTags } from '../actions/meshActions';


const selectedMeshState = {
  data: '',
  activeMeshData: {},
  tags: []
};

const selectedMeshReducer = createReducer(selectedMeshState, builder => {
    builder.addCase(dispatchSelectedMesh, (state, action) => {
        const result = state.tags.filter((tag) => tag.taggedInfo === action.payload || JSON.parse(tag.taggedInfo)?.meshName === JSON.parse(action.payload)?.meshName)[0]
        return {...state, data: action.payload, activeMeshData: result}
    });
    builder.addCase(dispatchSelectedMeshTags, (state, action) => {
        return {...state, tags: action.payload }
    });
});

export default selectedMeshReducer;