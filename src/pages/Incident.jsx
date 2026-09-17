// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import '../styles/AllUsers.css';
import AddIncident from './AddIncident';
import EditIncident from './EditIncident';
import { customFetch } from '../utils';
import { toast } from 'react-toastify';
import { Button } from '@mui/material';
import TanstackTableTwo from '../components/TanstackTableTwo';

const Incident = () => {
  const [showModal, setShowModal] = useState(false);
  const [incidents, setIncidents] = useState();
  const [data, setData] = useState();
  const [showEdit, setShowEdit] = useState(false);
  const [activeRow, setActiveRow] = useState({});

  const fetchIncidents = async () => {
    const response = await customFetch('/incident/incidents');
    if (response.data.status !== 'error') {
      setIncidents(response.data.data);
      setData(response.data.data);
    } else {
      toast.error(response.data.message);
    }
  };
  useEffect(() => {
    fetchIncidents();
  }, []);

  const handleFilterIncidents = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');
      const searchResult = incidents.filter(
        (item) =>
          regex.test(item.name?.toLowerCase()) ||
          regex.test(item.description?.toLowerCase())
      );
      setData(searchResult);
    },
    [incidents]
  );

  const handleEdit = (id) => {
    const result = incidents.filter((row) => row._id === id)[0];
    setActiveRow(result);
    setShowEdit(true);
  };

  const handleDelete = async (id) => {
    try {
      await customFetch.delete(`/incident/incident-delete/${id}`);
      toast.success('incident deleted successfully');
      fetchIncidents();
    } catch (error) {
      toast.error(error.response.data.message);
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'description', header: 'Description' },
    // {
    //   accessorKey: 'image',
    //   header: 'Image',
    //   cell: (info) => (
    //     <img className='h-20 w-20 rounded-full' src={info.getValue()} />
    //   ),
    // },
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
            + Add Incident Type
          </Button>
        </div>
        <div className='searchBarContainer mx-auto w-full'>
          <div className='searchIconWrapper px-3'>
            <IoSearchSharp className='img searchImg' color='#858585' />
          </div>
          <input
            className='flex flex-grow flex-row'
            type='text'
            placeholder='Search incident Type'
            onChange={(e) => handleFilterIncidents(e.target.value)}
          />
          <div className='filter'>
            <p>Search</p>
          </div>
        </div>
        <div className='flex w-full flex-col gap-2'>
          <TanstackTableTwo columns={columns} tableData={data || {}} />
        </div>
      </div>
      <AddIncident
        showModal={showModal}
        setShowModal={setShowModal}
        fetchData={fetchIncidents}
      />
      {
        <EditIncident
          showModal={showEdit}
          setShowModal={setShowEdit}
          data={activeRow}
          fetchData={fetchIncidents}
        />
      }
    </>
  );
};

export default Incident;
