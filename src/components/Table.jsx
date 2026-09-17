// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { useTable, useExportData } from 'react-table';
// eslint-disable-next-line no-unused-vars
import { CSVLink } from 'react-csv';

// eslint-disable-next-line react/prop-types
const Table = ({ columns, data, exportBtn }) => {
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

  const handleExport = () => {
    const csvData = data?.map((row) => {
      return columns?.map((col) => row[col.accessor]);
    });
    const headerRow = columns?.map((col) => col.Header);
    csvData.unshift(headerRow);

    return csvData;
  };

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
    <div className='flex w-full flex-col gap-2 overflow-x-auto bg-slate-100'>
      {rows.length === 0 ? (
        <p>No data available</p>
      ) : (
        <>
          <div>
            {exportBtn && (
              <div className='pt-3'>
                <CSVLink
                  data={handleExport()}
                  filename={'exported_data.csv'}
                  className='btn btn-neutral btn-sm'
                  target='_blank'>
                  Export Data
                </CSVLink>
              </div>
            )}
          </div>
          <table {...getTableProps()} className='table-container table-auto'>
            <thead>
              {headerGroups.map((headerGroup, index) => (
                <tr key={index}
                  {...headerGroup.getHeaderGroupProps()}
                  className='text-left'>
                  {headerGroup.headers.map((column, i) => (
                    <th key={i}
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
              className='cursor-pointer bg-gray-300 px-2 py-1 font-bold text-black hover:bg-gray-100 disabled:opacity-50'
              disabled={!canPreviousPage}
              onClick={handlePrevious}>
              Previous
            </button>

            <button
              className='cursor-pointer bg-gray-300 px-2 py-1 font-bold text-black hover:bg-gray-100 disabled:opacity-50'
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
