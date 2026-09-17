/* eslint-disable no-unused-vars */
import React, { useEffect, useMemo, useState } from "react";
import {
	Link,
	useNavigate,
	useSearchParams,
} from "react-router-dom";
import RemoveIcon from "@mui/icons-material/Remove";
import { FaTrash, FaEdit } from "react-icons/fa";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { customFetch, getRealFileUrl } from "../utils";
import { toast } from "react-toastify";
import { Button, Card } from "@mui/material";
import { Button as ShButton } from "../components/ui/button";
import ReactPaginate from "react-paginate";
import { useCallback } from "react";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";

// import ModalCard component.
import { ModelCard } from "../components/ModelCard";
import { deleteFromDb } from "@/components/SceneComponent";
// import ModelsOverview from "./new/ModelsOverview";
import SearchInput from "../components/ui/search-input";
import { DeleteAlert, SuccessAlert } from "../components/ui/alert";
import ModelsOverview from "./new/ModelsOverview";

const url = "/model/get-models";
const deletedModelsUrl = "/model/get-softed-models";

const modelQuery = {
	queryKey: ["model"],
	queryFn: () => customFetch(url),
};

export const deletedModelQuery = {
	queryKey: ["deleted_model"],
	queryFn: () => customFetch(deletedModelsUrl),
};

export const loader = (queryClient) => async () => {
	const response = await queryClient.ensureQueryData(modelQuery);

	let model = [];
	if (response.data.status !== "error") {
		model = response.data.data || [];
	} else {
		toast.error(response.data.message);
	}

	let deletedModels = [];
	const deletedResponse = await queryClient.ensureQueryData(deletedModelQuery);
	if (deletedResponse.data.status !== "error") {
		deletedModels = deletedResponse.data.data || [];
	} else {
		toast.error(deletedResponse.data.message);
	}

	return { model, deletedModels };
};

