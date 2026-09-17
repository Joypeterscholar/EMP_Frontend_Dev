// eslint-disable-next-line no-unused-vars
import React, { useCallback, useEffect, useState } from "react";
import AddLocation from "./AddLocation";
import EditLocation from "./EditLocation";
import { customFetch, getRealFileUrl } from "../utils";
import { toast } from "react-toastify";
import { useLoaderData } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import TanstackTable from "../components/TanstackTable";
// import LocationOverview from "./new/LocationOverview";
import WebIcon from "../components/custom/WebIcons";
import { MoreVertical } from "lucide-react";
import { Button } from "@mui/material";
import { Button as ShButton } from "../components/ui/button";
import SearchInput from "../components/ui/search-input";

const url = "/location/locations";

const modelQuery = {
	queryKey: ["locations"],
	queryFn: () => customFetch(url),
};

export const LocationLoader = (queryClient) => async () => {
	const response = await queryClient.ensureQueryData(modelQuery);
	let locations = [];
	if (response.data.status !== "error") {
		locations = response.data.data;
	} else {
		toast.error(response.data.message);
	}
	return { locations };
};

const Location = () => {
	const { locations } = useLoaderData();
	const [data, setData] = useState(locations);
	const queryClient = useQueryClient();
	const [showModal, setShowModal] = useState(false);
	const [showEdit, setShowEdit] = useState(false);
	const [activeRow, setActiveRow] = useState({});
	const [searchText, setSearchText] = useState("");

	useEffect(() => {
		setData(locations);
	}, [locations]);

	const handleFilterLocations = useCallback(
		(search) => {
			setSearchText(search);
			if (!search.length) {
				setData(locations || []);
				return;
			}
			const regex = new RegExp(`.*${search.toLowerCase()}.*`, "i");

			const searchResult = (locations || []).filter((item) => {
				return (
					regex.test(item.locations?.toLowerCase()) ||
					regex.test(item.name?.toLowerCase())
				);
			});

			setData(searchResult);
		},
		[locations]
	);

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this location?")) {
			const response = await customFetch.delete(
				`/location/location-delete/${id}`
			);
			if (response.data.status !== "error") {
				await queryClient.invalidateQueries("locations");
				const response = await customFetch(url);
				if (response.data.status !== "error") {
					setData(response.data.data);
					toast.success("Location deleted successfully");
				}
			} else {
				toast.error(response.data.message);
			}
		}
	};

	const fetchData = async () => {
		const response = await customFetch(url);
		if (response.data.status !== "error") {
			setData(response.data.data);
		} else {
			toast.error(response.data.message);
		}
	};

	const handleEdit = (id) => {
		const result = locations.filter((row) => row._id === id)[0];
		setActiveRow(result);
		setShowEdit(true);
	};

	const locationData = {
		totalLocations: locations?.length || 0,
		activeLocations: locations?.length || 0,
		totalFacilities: locations?.length || 0,
	};

	const columns = [
		{ accessorKey: "name", header: "Factory Name" },
		{
			accessorKey: "image",
			header: "Image",
			cell: (info) => {
				const imageUrl = info.getValue();
				if (!imageUrl) return "";
				return (
					<img
						className="w-20 h-20 rounded-full object-cover"
						src={getRealFileUrl(imageUrl)}
						alt="Facility"
					/>
				);
			},
		},
		{
			accessorFn: (row) => "",
			header: "Options",
			cell: (info) => {
				return (
					<OptionsDropdown
						info={info}
						handleEdit={handleEdit}
						handleDelete={handleDelete}
					/>
				);
			},
		},
	];

	return (
		<>
			<div className="flex flex-col flex-grow w-auto">
				{/* Location Overview Section */}
				{/* <LocationOverview locationData={locationData} /> */}

				{/* Location Filters and Table Section */}
				<div className="flex flex-col flex-grow p-5">
					{/* Location Title and Action Row */}
					<div className="flex items-center justify-between mb-6">
						{/* Location Title */}
						<h2 className="text-2xl font-bold text-primary">Locations</h2>

						{/* Add Facility Button */}
						<ShButton
							className="w-[206px] rounded-[20px] bg-primary text-white border border-primary shadow-none"
							onClick={() => setShowModal(true)}
						>
							<p className="max-sm:text-sm">Add Facility</p>
						</ShButton>
					</div>

					{/* Search Bar Row */}
					<div className="flex items-center justify-end mb-6">
						{/* Search Bar */}
						<SearchInput
							value={searchText}
							onChange={(val) => {
								setSearchText(val);
								handleFilterLocations(val);
							}}
							placeholder="Search by Facility"
						/>
					</div>

					{/* Table Section */}
					<section className="flex justify-center items-center">
						{data && (
							<TanstackTable
								autoHeight
								columns={columns}
								tableData={data}
							/>
						)}
					</section>
				</div>
			</div>

			<AddLocation
				showModal={showModal}
				setShowModal={setShowModal}
				fetchData={fetchData}
			/>
			<EditLocation
				showModal={showEdit}
				setShowModal={setShowEdit}
				data={activeRow}
				fetchData={fetchData}
			/>
		</>
	);
};

// Options Dropdown Component
function OptionsDropdown({ info, handleEdit, handleDelete }) {
	const [isOpen, setIsOpen] = useState(false);

	const handleEditClick = () => {
		setIsOpen(false);
		handleEdit(info.cell.row.original._id);
	};

	const handleDeleteClick = () => {
		setIsOpen(false);
		handleDelete(info.cell.row.original._id);
	};

	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
				className="p-1 hover:bg-gray-100 rounded transition-colors"
			>
				<MoreVertical className="w-4 h-4 text-gray-600" />
			</button>

			{isOpen && (
				<div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
					<div className="py-1">
						<button
							onClick={handleEditClick}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
						>
							Edit Location
						</button>
						<button
							onClick={handleDeleteClick}
							className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
						>
							Delete Location
						</button>
					</div>
				</div>
			)}

			{/* Click outside to close dropdown */}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
}

export default Location;
