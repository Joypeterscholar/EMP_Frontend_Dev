import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customFetch, formatDate, formatTime } from "../../utils";
import { toast } from "react-toastify";
import DashboardOverview from "./DashboardOverview";
import { FullDashboard } from "../../components";
import TanstackTable from "../../components/TanstackTable";
import WebIcon from "../../components/custom/WebIcons";
import SearchInput from "../../components/ui/search-input";

const url = "/user/dashboard";

function OptionsDropdown({ row, navigate }) {
	const [isOpen, setIsOpen] = useState(false);

	const handleViewModel = (e) => {
		e.preventDefault();
		e.stopPropagation(); // Prevent event from bubbling to table row
		setIsOpen(false);

		// Debug: Check row structure
		if (!row) {
			toast.error("Row data is missing");
			return;
		}

		const _id = row._id;
		if (!_id) {
			toast.error(
				`Unable to open model: ID not found. Row keys: ${Object.keys(
					row
				).join(", ")}`
			);
			return;
		}

		if (typeof _id !== "string") {
			toast.error(`Invalid ID type: ${typeof _id}`);
			return;
		}

		navigate(`/view-model/${_id}`);
	};

	return (
		<div className="relative" onClick={(e) => e.stopPropagation()}>
			<button
				onClick={(e) => {
					e.stopPropagation();
					setIsOpen(!isOpen);
				}}
				className="p-1 hover:bg-gray-100 rounded transition-colors"
			>
				<svg width="20" height="20" viewBox="0 0 24 24" fill="none">
					<circle cx="12" cy="6" r="2" fill="currentColor" />
					<circle cx="12" cy="12" r="2" fill="currentColor" />
					<circle cx="12" cy="18" r="2" fill="currentColor" />
				</svg>
			</button>
			{isOpen && (
				<div className="absolute right-0 top-8 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[160px]">
					<div className="py-1">
						<button
							onClick={handleViewModel}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
						>
							View Model
						</button>
					</div>
				</div>
			)}
			{isOpen && (
				<div
					className="fixed inset-0 z-40"
					onClick={() => setIsOpen(false)}
				/>
			)}
		</div>
	);
}

const DashboardNew = () => {
	const navigate = useNavigate();
	const [dashboardData, setDashboardData] = useState({});
	const [search, setSearch] = useState("");
	const [showDownloadModal] = useState(false);
	const [downloadSuccess] = useState(true);
	const [loading, setLoading] = useState(true);

	const fetchData = async () => {
		setLoading(true);
		try {
			const response = await customFetch(url);
			if (response.data.status !== "error") {
				setDashboardData(response.data || {});
			} else {
				toast.error(response.data.message);
				setDashboardData({});
			}
		} catch (error) {
			toast.error("Failed to load dashboard data");
			setDashboardData({});
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchData();
	}, []);

	// Removed unused dropdown/date filter listeners

	// Use recentModels for activity log (recently uploaded), not recentlyViewedModels (recently viewed)
	const safeRecentModels = Array.isArray(dashboardData?.recentModels)
		? dashboardData.recentModels
		: Array.isArray(dashboardData?.recentlyViewedModels)
		? dashboardData.recentlyViewedModels
		: [];

	const columns = useMemo(
		() => [
			{
				accessorKey: "slug",
				header: () => <span>Facility ID</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.slug || "N/A"}
					</span>
				),
			},
			{
				accessorKey: "modelName",
				header: () => <span>Facility Name</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.modelName || "N/A"}
					</span>
				),
			},
			{
				id: "uploadedBy",
				accessorFn: (row) => row?.user?.username || "N/A",
				header: () => <span>Uploaded By</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.user?.username || "N/A"}
					</span>
				),
			},
			{
				id: "timeStr",
				accessorFn: (row) =>
					row?.createdAt ? formatTime(row.createdAt) : "N/A",
				header: () => <span>Time</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.createdAt
							? formatTime(row.original.createdAt)
							: "N/A"}
					</span>
				),
			},
			{
				id: "dateStr",
				accessorFn: (row) =>
					row?.createdAt ? formatDate(row.createdAt) : "N/A",
				header: () => <span>Date</span>,
				cell: ({ row }) => (
					<span className="text-gray-800">
						{row.original.createdAt
							? formatDate(row.original.createdAt)
							: "N/A"}
					</span>
				),
			},
			{
				accessorKey: "action",
				header: () => <span>Action</span>,
				cell: ({ row }) => (
					<OptionsDropdown row={row.original} navigate={navigate} />
				),
			},
		],
		[navigate]
	);

	const filteredModels = useMemo(() => {
		const q = search.trim().toLowerCase();
		if (!q) return safeRecentModels;
		return safeRecentModels.filter((model) => {
			const values = [
				model?.slug,
				model?.modelName,
				model?.location?.name,
				model?.location?.location,
				model?.user?.username,
				formatDate(model?.createdAt),
				formatTime(model?.createdAt),
			]
				.filter(Boolean)
				.join(" ")
				.toLowerCase();
			return values.includes(q);
		});
	}, [search, safeRecentModels]);

	const handleFilterActivities = (searchValue) => {
		// Update search state so input displays typed characters
		setSearch(searchValue);
	};

	return (
		<div className="flex flex-col flex-grow w-auto">
			<DashboardOverview dashboardData={dashboardData} />
			<FullDashboard dashboardData={dashboardData} />
			<div className="bg-white rounded-xl md:rounded-2xl shadow-xl md:shadow-2xl p-4 sm:p-5 md:p-6 mx-2 sm:mx-4 lg:mx-5">
				<div className="flex items-center justify-between mb-3 md:mb-4 gap-2 sm:gap-3">
					<h2 className="text-base sm:text-lg md:text-xl font-bold text-gray-900">
						Recently Uploaded Facility Sections
					</h2>
				</div>

				{/* Search and Actions */}
				<div className="flex flex-col sm:flex-row items-center my-8 justify-end gap-3">
					<div className="relative flex-1 w-full max-w-full sm:max-w-xl">
						{/* Search Bar */}
						<SearchInput
							value={search}
							onChange={(v) => handleFilterActivities(v)}
							placeholder="Search by name, status, class...."
						/>
					</div>
				</div>

				{/* Table */}
				<div className="mt-4 overflow-x-auto border border-gray-200 rounded-xl">
					{loading ? (
						<div className="w-full py-10 text-center text-gray-500">
							Loading...
						</div>
					) : (
						<TanstackTable
							columns={columns}
							tableData={filteredModels}
							initialPageSize={10}
							pageSizeOptions={[5, 10, 20, 30]}
						/>
					)}
				</div>
			</div>
		</div>
	);
};

export default DashboardNew;
