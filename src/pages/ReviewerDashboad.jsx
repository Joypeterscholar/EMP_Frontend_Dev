import { useCallback, useEffect, useMemo, useState } from "react";
import "../styles/AllModels.css";
import { Link, useLoaderData, useNavigate } from "react-router-dom";
import { FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import { toast } from "react-toastify";
import { customFetch } from "../utils";
import { Button, Card } from "@mui/material";
import ReactPaginate from "react-paginate";
const url = "/model/get-models";

const modelQuery = {
	queryKey: ["model"],
	queryFn: () => customFetch(url),
};

// eslint-disable-next-line react-refresh/only-export-components
export const modelloader = (queryClient) => async () => {
	const response = await queryClient.ensureQueryData(modelQuery);
	let model = [];
	if (response.data.status !== "error") {
		model = response.data.data;
	} else {
		toast.error(response.data.message);
	}
	return { model };
};

const ReviewerDashBoard = () => {
	const { model } = useLoaderData();
	const navigate = useNavigate();
	const [deleteModel, setDeleteModel] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	const [searchTerm, setSearchTerm] = useState("");
	const [filterStatus, setFilterStatus] = useState("all");
	const [showFilterPanel, setShowFilterPanel] = useState(false);
	// eslint-disable-next-line no-unused-vars
	const user = useSelector(memoize((state) => state.userState.user));
	const [itemOffset, setItemOffset] = useState(0);
	const itemsPerPage = 6;
	const sanitizedModels = Array.isArray(model) ? model : [];
	const filteredModels = useMemo(() => {
		const term = searchTerm.trim().toLowerCase();
		return sanitizedModels.filter((item) => {
			const name = (item?.modelName || "").toLowerCase();
			const matchesSearch = term.length ? name.includes(term) : true;
			const isComplete = Boolean(item?.isComplete);

			if (filterStatus === "completed") return matchesSearch && isComplete;
			if (filterStatus === "incomplete") return matchesSearch && !isComplete;
			return matchesSearch;
		});
	}, [sanitizedModels, searchTerm, filterStatus]);

	const endOffset = itemOffset + itemsPerPage;
	const currentItems = useMemo(
		() => filteredModels.slice(itemOffset, endOffset),
		[filteredModels, endOffset, itemOffset]
	);
	const pageCount = Math.max(
		1,
		Math.ceil(filteredModels.length / itemsPerPage)
	);

	// Invoke when user click to request another page.
	const handlePageClick = (event) => {
		const total = Math.max(filteredModels.length, 1);
		const newOffset = (event.selected * itemsPerPage) % total;
		setItemOffset(newOffset);
	};
	const deleteModels = () => {
		setConfirmDelete(false);
		setDeleteModel(false);
	};

	// Clamp itemOffset when list shrinks
	useEffect(() => {
		const total = filteredModels.length;
		const maxPageIndex = Math.max(0, Math.ceil(total / itemsPerPage) - 1);
		const desiredOffset = Math.min(itemOffset, maxPageIndex * itemsPerPage);
		if (itemOffset !== desiredOffset) setItemOffset(desiredOffset);
	}, [filteredModels, itemsPerPage, itemOffset]);

	useEffect(() => {
		setItemOffset(0);
	}, [searchTerm]);

	const handleFilterChange = useCallback((value) => {
		setFilterStatus(value);
		setItemOffset(0);
	}, []);

	return (
		<div className="AllModels container box-border w-full py-5">
			<main className="w-full">
				<div className="searchBarContainer md:mx-10 mx-5">
					<div className="searchIconWrapper">
						<div className="img searchImg ml-2">
							<img src="/img/search (2).png" alt="icon" />
						</div>
					</div>
					<input
						type="text"
						name="search"
						placeholder="Search Facility Section"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
					/>
				</div>

				<div className="filterSection md:mx-10 mt-4 flex flex-col gap-3 rounded-2xl border border-dashed border-gray-300 p-4">
					<button
						type="button"
						className="flex w-full items-center justify-between rounded-full bg-gradient-to-r from-gray-100 to-gray-200 px-4 py-2 text-left text-sm font-medium text-gray-700 shadow"
						onClick={() => setShowFilterPanel((prev) => !prev)}
					>
						<span className="flex items-center gap-2">
							<span className="img flex h-6 w-6 items-center justify-center rounded-full bg-white shadow">
								<img
									src="/img/edit.png"
									alt="icon"
									className="h-4 w-4"
								/>
							</span>
							Filter results
						</span>
						<KeyboardArrowUpIcon
							className={`${
								showFilterPanel ? "" : "rotate-180"
							} transition-transform`}
						/>
					</button>

					{showFilterPanel && (
						<div className="flex flex-col gap-3 sm:flex-row sm:items-center">
							<label className="text-sm font-semibold text-gray-600">
								Facility status
							</label>
							<select
								className="select select-bordered max-w-xs rounded-full bg-white/90 text-gray-800 shadow-inner"
								value={filterStatus}
								onChange={(e) => handleFilterChange(e.target.value)}
							>
								<option value="all">All facilities</option>
								<option value="completed">Completed</option>
							</select>
							{filterStatus !== "all" && (
								<button
									type="button"
									className="btn btn-ghost btn-sm rounded-full"
									onClick={() => handleFilterChange("all")}
								>
									Clear filter
								</button>
							)}
						</div>
					)}
				</div>

				<div className="p-8 flex-row flex-wrap gap-8 max-sm:flex max-sm:w-full max-sm:flex-col max-sm:gap-5 sm:flex">
					{currentItems?.map((item, index) => {
						// eslint-disable-next-line no-unused-vars
						const { _id, coverPicture, modelName } = item;
						return (
							<Card
								className={`${
									deleteModel
										? "w-64 h-auto opacity max-sm:w-full p-2"
										: "w-64 h-auto max-sm:w-full p-2"
								}`}
								key={index}
							>
								<div
									className={`${
										deleteModel
											? "opacity h-60 bg-cover rounded-md block w-full"
											: "block bg-cover h-60 rounded-md w-full"
									}`}
									style={{
										backgroundImage: `url(${
											coverPicture ??
											"https://res.cloudinary.com/diqqf3eq2/image/upload/v1595959131/person-3_rxtqvi.jpg"
										})`,
									}}
								></div>
								<div className="w-full truncate p-1 font-bold capitalize">
									{modelName}
								</div>
								<div className="flex w-full flex-col items-center justify-center gap-1">
									<div className="flex w-[100%] items-center justify-between gap-2">
										<div className="dropdown dropdown-top w-full">
											<div
												tabIndex={0}
												role="button"
												className="btn btn-outline btn-neutral btn-sm w-full flex-row justify-center rounded-full"
											>
												<span>View</span> <KeyboardArrowUpIcon />
											</div>
											<ul
												tabIndex={0}
												className="menu dropdown-content z-20 w-full rounded-box bg-base-100 p-2 shadow"
											>
												<li className="btn">
													<Link to={`/view-model/${_id}`}>
														View Model
													</Link>
												</li>
												<li className="btn">
													<Link
														to={`/${
															["admin", "superAdmin"].includes(
																user?.role
															)
																? "admin"
																: user?.role
														}/view-evidences/${_id}`}
													>
														View Samples
													</Link>
												</li>
												<li className="btn">
													<Link
														to={`/${
															["admin", "superAdmin"].includes(
																user?.role
															)
																? "admin"
																: user?.role
														}/view-incidents/${_id}`}
													>
														View Incidents
													</Link>
												</li>
											</ul>
										</div>
									</div>
								</div>
							</Card>
						);
					})}
				</div>

				<div className="navigatonBtnContainer">
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
				</div>
				{confirmDelete && (
					<div className="confirmationModalWrapper">
						<div className="confirmationModal">
							<h1>Are you sure you want to delete?</h1>
							<div className="btnWrapper">
								<button className="Yes" onClick={deleteModels}>
									Yes
								</button>
								<button
									className="No"
									onClick={() => setConfirmDelete(false)}
								>
									No
								</button>
							</div>
						</div>
					</div>
				)}
			</main>
		</div>
	);
};

export default ReviewerDashBoard;
