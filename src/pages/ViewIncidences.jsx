/* eslint-disable no-unused-vars */
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import ReactPaginate from 'react-paginate';
import { formatDate, formatTime, getRealFileUrl } from '../utils';


const ViewIncidences = () => {
  const { model } = useLoaderData();
  const { tags } = model;
  const [tagsData, setTagsData] = useState([]);
  const [itemOffset, setItemOffset] = useState(0);
  const itemsPerPage = 6;
  const endOffset = itemOffset + itemsPerPage;
  const currentItems = useMemo(
    () => tags.slice(itemOffset, endOffset),
    [endOffset, itemOffset, tags]
  );
  const pageCount = Math.max(1, Math.ceil(tags.length / itemsPerPage));

  const handlePageClick = (event) => {
    setItemOffset(event.selected * itemsPerPage);
  };

  useEffect(() => {
    setTagsData(currentItems);
  }, [currentItems]);

  // Clamp itemOffset when list shrinks
  useEffect(() => {
    const total = tags.length;
    const maxPageIndex = Math.max(0, Math.ceil(total / itemsPerPage) - 1);
    const desiredOffset = Math.min(itemOffset, maxPageIndex * itemsPerPage);
    if (itemOffset !== desiredOffset) setItemOffset(desiredOffset);
  }, [tags, itemsPerPage, itemOffset]);

  const handleFilterTags = useCallback(
    (search) => {
      const regex = new RegExp(`.*${search.toLowerCase()}.*`, 'i');

      const searchResult = tags.filter((item) => {
        return (
          regex.test(item.objectName?.toLowerCase()) ||
          regex.test(item.incident?.name?.toLowerCase()) ||
          regex.test(item.presence?.toLowerCase()) ||
          regex.test(item.sample?.name?.toLowerCase()) ||
          regex.test(item.locations?.toLowerCase()) ||
          regex.test(item.text?.toLowerCase()) ||
          regex.test(item?.type?.toLowerCase()) ||
          regex.test(item?.slug?.toLowerCase()) ||
          regex.test(item.taggedInfo?.toLowerCase())
        );
      });

      setTagsData(searchResult);
    },
    [tags, setTagsData]
  );

  return (
    <div className='flex flex-col gap-5 py-5 w-full h-auto AllModels bg-base-100'>
      <div className='searchBarContainer mx-3 w-[94%]'>
        <div className='searchIconWrapper'>
          <div className='ml-2 img searchImg'>
            <img src='/img/search (2).png' alt='icon' />
          </div>
        </div>
        <input
          className='max-sm:text-sm'
          type='text'
          name='search'
          placeholder='Search Tags'
          onChange={(e) => handleFilterTags(e.target.value)}
        />
        <div className='filter'>
          <div className='img'>
            <img className='max-sm:w-10' src='/img/edit.png' alt='' />
          </div>
          <p className='max-sm:text-sm'>Search</p>
        </div>
      </div>
      <main>
        <div className='flex flex-row flex-wrap gap-5 justify-center items-center w-full'>
          {tagsData.filter((items) => items?.type === "incident")?.map((tag, i) => {
            const { createdAt, user } = tag;
            return (
              <div
                className={`card min-h-[250px] card-side shadow-0 border border-solid border-gray-300 flex-row-reverse w-[45%] min-w-[450px] max-md:w-full ${tag?.type === "sampling" ? "border-red-900" : tag?.type === "incident" ? "border-blue-900" : "border-gray-300"}`}
                key={i}>
                {tag?.evidence ? <div className='flex w-[40%] items-center justify-center rounded-r-lg'>
                  <img
                    src={getRealFileUrl(tag.evidence)}
                    alt='No Evidence'
                    className='h-full w-[40%] min-w-[215px] rounded-r-lg object-cover'
                  />
                </div> : <div className='flex w-[40%] items-center justify-center rounded-r-lg bg-black text-white'> <div className='text-center'>No Evidence attached</div></div>}
                <div className='card-body w-[60%] p-3'>
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Created By: </span>{user?.username}</p>
                  </div>
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Type: </span>{tag?.type}</p>
                  </div>
                  {tag?.type === "sampling" && tag?.sample?.name && <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">{tag?.sample?.name}<span>:</span> </span>{tag.presence}
                    </p>
                  </div>}
                  {["sampling", "incident"].includes(tag?.type) && <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Corrective Action: </span>{tag?.action ?? 'None'}
                    </p>
                  </div>}
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Location: </span>{tag?.locations}
                    </p>
                  </div>
                  {tag?.type === "incident" && tag?.incident?.name && <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Incident: </span>{tag?.incident?.name}
                    </p>
                  </div>}
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Ref: </span> {tag?.slug}
                    </p>
                  </div>
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Note: </span> {tag?.text}
                    </p>
                  </div>
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold"> Date:</span> {formatDate(createdAt)}
                    </p>
                  </div>
                  <div className='flex flex-row justify-start items-start'>
                    <p className="capitalize"><span className="font-bold">Time: </span>{formatTime(createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div className='navigatonBtnContainer'>
          <ReactPaginate
            previousLabel='Prev'
            nextLabel='Next'
            pageClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl'
            pageLinkClassName='page-link'
            previousClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold'
            previousLinkClassName='page-link'
            nextClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold'
            nextLinkClassName='page-link'
            breakLabel='...'
            breakClassName='flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold'
            breakLinkClassName='page-link'
            pageCount={pageCount}
            marginPagesDisplayed={2}
            pageRangeDisplayed={5}
            onPageChange={handlePageClick}
            containerClassName='flex flex-row items-center justify-center gap-2 py-10 text-center text-xl'
            activeClassName='m-1 rounded-full bg-primary text-white font-semibold'
            forcePage={Math.floor(itemOffset / itemsPerPage)}
          />
        </div>
      </main >
    </div >
  );
};

export default ViewIncidences;
