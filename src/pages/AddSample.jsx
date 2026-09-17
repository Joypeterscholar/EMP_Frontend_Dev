// eslint-disable-next-line no-unused-vars
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { customFetch } from '../utils';
import { useSelector } from 'react-redux';
import { MdOutlineCancel } from 'react-icons/md';
import { CiLocationOn } from 'react-icons/ci';
import { AiOutlineCloudUpload } from 'react-icons/ai';
import { SubmitBtn } from '../components';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';

// eslint-disable-next-line react/prop-types
const AddSample = ({ showModal, setShowModal, fetchData }) => {
  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  const [isSubmittingSample, setIsSubmittingSample] = useState(false);
  const [imageName, setImageName] = useState('');
  const [sampleForm, setSampleForm] = useState({
    name: '',
    description: '',
    image: '',
  });

  const handleInputChangeSample = (e) => {
    const { name, value, files } = e.target;
    if (name === 'image') {
      setImageName(files[0].name);
    }
    setSampleForm({
      ...sampleForm,
      [name]: files ? files[0] : value,
    });
  };

  const handleSubmitSampleForm = async (event) => {
    event.preventDefault();
    setIsSubmittingSample(true);
    try {
      const formDataForSample = new FormData();
      formDataForSample.append('name', sampleForm.name);
      formDataForSample.append('description', sampleForm.description);
      formDataForSample.append('user', currentUser._id);
      formDataForSample.append('image', sampleForm.image);

      const response = await customFetch.post(
        '/sample/create-samples',
        formDataForSample
      );

      if (response.data?.status !== 'error') {
        toast.success(`Sample added successfully`);
        fetchData();
      } else {
        toast.error(response.data?.message);
      }
      setSampleForm({ name: '', description: '', image: '', user: currentUser?._id });
      setImageName('');
    } catch (error) {
      // const errorMessage = error?.response?.data?.msg || 'Error adding sample';
      // toast.error(errorMessage);
    } finally {
      setIsSubmittingSample(false);
    }
  };

  const closeModal = () => {
    setShowModal(!showModal);
  };
  return (
    <>
      {showModal && (
        <div className='fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 py-4'>
          <form
            encType='multipart/form-data'
            className='card relative flex max-w-md flex-grow flex-col justify-start gap-4 bg-base-100 py-1 px-4'
            onSubmit={handleSubmitSampleForm}>
            <div className='absolute right-5 top-5' onClick={closeModal}>
              <MdOutlineCancel className='h-5 w-5' />
            </div>
            <div className='flex flex-col items-center justify-center'>
              <CiLocationOn className='h-10 w-10' />
              <h3 className='mb-2 text-center text-2xl font-bold'>
                Add Sample
              </h3>
            </div>
            <div className='flex w-full flex-col justify-start gap-1'>
              <label className='flex w-full' htmlFor='name'>
                Name:
              </label>
              <input
                className='flex h-11 w-full rounded-md border border-solid border-black px-1'
                type='text'
                id='name'
                name='name'
                required
                value={sampleForm.name}
                onChange={(e) => handleInputChangeSample(e)}
              />
            </div>
            <div className='flex w-full flex-col justify-start gap-1'>
              <label className='flex w-full' htmlFor='description'>
                Description:
              </label>
              <textarea
                className='input flex h-auto w-full rounded-md border border-solid border-black px-1'
                id='description'
                name='description'
                value={sampleForm.description}
                onChange={(e) => handleInputChangeSample(e)}
                rows='4'
                cols='40'
                required></textarea>
            </div>
            <div
              className={`flex flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4`}>
              <div className='img'>
                <AiOutlineCloudUpload />
              </div>
              <div className='text-center'>
                <h3 className='text-lg font-bold'>
                  Choose a cover photo to upload
                </h3>
                <p>JPEG, PNG, up to 2MB</p>
              </div>
              <label className='btn'>
                <span>{imageName || 'Browse Files'}</span>
                <input
                  type='file'
                  name='image'
                  accept='.jpg, .jpeg, .png, .webp'
                  className='hidden'
                  onChange={(e) => handleInputChangeSample(e)}
                  required
                />
              </label>
            </div>
            <div className='mt-3'>
              <SubmitBtn text='Save' isSubmitting={isSubmittingSample} />
            </div>
          </form>
        </div>
      )}
    </>
  );
};

export default AddSample;
