// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLoaderData, useNavigate } from "react-router-dom";
import TanstackTableTwo from "../components/TanstackTableTwo";
import AddModelSample from "./AddModelSample";

const GranularTaggingList = () => {
  const { model } = useLoaderData();
  const [tagsData, setTagsData] = useState([]);
  const [activeRow, setActiveRow] = useState({});
  const [showModal, setShowModal] = React.useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    setTagsData(model?.gTags);
  }, [model.gTags]);

  const handleFilterGranularTags = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');

      const searchResult = model.gTags.filter((item) => {
        return regex.test(item.name?.toLowerCase());
      });

      setTagsData(searchResult);
    },
    [model, setTagsData]
  );

  function handleAddSample(row, showModal) {
    setActiveRow(row);
    setShowModal(!showModal);
  }
  function handleViewModel(id) {
    return navigate(`/view-model/${id}`);
  }
  const columnTags = useMemo(
    () => [
      {
        accessorFn: (row) => row.image,
        header: "Image",
        cell: (info) => (
          <img className="aspect-square w-40 rounded-md p-[2px] hover:scale-110" alt="image" src={info.getValue()} />
        ),
      },
      {
        accessorKey: "objectName",
        header: "Object Name",
      },
      {
        accessorFn: (row) => row,
        header: 'Add Sample',
        cell: (info) => (
          <button
            onClick={() => handleAddSample(info.getValue(), showModal)}
            className='btn btn-outline btn-neutral btn-sm rounded-md border-0 bg-green-700 text-white'>
            Add Sample
          </button>
        ),
      },
      {
        accessorFn: (row) => row.modelId,
        header: 'View Facility Section',
        cell: (info) => (
          <button
            onClick={() => handleViewModel(info.getValue())}
            className='btn btn-outline btn-neutral btn-sm rounded-md border-0 bg-black text-white'>
            View Facility Section
          </button>
        ),
      },
    ],
    []
  );

  return (
    <>
      <div className='w-full flex-col items-center justify-center gap-3'>
        <div className="h-full p-5">
          <div className='AllModels'>
            <div className='searchBarContainer md:mx-10'>
              <div className='searchIconWrapper'>
                <div className='img searchImg ml-2'>
                  <img src='/img/search (2).png' alt='icon' />
                </div>
              </div>
              <input type='text' name='search' placeholder='Search Facility Section' onClick={(e) => handleFilterGranularTags(e.target.value)} />
              <div className='filter'>
                <div className='img'>
                  <img src='/img/edit.png' alt='icon' />
                </div>
                <p>Filter</p>
              </div>
            </div>
          </div>
          <section className="mt-5 flex items-center justify-center">
            <TanstackTableTwo
              columns={columnTags}
              tableData={tagsData} />
          </section>
        </div>
      </div>
      <AddModelSample showModal={showModal} setShowModal={setShowModal} model_data={activeRow} />
    </>
  );
};

export default GranularTaggingList;
