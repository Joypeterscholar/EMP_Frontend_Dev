// eslint-disable-next-line no-unused-vars
import React from 'react';
import { FormInput, FormSelect, SectionTitle } from '../components';
import { CiCirclePlus } from 'react-icons/ci';
import { customFetch } from '../utils';
import { useLoaderData } from 'react-router-dom';
import { useState } from 'react';
import { useSelector } from "react-redux";
import { memoize } from 'proxy-memoize';

const singleModelQuery = (id) => {
  return {
    queryKey: ['singleModel', id],
    queryFn: () => customFetch(`/model/get-a-models/${id}`),
  };
};

// eslint-disable-next-line react-refresh/only-export-components
export const loader =
  (queryClient) =>
    async ({ params }) => {
      const response = await queryClient.ensureQueryData(
        singleModelQuery(params.id)
      );
      console.log(response);
      return { model: response.data };
    };

const ModelData = () => {
  const { model } = useLoaderData();
  const user = useSelector(memoize((state) => state.userState.user));
  // eslint-disable-next-line no-unused-vars
  const [formData, setFormData] = useState({
    fullname: user.fullname,
    incident: '',
    evidence: '',
    frequency: '',
    locations: '',
    listeria: '',
    apc: '',
    salmonella: '',
    sample: '',
    user: user,
    model: model,
    text: '',
  });
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevFormData) => ({
      ...prevFormData,
      [name]: value,
    }));
  };
  return (
    <div className='flex h-[100%] w-full'>
      <div className='h-screen w-[80%] bg-slate-400 p-2'></div>
      <div className='card flex h-screen w-[20%] flex-col justify-between bg-[#EEEEEE] px-4 py-5'>
        <div className='flex flex-col gap-2'>
          <SectionTitle text='input Facility Section data' />
          <div className='flex flex-col'>
            <FormInput
              onChange={(e) => handleChange(e)}
              label='Name of Tagger'
              type='text'
              name='fullname'
              placeholder='Full name'
              size='input-sm'
              value={formData.fullname}
            />
            <FormInput
              onChange={(e) => handleChange(e)}
              label='Location'
              placeholder='Enter location'
              type='text'
              name='locations'
              size='input-sm'
              value={formData?.locations}
            />
            <FormSelect
              onChange={(e) => handleChange(e)}
              name='listeria'
              label='Listeria'
              list={['positive', 'negative']}
              size='select-sm'
              value={formData?.listeria}
            />
            <FormInput
              onChange={(e) => handleChange(e)}
              label='APC'
              placeholder='0-1000'
              type='text'
              name='apc'
              size='input-sm'
              value={formData?.apc}
            />
            <FormSelect
              onChange={(e) => handleChange(e)}
              name='salmonella'
              label='Salmonella'
              list={['positive', 'negative']}
              size='select-sm'
              value={formData?.salmonella}
            />
            <FormInput
              onChange={(e) => handleChange(e)}
              label='Type of sample'
              placeholder='Type your sample'
              type='text'
              name='sample'
              size='input-sm'
              value={formData?.sample}
            />
            <FormInput
              onChange={(e) => handleChange(e)}
              label='Evidence'
              placeholder='File upload'
              type='fill'
              name='evidence'
              size='input-sm'
              value={formData?.evidence}
            />
            <div className='border-1 input input-sm input-bordered mt-1 flex items-center justify-center gap-1'>
              <p>Add custom Data</p>
              <CiCirclePlus />
            </div>
          </div>
        </div>
        <div className='mt-4 flex flex-col gap-2'>
          <button className='btn btn-neutral btn-sm w-full rounded-full'>
            Upload Data
          </button>
          <button className='btn btn-outline btn-neutral btn-sm w-full rounded-full'>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModelData;
