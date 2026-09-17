import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { customFetch, formatDate } from "../utils";
import WebIcon from "../components/custom/WebIcons";
import { DeleteAlert, SuccessAlert } from "../components/ui/alert";
// import UserOverview from "./new/UserOverview.jsx";
import TanstackTable from "../components/TanstackTable";
import SearchInput from "../components/ui/search-input";
import { Button as ShButton } from "../components/ui/button";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import ReactPaginate from "react-paginate";
import { useQueryClient } from "@tanstack/react-query";

const url = "/user/getusers";

export const loader = (queryClient) => async () => {
	try {
		const response = await queryClient.ensureQueryData({
			queryKey: ["user"],
			queryFn: () => customFetch(url),
		});
		const users = Array.isArray(response?.data?.users)
			? response.data.users
			: [];
		return { users };
	} catch (e) {
		return { users: [] };
	}
};

const AllUsers = () => {
	const navigate = useNavigate();
	const authUser = useSelector(memoize((state) => state.userState.user));
	const queryClient = useQueryClient();

	const [users, setUsers] = useState([]);
	const [search, setSearch] = useState("");
	const [loading, setLoading] = useState(false);
	const [activeTab, setActiveTab] = useState("All Users");
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [userToDelete, setUserToDelete] = useState(null);
	const [deletedUserName, setDeletedUserName] = useState("");

	// pagination state
	const [itemOffset, setItemOffset] = useState(0);
	const itemsPerPage = 10;

	useEffect(() => {
		const load = async () => {
			setLoading(true);
			try {
				const res = await customFetch.get(url);
				const list = Array.isArray(res.data?.users) ? res.data.users : [];
				setUsers(list);
			} catch (e) {
				setUsers([]);
			} finally {
				setLoading(false);
			}
		};
		load();
	}, []);

	const filtered = useMemo(() => {
		const q = search.trim().toLowerCase();
		const base = users;
		const list = !q
			? base
			: base.filter((u) =>
					[
						u._id,
						u.username,
						u.fullname,
						u.email,
						u.role,
						u?.locations?.name || u.locations,
					]
						.filter(Boolean)
						.join(" ")
						.toLowerCase()
						.includes(q)
			  );
		switch (activeTab) {
			case "Taggers":
				return list.filter(
					(u) => (u.role || "").toLowerCase() === "tagger"
				);
			case "Reviewers":
				return list.filter(
					(u) => (u.role || "").toLowerCase() === "reviewer"
				);

			default:
				return list;
		}
	}, [users, search, activeTab]);

	const endOffset = itemOffset + itemsPerPage;
	const currentItems = useMemo(() => filtered, [filtered]);
	const pageCount = Math.ceil(filtered.length / itemsPerPage) || 1;

	const handlePageClick = (event) => {
		const newOffset = (event.selected * itemsPerPage) % filtered.length;
		setItemOffset(newOffset);
	};

	const handleDelete = async (_id) => {
		try {
			const user = userToDelete;
			const userName = user?.fullname || user?.username || "User";
			const res = await customFetch.delete(`/user/delete/${_id}`);
			if (res.data?.status !== "error") {
				setUsers((prev) => prev.filter((u) => u._id !== _id));
				queryClient.invalidateQueries(["user"]);
				setShowDeleteAlert(false);
				setDeletedUserName(userName);
				setShowSuccessAlert(true);
				setUserToDelete(null);
			} else {
				// keep UI consistent
			}
		} catch (error) {
			// toast in upstream utils generally; keep UI stable
		}
	};

	const handleDeleteClick = (user) => {
		setUserToDelete(user);
		setShowDeleteAlert(true);
	};

	const columns = useMemo(
		() => [
			{
				accessorKey: "username",
				header: "Username",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "fullname",
				header: "Fullname",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "email",
				header: "Email",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorKey: "role",
				header: "Role",
				cell: (info) => info.getValue() || "",
			},
			{
				accessorFn: (row) =>
					row?.createdAt ? formatDate(row.createdAt) : "",
				header: "Created",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: (row) =>
					row?.updatedAt ? formatDate(row.updatedAt) : "",
				header: "Updated",
				cell: (info) => info.getValue(),
			},
			{
				accessorFn: () => "",
				header: "Options",
				excludeFromReport: true,
				cell: ({ row }) => (
					<OptionsDropdown
						authRole={authUser?.role}
						row={row.original}
						onDeleteClick={handleDeleteClick}
						navigate={navigate}
					/>
				),
			},
		],
		[authUser?.role]
	);

	return (
		<div className="flex flex-col flex-grow w-auto">
			{/* <UserOverview
				dashboardData={{
					totalTagsThisMonth: users.length,
					totalModels: 0,
					totalReviewers: users.filter(
						(u) => (u.role || "").toLowerCase() === "reviewer"
					).length,
					totalTaggers: users.filter(
						(u) => (u.role || "").toLowerCase() === "tagger"
					).length,
					todaysModels: 0,
				}}
			/> */}

			{/* Users Title and Add User Button Row */}
			<div className="flex items-center justify-between mb-6 mt-6 px-5">
				<div>
					<h2 className="heading-large font-bold text-primary">Users</h2>
				</div>
				<ShButton
					className="h-[48px] rounded-[20px] bg-primary text-white border border-primary shadow-none"
					onClick={() => navigate("/admin/users/add-user")}
				>
					Add User
				</ShButton>
			</div>

			{/* Tabs row with background container */}
			<div className="mb-4 w-full px-5 flex items-center justify-between gap-3">
				<div className="flex items-center gap-2 bg-white rounded-full p-1 border border-gray-200">
					{["All Users", "Taggers", "Reviewers"].map((tab) => (
						<button
							key={tab}
							onClick={() => {
								setActiveTab(tab);
								setItemOffset(0);
							}}
							className={`h-[46px] rounded-[100px] px-5 text-sm font-medium border ${
								activeTab === tab
									? "bg-primary text-white border-primary"
									: "bg-white text-gray-600 border-gray-300"
							}`}
						>
							{tab}
						</button>
					))}
				</div>
			</div>

			{/* Search Row aligned to right like Report */}
			<div className="flex items-center justify-end mb-6 px-5">
				<SearchInput
					value={search}
					onChange={(val) => {
						setSearch(val);
						setItemOffset(0);
					}}
					placeholder="Search by Name, Status, Role...."
				/>
			</div>

			{/* Table Section */}
			<section className="flex justify-center items-center px-5 mt-10">
				<div className="w-full border border-gray-200 rounded-xl overflow-hidden">
					{loading ? (
						<div className="w-full py-10 text-center text-gray-500">
							Loading...
						</div>
					) : (
						<TanstackTable
							autoHeight
							columns={columns}
							tableData={currentItems}
							initialPageSize={10}
							pageSizeOptions={[5, 10, 20, 30]}
						/>
					)}
				</div>
			</section>

			{/* Pagination */}
			{/* <div className="navigatonBtnContainer">
				<ReactPaginate
					previousLabel="Prev"
					nextLabel="Next"
					pageClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl"
					pageLinkClassName="page-link"
					previousClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold"
					previousLinkClassName="page-link"
					nextClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold"
					nextLinkClassName="page-link"
					breakLabel="..."
					breakClassName="flex h-10 w-10 items-center justify-center rounded-full text-center text-xl font-bold"
					breakLinkClassName="page-link"
					pageCount={pageCount}
					marginPagesDisplayed={2}
					pageRangeDisplayed={5}
					onPageChange={handlePageClick}
					containerClassName="flex flex-row items-center justify-center gap-2 py-10 text-center text-xl"
					activeClassName="m-1 rounded-full bg-primary text-white font-semibold"
					forcePage={Math.floor(itemOffset / itemsPerPage)}
				/>
			</div> */}

			{/* Delete Alert Modal */}
			<DeleteAlert
				isOpen={showDeleteAlert}
				onClose={() => {
					setShowDeleteAlert(false);
					setUserToDelete(null);
				}}
				onConfirm={() => {
					if (userToDelete?._id) {
						handleDelete(userToDelete._id);
					}
				}}
				title="Delete User"
				message={`Are you sure you want to delete ${
					userToDelete?.fullname || userToDelete?.username || "this user"
				}? This action cannot be undone.`}
			/>

			{/* Success Alert Modal */}
			<SuccessAlert
				isOpen={showSuccessAlert}
				onClose={() => {
					setShowSuccessAlert(false);
					setDeletedUserName("");
				}}
				title="User Deleted"
				message={`${
					deletedUserName || "User"
				} has been successfully deleted.`}
			/>
		</div>
	);
};

function OptionsDropdown({ authRole, row, onDeleteClick, navigate }) {
	const [isOpen, setIsOpen] = useState(false);
	const normalizedRole = (authRole || "").toLowerCase();
	const canManage = ["admin", "superadmin"].includes(normalizedRole);
	return (
		<div className="relative">
			<button
				onClick={() => setIsOpen(!isOpen)}
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
							onClick={() => {
								setIsOpen(false);
								navigate(`/admin/single-user/${row._id}`);
							}}
							className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
						>
							View User
						</button>
						{canManage && (
							<button
								onClick={() => {
									setIsOpen(false);
									navigate(`/admin/edit-user/${row._id}`);
								}}
								className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 transition-colors"
							>
								Edit User
							</button>
						)}
						{canManage && (
							<button
								onClick={() => {
									setIsOpen(false);
									onDeleteClick(row);
								}}
								className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 transition-colors"
							>
								Delete User
							</button>
						)}
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

export default AllUsers;
