// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import '../styles/AllUsers.css';
import AddSample from './AddSample';
import EditSample from './EditSample';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import TanstackTableTwo from '../components/TanstackTableTwo';


const Sample = () => {
  const [showModal, setShowModal] = useState(false);
  const [samples, setSamples] = useState();
  const [data, setData] = useState();
  const [showEdit, setShowEdit] = useState(false);
  const [activeRow, setActiveRow] = useState({});

  const fetchSamples = async () => {
    const response = await customFetch('/sample/samples');
    if (response.data.status !== 'error') {
      setSamples(response.data.data);
      setData(response.data.data);
    } else {
      toast.error(response.data.message);
    }
  };

  useEffect(() => {
    fetchSamples();
  }, []);


  const handleFilterSamples = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');
      const searchResult = samples.filter(
        (item) =>
          regex.test(item.name?.toLowerCase()) ||
          regex.test(item.description?.toLowerCase())
      );
      setData(searchResult);
    },
    [samples]
  );

  const handleEdit = (id) => {
    const result = samples.filter((row) => row._id === id)[0];
    setActiveRow(result);
    setShowEdit(true);
  };

  const handleDelete = async (id) => {
    try {
      await customFetch.delete(`/sample/samples-delete/${id}`);
      toast.success('sample deleted successfully');
      fetchSamples();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    {
      accessorKey: 'image',
      header: 'Image',
      cell: (info) => (
        <img className='h-20 w-20 rounded-full' src={info.getValue()} />
      ),
    },
    {
      accessorFn: (row) => row._id,
      header: 'Action',
      cell: (info) => (
        <div className='flex flex-row items-center justify-start gap-2'>
          <button
            onClick={() => handleEdit(info.getValue())}
            className='btn btn-outline btn-neutral btn-sm'>
            Edit
          </button>
          <button
            onClick={() => handleDelete(info.getValue())}
            className='btn btn-outline btn-neutral btn-sm'>
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <>
      <div className='AllUsers flex h-full flex-col gap-4 px-10 py-5'>
        <div className='flex justify-end'>
          <Button
            className='btn btn-success btn-sm mr-0'
            onClick={() => setShowModal(true)}>
            + Add Sample Type
          </Button>
        </div>
        <div className='searchBarContainer mx-auto w-full'>
          <div className='searchIconWrapper px-3'>
            <IoSearchSharp className='img searchImg' color='#858585' />
          </div>
          <input
            className='flex flex-grow flex-row'
            type='text'
            placeholder='Search sample Type'
            onChange={(e) => handleFilterSamples(e.target.value)}
          />
          <div className='filter'>
            <p>Search</p>
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <TanstackTableTwo columns={columns} tableData={data || {}} />
        </div>
      </div>
      <AddSample
        showModal={showModal}
        setShowModal={setShowModal}
        fetchData={fetchSamples}
      />
      {
        <EditSample
          showModal={showEdit}
          setShowModal={setShowEdit}
          data={activeRow}
          fetchData={fetchSamples}
        />
      }
    </>
  );
};

export default Sample;
