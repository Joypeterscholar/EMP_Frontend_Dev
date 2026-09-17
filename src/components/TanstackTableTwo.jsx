// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from 'react';
import {
    // eslint-disable-next-line no-unused-vars
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    getPaginationRowModel,
    useReactTable
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";
// eslint-disable-next-line no-unused-vars
import { Box, Button } from '@mui/material';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CustomScrollbar from './CustomScrollbar';


// eslint-disable-next-line react/prop-types
export default function TanstackTableTwo({ tableData, columns }) {
    const [sorting, setSorting] = useState([]);
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    })
    // eslint-disable-next-line no-unused-vars
    const [data, setData] = useState([]);
    const table = useReactTable({
        data,
        columns,
        state: {
            sorting,
            pagination,
        },
        onPaginationChange: setPagination,
        onSortingChange: (e) => setSorting(e),
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });
    const { rows } = table.getRowModel();

    useEffect(() => {
        setData(tableData);
    }, [tableData]);


    return (
        // eslint-disable-next-line react/prop-types
        <Box className='z-0 h-auto min-h-96 w-full min-w-96'>
            <Box className="flex h-auto min-h-96 w-full min-w-96 flex-col gap-2">
                {rows.length === 0 ? (
                    <div className="flex flex-col justify-center items-center w-full h-[600px]"><div>No data available</div></div>
                ) : (
                    <>
                        <TableVirtuoso
                            id="virtuoso-table"
                            style={{ height: "700px", boxShadow: "none", border: 0 }}
                            totalCount={rows.length}
                            components={{
                                Scroller: CustomScrollbar,
                                Table: ({ style, ...props }) => {
                                    return (
                                        <table
                                            className='table table-auto shadow-none'
                                            {...props}
                                            style={{
                                                ...style,
                                                width:'100%',
                                                tableLayout: "fixed",
                                            }}
                                        />
                                    );
                                },
                                TableRow: (props) => {
                                    const index = props["data-index"];
                                    const row = rows[index];

                                    return (
                                        <tr className='border-b hover:bg-gray-100' {...props}>
                                            {row.getVisibleCells().map((cell) => (
                                                <td key={cell.id} className='px-4 py-2'>
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                }
                            }}
                            fixedHeaderContent={() => {
                                return table.getHeaderGroups().map((headerGroup) => (
                                    <tr
                                        key={headerGroup.id}
                                        style={{ background: "lightgray", margin: 0 }}
                                    >
                                        {headerGroup.headers.map((header, index) => {
                                            return (
                                                <th
                                                    className='bg-gray-200 px-4 py-2'
                                                    key={index}
                                                    colSpan={header.colSpan}
                                                    style={{
                                                        width: header.getSize(),
                                                        borderBottom: "1px solid lightgray",
                                                    }}
                                                >
                                                    {header.isPlaceholder ? null : (
                                                        // eslint-disable-next-line jsx-a11y/click-events-have-key-events
                                                        <div
                                                            {...{
                                                                style: header.column.getCanSort()
                                                                    ? { cursor: "pointer", userSelect: "none" }
                                                                    : {},
                                                                onClick: header.column.getToggleSortingHandler()
                                                            }}
                                                        >
                                                            {flexRender(
                                                                header.column.columnDef.header,
                                                                header.getContext()
                                                            )}
                                                            {{
                                                                asc: <ExpandMoreIcon />,
                                                                desc: <ExpandLessIcon />,
                                                            }[header.column.getIsSorted()] ?? null}
                                                        </div>
                                                    )}
                                                </th>
                                            );
                                        })}
                                    </tr>
                                ));
                            }}
                        />
                        <div className="flex w-full items-center justify-center gap-2">
                            <button
                                className="rounded border p-1"
                                onClick={() => table.setPageIndex(0)}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {'<<'}
                            </button>
                            <button
                                className="rounded border p-1"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                {'<'}
                            </button>
                            <button
                                className="rounded border p-1"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                {'>'}
                            </button>
                            <button
                                className="rounded border p-1"
                                onClick={() => table.setPageIndex(table.getPageCount() - 1)}
                                disabled={!table.getCanNextPage()}
                            >
                                {'>>'}
                            </button>
                            <span className="flex items-center gap-1">
                                <div>Page</div>
                                <strong>
                                    {table.getState().pagination.pageIndex + 1} of{' '}
                                    {table.getPageCount()}
                                </strong>
                            </span>
                            <span className="flex items-center gap-1">
                                | Go to page:
                                <input
                                    type="number"
                                    defaultValue={table.getState().pagination.pageIndex + 1}
                                    onChange={e => {
                                        const page = e.target.value ? Number(e.target.value) - 1 : 0
                                        table.setPageIndex(page)
                                    }}
                                    className="w-16 rounded border p-1"
                                />
                            </span>
                            <select
                                value={table.getState().pagination.pageSize}
                                onChange={e => {
                                    table.setPageSize(Number(e.target.value))
                                }}
                            >
                                {[10, 20, 30, 40, 50].map(pageSize => (
                                    <option key={pageSize} value={pageSize}>
                                        Show {pageSize}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </>
                )}
            </Box>
        </Box>
    );
}