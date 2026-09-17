/* eslint-disable react/prop-types */
// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
	// eslint-disable-next-line no-unused-vars
	flexRender,
	getCoreRowModel,
	getSortedRowModel,
	getPaginationRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { TableVirtuoso } from "react-virtuoso";
import { Box } from "@mui/material";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import CustomScrollbar from "./CustomScrollbar";
import { Checkbox } from "./ui/checkbox";

// eslint-disable-next-line react/prop-types
export default function TanstackTable({
	tableData,
	columns = [],
	autoHeight = false,
	initialPageSize = 10,
	pageSizeOptions = [10, 20, 30, 40, 50],
	enablePagination = true,
}) {
	const [sorting, setSorting] = useState([]);
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: initialPageSize,
	});
	const [rowSelection, setRowSelection] = useState({});
	const tableRef = useRef();

	// eslint-disable-next-line no-unused-vars
	const [data, setData] = useState([]);

	const table = useReactTable({
		data,
		columns: Array.isArray(columns) ? columns : [],
		state: {
			sorting,
			pagination,
			rowSelection,
		},
		enableRowSelection: true,
		onRowSelectionChange: setRowSelection,
		onPaginationChange: setPagination,
		onSortingChange: (e) => setSorting(e),
		getCoreRowModel: getCoreRowModel(),
		getSortedRowModel: getSortedRowModel(),
		// Only use pagination model if pagination is enabled
		...(enablePagination ? { getPaginationRowModel: getPaginationRowModel() } : {}),
		manualPagination: !enablePagination, // If not enabling internal pagination, we might be doing it manually or not at all
	});
	const { rows } = table.getRowModel();

	useEffect(() => {
		setData(Array.isArray(tableData) ? tableData : []);
	}, [tableData]);

	// Ensure page index is valid when data changes
	useEffect(() => {
		const pageCount = table.getPageCount();
		const currentPage = table.getState().pagination.pageIndex;
		if (pageCount > 0 && currentPage >= pageCount) {
			table.setPageIndex(Math.max(0, pageCount - 1));
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [data.length]);

	return (
		// eslint-disable-next-line react/prop-types
		<Box className="z-0 h-auto min-h-96 w-full">
			<Box className="flex h-auto min-h-96 w-full flex-col gap-2">
				{rows.length === 0 ? (
					<div className="flex flex-col justify-center items-center w-full h-[400px]">
						<div>No data available</div>
					</div>
				) : (
					<>
						{autoHeight ? (
							// Non-virtualized, grows with content so the page scroll controls it
							<table
								ref={tableRef}
								className="table table-auto shadow-none w-full"
							>
								<thead>
									{table.getHeaderGroups().map((headerGroup) => (
										<tr key={headerGroup.id} className="bg-primary">
											<th className="px-4 py-2 text-white font-semibold w-12">
												<Checkbox
													checked={table.getIsAllRowsSelected()}
													indeterminate={table.getIsSomeRowsSelected()}
													onCheckedChange={(value) =>
														table.toggleAllRowsSelected(!!value)
													}
													className="border-white data-[state=checked]:bg-white data-[state=checked]:text-primary"
												/>
											</th>
											{headerGroup.headers.map((header, index) => (
												<th
													className="px-4 py-2 text-white font-semibold"
													key={index}
													colSpan={header.colSpan}
												>
													{header.isPlaceholder ? null : (
														<div
															style={
																header.column.getCanSort()
																	? {
																		cursor: "pointer",
																		userSelect: "none",
																	}
																	: {}
															}
															onClick={header.column.getToggleSortingHandler()}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
															{{
																asc: <ExpandMoreIcon />,
																desc: <ExpandLessIcon />,
															}[header.column.getIsSorted()] ??
																null}
														</div>
													)}
												</th>
											))}
										</tr>
									))}
								</thead>
								<tbody>
									{rows.map((row) => (
										<tr
											key={row.id}
											className="border-b hover:bg-gray-100"
										>
											<td className="px-4 py-2 w-12">
												<Checkbox
													checked={row.getIsSelected()}
													onCheckedChange={(value) =>
														row.toggleSelected(!!value)
													}
												/>
											</td>
											{row.getVisibleCells().map((cell) => (
												<td key={cell.id} className="px-4 py-2">
													{flexRender(
														cell.column.columnDef.cell,
														cell.getContext()
													)}
												</td>
											))}
										</tr>
									))}
								</tbody>
							</table>
						) : (
							<TableVirtuoso
								id="virtuoso-table"
								style={{
									height: "520px",
									boxShadow: "none",
									border: 0,
									width: "100%",
								}}
								totalCount={rows.length}
								initialTopMostItemIndex={0}
								components={{
									Scroller: CustomScrollbar,
									Table: ({ style, ...props }) => (
										<table
											ref={tableRef}
											className="table table-auto shadow-none w-full"
											{...props}
											style={{
												...style,
												width: "100%",
												tableLayout: "auto",
											}}
										/>
									),
									TableRow: (props) => {
										const index = props["data-index"];
										const row = rows[index];
										if (!row) return <tr {...props} />;
										return (
											<tr
												className="border-b hover:bg-gray-100"
												{...props}
											>
												<td className="px-4 py-2 w-12">
													<Checkbox
														checked={row.getIsSelected()}
														onCheckedChange={(value) =>
															row.toggleSelected(!!value)
														}
													/>
												</td>
												{row.getVisibleCells().map((cell) => (
													<td key={cell.id} className="px-4 py-2">
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</td>
												))}
											</tr>
										);
									},
								}}
								fixedHeaderContent={() => {
									let headerGroups = [];
									try {
										headerGroups = table.getHeaderGroups();
									} catch (err) {
										headerGroups = [];
									}
									if (!Array.isArray(headerGroups)) headerGroups = [];
									return headerGroups.map((headerGroup) => (
										<tr key={headerGroup.id} className="bg-primary">
											<th className="px-4 py-2 text-white font-semibold w-12">
												<Checkbox
													checked={table.getIsAllRowsSelected()}
													indeterminate={table.getIsSomeRowsSelected()}
													onCheckedChange={(value) =>
														table.toggleAllRowsSelected(!!value)
													}
													className="border-white data-[state=checked]:bg-white data-[state=checked]:text-primary"
												/>
											</th>
											{headerGroup.headers.map((header, index) => (
												<th
													className="px-4 py-2 text-white font-semibold"
													key={index}
													colSpan={header.colSpan}
												>
													{header.isPlaceholder ? null : (
														<div
															style={
																header.column.getCanSort()
																	? {
																		cursor: "pointer",
																		userSelect: "none",
																	}
																	: {}
															}
															onClick={header.column.getToggleSortingHandler()}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
															{{
																asc: <ExpandMoreIcon />,
																desc: <ExpandLessIcon />,
															}[header.column.getIsSorted()] ??
																null}
														</div>
													)}
												</th>
											))}
										</tr>
									));
								}}
							/>
						)}
					</>
				)}
				{/* Only render pagination controls if enabled */}
				{enablePagination && (() => {
					const displayPageCount = Math.max(1, table.getPageCount());
					const currentPageIndex = Math.max(0, Math.min(
						table.getState().pagination.pageIndex,
						displayPageCount - 1
					));

					return (
						<div className="flex flex-wrap w-full items-center justify-center gap-2 pt-[5px] text-xs sm:text-sm">
							<button
								className="rounded border px-2 py-1"
								onClick={() => table.setPageIndex(0)}
								disabled={!table.getCanPreviousPage()}
							>
								{"<<"}
							</button>
							<button
								className="rounded border px-2 py-1"
								onClick={() => table.previousPage()}
								disabled={!table.getCanPreviousPage()}
							>
								{"<"}
							</button>
							<button
								className="rounded border px-2 py-1"
								onClick={() => table.nextPage()}
								disabled={!table.getCanNextPage()}
							>
								{">"}
							</button>
							<button
								className="rounded border px-2 py-1"
								onClick={() =>
									table.setPageIndex(table.getPageCount() - 1)
								}
								disabled={!table.getCanNextPage()}
							>
								{"»"}
							</button>
							<span className="flex items-center gap-1 whitespace-nowrap">
								<div>Page</div>
								<strong>
									{currentPageIndex + 1} of {displayPageCount}
								</strong>
							</span>
							<span className="hidden sm:flex items-center gap-1">
								| Go to page:
								<input
									type="number"
									value={currentPageIndex + 1}
									min={1}
									max={displayPageCount}
									onChange={(e) => {
										const page = e.target.value
											? Math.max(1, Math.min(Number(e.target.value), displayPageCount)) - 1
											: 0;
										table.setPageIndex(page);
									}}
									onBlur={(e) => {
										if (!e.target.value || Number(e.target.value) < 1) {
											table.setPageIndex(0);
										}
									}}
									className="w-16 rounded border p-1"
								/>
							</span>
							<select
								value={table.getState().pagination.pageSize}
								onChange={(e) => {
									table.setPageSize(Number(e.target.value));
								}}
								className="border rounded px-2 py-1"
							>
								{pageSizeOptions.map((pageSize) => (
									<option key={pageSize} value={pageSize}>
										Show {pageSize}
									</option>
								))}
							</select>
						</div>
					);
				})()}
			</Box>
		</Box>
	);
}
