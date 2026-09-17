// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
// eslint-disable-next-line no-unused-vars
import { useLoaderData, useNavigate } from 'react-router-dom';
import '../styles/singleModel.css';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import MenuIcon from '@mui/icons-material/Menu';

import { FormInput } from '../components';
import { useDispatch, useSelector } from 'react-redux';
import { memoize } from 'proxy-memoize';
import { customFetch } from '../utils';
import ModelViewBabylon from '../components/ModelViewBabylon';
import { toast } from 'react-toastify';
import ModelOnScreenControls from '../components/ModelOnScreenControls';
import {
  Button,
} from '@mui/material';
import AddSample from './AddSample';
import { useQueryClient } from '@tanstack/react-query';
import { dispatchSelectedMeshTags } from '../redux/actions/meshActions';
import { toggleSetting } from '../redux/actions/settingActions';
import SettingsIcon from '@mui/icons-material/Settings';
import { getUserFromLocalStorage } from '../redux/reducers/userReducer';
import html2canvas from 'html2canvas-pro';

// eslint-disable-next-line react-refresh/only-export-components
export const loader =
  () =>
    async ({ params }) => {
      const response = await customFetch(`/model/get-a-models/${params.id}`);
      if (response?.data.status === 'error') {
        toast.error(response?.data.message);
      }
      return { model: response?.data?.data ?? [] };
    };

