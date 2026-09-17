// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
import { useTable } from 'react-table';
import { Box, Typography } from '@mui/material';


// eslint-disable-next-line react/prop-types
const Table = ({ columns, data }) => {
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
    canPreviousPage,
    canNextPage,
    // eslint-disable-next-line no-unused-vars
    pageOptions,
    state: { pageIndex },
    gotoPage,
    // eslint-disable-next-line no-unused-vars
    pageCount,
  } = useTable({
    columns,
    data,
    initialState: { pageIndex: 0, pageSize },
  });

  useEffect(() => {
    setCurrentPage(pageIndex + 1);
  }, [pageIndex]);

  const handleNext = () => {
    gotoPage(currentPage);
  };

  const handlePrevious = () => {
    gotoPage(currentPage - 2);
  };

  return (
    <div className='flex w-full flex-col gap-10'>
      {rows.length === 0 ? (
        <Box className='flex h-auto min-h-96 w-full items-center justify-center text-center'> <Typography className='flex text-3xl'>No data available </Typography> </Box>
      ) : (
        <>
          <table {...getTableProps()} className='table-container table-auto'>
            <thead>
              {headerGroups.map((headerGroup, index) => (
                <tr key={index}
                  {...headerGroup.getHeaderGroupProps()}
                  className='text-left'>
                  {headerGroup.headers.map((column, index) => (
                    <th key={index}
                      {...column.getHeaderProps()}
                      className='bg-gray-200 px-4 py-2'>
                      {column.render('Header')}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody {...getTableBodyProps()}>
              {rows.map((row, i) => {
                prepareRow(row);
                return (
                  <tr key={i}
                    {...row.getRowProps()}
                    className='border-b hover:bg-gray-100'>
                    {row.cells.map((cell, index) => (
                      <td key={index} {...cell.getCellProps()} className='px-4 py-2'>
                        {cell.render('Cell')}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className='pagination flex items-center justify-center gap-2 py-3'>
            <button
              className='cursor-pointer px-2 py-1 font-bold text-black hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={!canPreviousPage}
              onClick={handlePrevious}>
              Prev
            </button>
            <div className='navigatonBtnContainer'>
              <div className='active'>{currentPage}</div>
            </div>
            <button
              className='cursor-pointer px-2 py-1 font-bold text-black hover:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50'
              disabled={!canNextPage}
              onClick={handleNext}>
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default Table;
