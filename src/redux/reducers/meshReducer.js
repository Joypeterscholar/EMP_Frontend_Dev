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
        // objectRef contract - see /docs/object-ref-contract.md. Prefer
        // matching by the stable objectId - two machines can share a
        // meshName, so meshName alone is only a fallback for older tags
        // that predate this field.
        const selected = JSON.parse(action.payload);
        const result = state.tags.filter((tag) => {
            if (tag.taggedInfo === action.payload) return true;
            if (selected?.objectId && tag.objectId) return tag.objectId === selected.objectId;
            return JSON.parse(tag.taggedInfo)?.meshName === selected?.meshName;
        })[0];
        return {...state, data: action.payload, activeMeshData: result}
    });
    builder.addCase(dispatchSelectedMeshTags, (state, action) => {
        return {...state, tags: action.payload }
    });
});

export default selectedMeshReducer;