const TagListCreate = () => {
  const { model } = useLoaderData();
  const dispatch = useDispatch();
  const setting = useSelector(memoize((state) => state.settingState.setting));
  const settingMode = () => {
    dispatch(toggleSetting(!setting));
  };
  const [mobile, setMobile] = useState(false);
  const [addSample, setAddSample] = useState(false);
  const [newTaggedInfoName, setNewTaggedInfoName] = useState();
  const [newTaggedInfoPosition, setNewTaggedInfoPosition] = useState();
  const [newTaggedInfo, setNewTaggedInfo] = useState();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const goBack = () => {
    navigate(-1);
  };

  useEffect(() => {
    const tags = model?.tags;
    if (tags) {
      dispatch(dispatchSelectedMeshTags(tags));
    }
  }, [dispatch, model]);

  const user = useSelector((state) => state.userState.user);
  const localUser = getUserFromLocalStorage();
  const currentUser = localUser || user;
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  // eslint-disable-next-line no-unused-vars
  const modelInterationData = useSelector(
    memoize((state) => state.selectedMeshState.data)
  );

  const modelInterationActiveData = useSelector(
    memoize((state) => state.selectedMeshState.activeMeshData)
  );

  const destructureTaggedInfo = (modelInterationData) => {
    if (modelInterationData) {
      const newTaggedinfo = JSON.parse(modelInterationData);
      return [newTaggedinfo?.meshName, newTaggedinfo?.tagPosition];
    } else {
      return [];
    }
  };

  useEffect(() => {
    const [meshName, tagPosition] = destructureTaggedInfo(modelInterationData);
    if (
      meshName &&
      destructureTaggedInfo(modelInterationActiveData?.taggedInfo)[0]
    ) {
      setNewTaggedInfoName(modelInterationActiveData.objectName);
    } else {
      setNewTaggedInfoName(meshName);
    }
    setNewTaggedInfoPosition(tagPosition);
    setNewTaggedInfo(modelInterationData);
  }, [modelInterationData, modelInterationActiveData]);

  // eslint-disable-next-line no-unused-vars
  const [formData, setFormData] = useState({
    image: '',
    user: user?._id,
    model: model?._id,
    objectName: newTaggedInfoName,
    taggedInfo: newTaggedInfoPosition,
  });

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  const takeScreenshotAndUpload = () => {

    if (!document.getElementById('renderCanvas')) return;
    setIsCapturing(true);
    html2canvas(document.getElementById('renderCanvas')).then(canvas => {
      canvas.toBlob(blob => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onload = () => {
          const imageDataUrl = reader.result;
          setImageUrl(imageDataUrl);
          setIsCapturing(false);
        };
      }, 'image/jpeg');

    })
  }

  const getBinaryFromBase64 = (base64String) => {
    const byteString = atob(base64String.split(',')[1]);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const byteArray = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
      byteArray[i] = byteString.charCodeAt(i);
    }
    return new Blob([byteArray], { type: 'image/jpeg' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formDataForUpload = new FormData();
      const blob = getBinaryFromBase64(imageUrl);
      formDataForUpload.append('objectName', formData.objectName);
      formDataForUpload.append('image', blob, `${formData.objectName.replace(' ', '-')}.jpeg`);
      formDataForUpload.append('taggedInfo', newTaggedInfo);
      formDataForUpload.append('user', currentUser?._id);
      formDataForUpload.append('model', model?._id);

      const response = await customFetch.post('/gtags/create-gtags', formDataForUpload);
      queryClient.invalidateQueries('singleModel');

      if (response.data?.status !== 'error') {
        toast.success(`added successfully`);
        setFormData(formData);
      } else {
        toast.error(response.data?.message);
      }
      setFormData({
        image: '',
        user: user?._id,
        model: model?._id,
        objectName: newTaggedInfoName,
        taggedInfo: newTaggedInfoPosition,
      });
    } catch (error) {
      const errorMessage = error?.response?.data?.msg || 'Error saving info';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <>
      <div className='ReviewerDashBoardWraper h-screen'>
        <div className='ReviewerDashBoard'>
          {/*threejs animation wrapper start  */}
          <div className='threejsWrapper h-screen'>
            <div className='threejsAnimationWrapper h-screen w-screen'>
              <ModelViewBabylon MODEL_URL={model.file} tags={model?.tags} model={model} setTagsData={() => { }} />
            </div>
            <div className='navigation'>
              <div onClick={goBack}>
                <div className='backContainer cursor-pointer'>
                  <p>Back</p>
                  <CancelOutlinedIcon fontSize='small' />
                </div>
              </div>
              <div className='flex flex-row items-center justify-end gap-2'>
                <div className='hidden h-10 w-10'>
                  <SettingsIcon
                    className='cursor-pointer text-white'
                    onClick={() => settingMode()}
                  />
                </div>
                {mobile ? (
                  <div
                    className='menu flex h-10 w-10'
                    onClick={() => setMobile(!mobile)}>
                    {' '}
                    <MenuIcon className='cursor-pointer text-white' />
                  </div>
                ) : (
                  <div
                    className='mobileMenu flex h-10 w-10'
                    onClick={() => setMobile(!mobile)}>
                    {' '}
                    <MenuIcon className='cursor-pointer text-white' />
                  </div>
                )}
              </div>
            </div>
            <ModelOnScreenControls />
          </div>
          {/*threejs animation wrapper ends  */}

          {/* All information wrapper start */}
          <div className={mobile ? 'alldataWrapperMobile' : 'alldataWrapper'}>
            <div className='dataWrapper'>
              <div className='dataHistoryWrapper'>
                {/* header */}
                <div className='header px-2'>
                  <h1 className='text-2xl font-medium'>Create Sampling List</h1>
                  <div className='menuWrapper'>
                    <div
                      className='menu h-10 w-10'
                      onClick={() => setMobile(!mobile)}>
                      <MenuIcon />
                    </div>
                  </div>
                </div>
                {/* header end */}

                <form
                  onSubmit={handleSubmit}
                  method='POST'
                  encType='multipart/form-data'
                  className='mx-auto flex h-screen w-full flex-grow flex-col items-center justify-between gap-10'>
                  <div className='flex w-full flex-col gap-4 p-2'>
                    <div className='flex flex-col gap-5'>
                      <FormInput
                        onChange={(e) => {
                          handleInputChange(e);
                          setNewTaggedInfoName(e.target.value);
                        }}
                        label='Object Name'
                        type='text'
                        name='objectName'
                        placeholder='Object Name'
                        size='input-sm'
                        value={newTaggedInfoName}
                      />
                      <div className="form-control">
                        {imageUrl && <div className='flex w-full flex-col items-center justify-center gap-2 rounded-md py-1'><img className='aspect-square w-full' src={imageUrl} alt="Captured Screenshot" /></div>}
                        <Button
                          className='btn btn-neutral h-10 w-full rounded-md border-solid bg-green-700 text-white'
                          type='button'
                          onClick={() => takeScreenshotAndUpload()}
                          disabled={isCapturing}>
                          {isCapturing ? (
                            <>
                              <span className='loading loading-spinner'></span>
                              taking screenshot...
                            </>
                          ) : (
                            'Capture Object Image'
                          )}
                        </Button>
                      </div>
                    </div>
                    <div className='flex w-full flex-col items-center justify-center gap-2 py-1'>
                      <Button
                        className='btn btn-neutral h-10 w-full border-solid'
                        type='submit'
                        disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <span className='loading loading-spinner'></span>
                            processing...
                          </>
                        ) : (
                          'Submit'
                        )}
                      </Button>
                      <Button
                        className='btn btn-outline btn-neutral btn-sm h-10 w-full border-solid'
                        onClick={() => setFormData(formData)}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
          {/* All information wrapper end */}
        </div>
      </div>
      <AddSample showModal={addSample} setShowModal={setAddSample} />
    </>
  );
};

export default TagListCreate;