const AllModels = () => {
	const { data: modelsResponse } = useQuery(modelQuery);
	const { data: deletedModelsResponse } = useQuery(deletedModelQuery);
	const model = modelsResponse?.data?.data || [];
	const deletedModels = deletedModelsResponse?.data?.data || [];
	const [searchParams] = useSearchParams();
	const isCompletedView = searchParams.get("type") === "completed";

	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [searchText, setSearchText] = useState("");
	const [deleteModel, setDeleteModel] = useState(false);
	const [modelToDelList, setModelToDelList] = useState([]);
	const [confirmDelete, setConfirmDelete] = useState(false); // legacy, replaced below
	const [showDeleteAlert, setShowDeleteAlert] = useState(false);
	const [showSuccessAlert, setShowSuccessAlert] = useState(false);
	const [pendingDeleteIds, setPendingDeleteIds] = useState([]);
	const [itemOffset, setItemOffset] = useState(0);
	const itemsPerPage = 6;

	// Compute stats for Facilities overview cards
	const statsData = useMemo(() => {
		const totalModels = Array.isArray(model) ? model.length : 0;
		const completedModels = Array.isArray(model)
			? model.filter((m) => m?.isComplete).length
			: 0;
		const deleted = Array.isArray(deletedModels)
			? deletedModels.filter((m) => m?.delete).length
			: 0;
		const activeModels = Math.max(0, totalModels);
		// Deleted facilities are not present in this list; show 0 here
		return {
			totalModels,
			activeModels,
			completedModels,
			deletedModels: deleted,
		};
	}, [model]);

	const modelsAfterViewAndSearch = useMemo(() => {
		const viewFiltered = isCompletedView
			? model.filter((item) => item.isComplete)
			: model;

		const term = searchText.toLowerCase();
		if (!term.length) {
			return viewFiltered;
		}
		const regex = new RegExp(`.*${term}.*`, "i");
		return viewFiltered.filter((item) => {
			return regex.test((item.modelName || "").toLowerCase());
		});
	}, [model, isCompletedView, searchText]);

	const endOffset = itemOffset + itemsPerPage;
	const currentItems = useMemo(
		() => modelsAfterViewAndSearch.slice(itemOffset, endOffset),
		[endOffset, itemOffset, modelsAfterViewAndSearch]
	);

	const pageCount = Math.max(
		1,
		Math.ceil(modelsAfterViewAndSearch.length / itemsPerPage)
	);

	const handlePageClick = (event) => {
		const newOffset =
			(event.selected * itemsPerPage) % modelsAfterViewAndSearch.length;
		setItemOffset(newOffset);
	};

	const user = useSelector(memoize((state) => state?.userState?.user));
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

	const mutation = useMutation(
		(ids) =>
			customFetch.post(`/model/soft-delete-models/`, { modelIds: ids }),
		{
			onSuccess: async () => {
				setShowSuccessAlert(true);
				await queryClient.invalidateQueries(["model"]);
				setModelToDelList([]);
				setDeleteModel(false);
				setItemOffset(0);
			},
			onError: (error) => {
				toast.error(error.message);
			},
		}
	);

	const handleDeleteModels = () => {
		if (!modelToDelList.length) {
			toast.error("Please select at least one Facility Section");
			return;
		}
		setPendingDeleteIds(modelToDelList);
		setShowDeleteAlert(true);
	};

	useEffect(() => {
		const total = modelsAfterViewAndSearch.length;
		const maxPageIndex = Math.max(0, Math.ceil(total / itemsPerPage) - 1);
		const desiredOffset = Math.min(itemOffset, maxPageIndex * itemsPerPage);
		if (itemOffset !== desiredOffset) setItemOffset(desiredOffset);
	}, [modelsAfterViewAndSearch, itemsPerPage, itemOffset]);

	const handleDeleteAModel = (id) => {
		setPendingDeleteIds([id]);
		setShowDeleteAlert(true);
	};

	const deleteModels = () => {
		setConfirmDelete(false);
		setDeleteModel(false);
	};

	const handleCheckedForSoftDelete = (id, e) => {
		if (e) {
			e.preventDefault?.();
			e.stopPropagation?.();
		}
		if (modelToDelList.includes(id)) {
			setModelToDelList(modelToDelList.filter((item) => item !== id));
		} else {
			setModelToDelList([...modelToDelList, id]);
		}
	};

	return (
		<div className="AllModels box-border w-full py-3">
			<main className="w-full mt-2">
				{/* Facilities Overview Cards */}
				<ModelsOverview data={statsData} />

				<div className="mb-2 w-full lg:px-3 xl:px-5 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
					<button
						onClick={() => navigate("/admin/models")}
						className={`h-[46px] rounded-[100px] px-5 text-sm font-medium border ${
							!isCompletedView
								? "bg-primary text-white border-primary"
								: "bg-white text-gray-600 border-gray-300"
						}`}
					>
						All Facilities
					</button>
					<button
						onClick={() => navigate("/admin/models?type=completed")}
						className={`h-[46px] rounded-[100px] px-5 text-sm font-medium border ${
							isCompletedView
								? "bg-primary text-white border-primary"
								: "bg-white text-gray-600 border-gray-300"
						}`}
					>
						Complete Facilities
					</button>
				</div>

				<div className="modelControl mb-3 w-full items-center justify-end px-1 lg:px-3 xl:px-5">
					{deleteModel ? (
						<div className="deleteModeWrapper flex flex-row items-center justify-between">
							<div
								className="backBtnWrapper flex flex-row items-center justify-center gap-4"
								onClick={deleteModels}
							>
								<div className="back flex h-10 items-center justify-center">
									<img
										src="/img/back (4).png"
										alt="icon"
										className="my-auto"
									/>
								</div>
								<Button className="add btn btn-sm mr-5 bg-white shadow-none">
									<div className="flex max-sm:text-sm">back</div>
								</Button>
							</div>
							<Button
								className="add btn btn-success btn-sm mr-5 bg-red-900"
								onClick={handleDeleteModels}
							>
								<RemoveIcon style={{ color: "#FFF" }} />
								<p className="text-white max-md:truncate max-sm:text-sm">
									Delete Selected Facility Sections
								</p>
							</Button>
						</div>
					) : null}
				</div>

				<div className="mx-3 w-[94%] flex items-center justify-between gap-4">
					<SearchInput
						value={searchText}
						onChange={(v) => {
							setSearchText(v);
							setItemOffset(0);
						}}
						placeholder="Search by Facility, Status, Location..."
					/>
					<div className="flex items-center gap-3">
						{!deleteModel &&
							["admin", "superAdmin"].includes(currentUser.role) && (
								<>
									<Link
										to={`${
											["admin", "superAdmin"].includes(
												currentUser.role
											)
												? "/admin/models/add-model"
												: currentUser.role === "sampler"
												? "/sampler/models/add-model"
												: "/login"
										}`}
									>
										<ShButton className="w-[206px] h-[48px] rounded-[20px] bg-primary text-white border border-primary shadow-none">
											<p className="max-sm:text-sm">
											Add Facility Section
											</p>
										</ShButton>
									</Link>
									<ShButton
										onClick={() => setDeleteModel(true)}
										className="w-[206px] h-[48px] rounded-[20px] bg-white text-primary border border-primary shadow-none"
									>
										<p className="max-sm:text-sm">Delete Multiple</p>
									</ShButton>
								</>
							)}
					</div>
				</div>
				<div className="flex flex-wrap justify-start gap-6 p-6">
					{currentItems?.map((item, index) => (
						<div
							key={index}
							className="w-[calc(33.33%-1rem)] min-w-[300px]"
							onClick={(e) => {
								if (deleteModel) {
									e.preventDefault();
									e.stopPropagation();
								}
							}}
						>
							<ModelCard
								model={item}
								onDelete={handleDeleteAModel}
								onEdit={(id, e) => {
									if (deleteModel) {
										e?.preventDefault?.();
										e?.stopPropagation?.();
										return;
									}
									navigate(
										`/${
											["admin", "superAdmin"].includes(user?.role)
												? "admin"
												: user?.role
										}/edit-model/${id}`
									);
								}}
								deleteModel={deleteModel}
								onCheck={(id, e) => handleCheckedForSoftDelete(id, e)}
								userRole={user?.role}
								isChecked={modelToDelList.includes(item._id)}
							/>
						</div>
					))}
				</div>

				<div className="navigatonBtnContainer -mt-5">
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
				<DeleteAlert
					isOpen={showDeleteAlert}
					onClose={() => {
						setShowDeleteAlert(false);
						setTimeout(() => window?.location.reload(), 2000);
					}}
					onConfirm={() => {
						setShowDeleteAlert(false);
						if (pendingDeleteIds.length) {
							mutation.mutate(pendingDeleteIds);
						}
					}}
					title="Delete Facility Section(s)"
					message="Are you sure you want to delete the selected Facility Section(s)? This action cannot be undone."
				/>
				<SuccessAlert
					isOpen={showSuccessAlert}
					onClose={() => setShowSuccessAlert(false)}
					title="Delete Successful"
					message="Facility Section(s) were deleted successfully."
				/>
			</main>
		</div>
	);
};

export default AllModels;
