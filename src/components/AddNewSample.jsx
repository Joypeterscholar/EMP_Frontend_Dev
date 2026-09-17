// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react'
import { toast } from 'react-toastify';
import { customFetch } from '../utils';
import { useSelector } from "react-redux";
import { memoize } from 'proxy-memoize';
import { Button } from '@mui/material';

function AddNewSample() {
    const user = useSelector(memoize((state) => state.userState.user));
    const [isSubmittingSample, setIsSubmittingSample] = useState(false);
    const [sampleFormData, setSampleFormData] = useState({
        name: '',
        description: '',
        user: user?._id,
    });

    const handleInputChangeSample = (e) => {
        const { name, value, files } = e.target;
        setSampleFormData({
            ...sampleFormData,
            [name]: files ? files[0] : value,
        });
    };

    const handleSubmitSampleForm = async (event) => {
        event.preventDefault();
        setIsSubmittingSample(true);
        try {
            const formDataForSample = new FormData();
            formDataForSample.append('name', sampleFormData.name);
            formDataForSample.append('description', sampleFormData.description);
            formDataForSample.append('user', sampleFormData.user);


            const response = await customFetch.post(
                '/sample/create-sample',
                formDataForSample
            );

            if (response.data?.status !== 'error') {
                toast.success(`Sample added successfully`);
            } else {
                toast.error(response.data?.message)
            }
            setSampleFormData(sampleFormData);
        } catch (error) {
            const errorMessage = error?.response?.data?.msg || 'Error adding Sample';
            toast.error(errorMessage);
        } finally {
            setIsSubmittingSample(false);
        }
    };
    return (
        <form className='flex h-auto w-full flex-col items-center justify-center gap-4 overflow-y-auto'>
            <div className='flex w-full flex-col justify-start gap-1'>
                <label className='flex w-full' htmlFor="name">Name:</label>
                <input
                    className='flex h-11 w-full rounded-md border border-solid border-black px-1'
                    type="text"
                    id="name"
                    value={sampleFormData.name}
                    onChange={handleInputChangeSample}
                />
            </div>
            <div className='flex w-full flex-col justify-start gap-1'>
                <label className='flex w-full' htmlFor="description">Description:</label>
                <textarea
                    className='input flex h-auto w-full rounded-md border border-solid border-black px-1'
                    id="description"
                    value={sampleFormData.description}
                    onChange={handleInputChangeSample}
                    rows="4"
                    cols="40"
                ></textarea>
            </div>
            <div className='mb-5 flex w-full flex-col items-center justify-center gap-2'>
                <Button
                    onClick={handleSubmitSampleForm}
                    className='btn btn-neutral my-3 h-10 w-full border-solid'
                    type='submit'
                    disabled={isSubmittingSample}>
                    {isSubmittingSample ? (
                        <>
                            <span className='loading loading-spinner'></span>
                            submitting...
                        </>
                    ) : (
                        'Submit'
                    )}
                </Button>
            </div>
        </form>
    )
}

export default AddNewSample