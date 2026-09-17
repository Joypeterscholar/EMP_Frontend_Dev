import { useEffect, useMemo, useState } from "react";
import "../styles/AllModels.css";
import { useLoaderData } from "react-router-dom";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { toast } from "react-toastify";
import { customFetch, getRealFileUrl } from "../utils";
import { Button, Card } from "@mui/material";
import ReactPaginate from "react-paginate";
import { useQueryClient, useQuery } from "@tanstack/react-query";

const url = "/model/get-softed-models";
const modelQuery = {
	queryKey: ["model_soft_deleted"],
	queryFn: () => customFetch(url),
};

// eslint-disable-next-line react-refresh/only-export-components
export const modelTrashLoader = (queryClient) => async () => {
	const response = await queryClient.ensureQueryData(modelQuery);
	let model = [];
	if (response.data.status !== "error") {
		model = response.data.data;
	} else {
		toast.error(response.data.message);
	}
	return { model };
};

const Trash = () => {
	const { model: initialModel } = useLoaderData();
	const { data: modelsResponse } = useQuery({
		...modelQuery,
		initialData: { data: { data: initialModel } },
	});
	const model = modelsResponse?.data?.data || initialModel || [];
	const queryClient = useQueryClient();
	const [deleteModel, setDeleteModel] = useState(false);
	const [confirmDelete, setConfirmDelete] = useState(false);
	// eslint-disable-next-line no-unused-vars
	const user = useSelector(memoize((state) => state.userState.user));
	const [itemOffset, setItemOffset] = useState(0);
	const itemsPerPage = 6;
	const endOffset = itemOffset + itemsPerPage;
	const currentItems = useMemo(
		() => model.slice(itemOffset, endOffset),
		[endOffset, itemOffset, model]
	);
	const pageCount = Math.max(1, Math.ceil(model.length / itemsPerPage));

	// Invoke when user click to request another page.
	const handlePageClick = (event) => {
		setItemOffset(event.selected * itemsPerPage);
	};

	const handleRestore = async (id) => {
		const response = await customFetch.get(
			`/model/restore-softed-models/${id}`
		);
		if (response.data.status !== "error") {
			await queryClient.invalidateQueries("model_soft_deleted");
			toast.success(
				response.data.message || "Facility Section restored successfully"
			);
		} else {
			toast.error(response.data.message);
		}
	};

	const handleDelete = async (id) => {
		const response = await customFetch.delete(`/model/delete-a-models/${id}`);
		if (response.data.status !== "error") {
			await queryClient.invalidateQueries("model_soft_deleted");
			toast.success(
				response.data.message || "Facility Section deleted successfully"
			);
		} else {
			toast.error(response.data.message);
		}
	};

	const deleteModels = () => {
		setConfirmDelete(false);
		setDeleteModel(false);
	};

	// Clamp itemOffset when list shrinks
	useEffect(() => {
		const total = model.length;
		const maxPageIndex = Math.max(0, Math.ceil(total / itemsPerPage) - 1);
		const desiredOffset = Math.min(itemOffset, maxPageIndex * itemsPerPage);
		if (itemOffset !== desiredOffset) setItemOffset(desiredOffset);
	}, [model, itemsPerPage, itemOffset]);

	return (
		<div className="AllModels flex justify-center items-center flex-col box-border w-full py-5">
			<main className="w-full">
				<div className="allModelsWrapper flex justify-center items-center flex gap-3 max-md:w-full max-md:flex-col max-sm:flex max-sm:p-3">
					{" "}
					{currentItems?.map((item, index) => {
						// eslint-disable-next-line no-unused-vars
						const { _id, coverPicture, modelName } = item;
						return (
							<Card
								className={`${
									deleteModel
										? "w-80 h-auto opacity max-md:w-full p-2"
										: "w-80 h-auto max-md:w-full p-2"
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
										backgroundImage: `url("${
											getRealFileUrl(coverPicture) ??
											"https://res.cloudinary.com/diqqf3eq2/image/upload/v1595959131/person-3_rxtqvi.jpg"
										}")`,
									}}
								>
									{deleteModel && (
										<div className="checkbox">
											<input
												id={_id}
												// onClick={(e) => handleChecked(e)}
												type="checkbox"
												name="check"
												value={_id}
											/>
											<label htmlFor={_id}></label>
										</div>
									)}
								</div>
								<div className="w-full truncate p-1 text-center font-bold capitalize">
									{modelName}
								</div>
								<div className="flex w-full flex-col">
									<Button
										className="w-full btn btn-neutral btn-sm mt-1 w-full rounded-full"
										onClick={() => handleRestore(_id)}
									>
										Restore
									</Button>
									<Button
										className="w-full btn btn-outline btn-neutral btn-sm w-full rounded-full"
										onClick={() => handleDelete(_id)}
									>
										Delete Permanently
									</Button>
									<Button
										className="w-full btn btn-outline btn-neutral btn-sm w-full rounded-full"
										onClick={() => {
											window.indexedDB
												.databases()
												.then((r) => {
													for (var i = 0; i < r.length; i++)
														window.indexedDB.deleteDatabase(
															r[i].name
														);
												})
												.then(() => {
													alert("All data cleared.");
												});
										}}
									>
										Clear Local Facility Database
									</Button>
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

export default Trash;
