// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { SubmitBtn } from "../components";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import WebIcons from "../components/custom/WebIcons";
import { Button } from "../components/ui/button";
import { CustomCheckbox } from "../components/custom/CustomCheckbox";
import GradientHeader from "../components/ui/GradientHeader";
import { useQueryClient } from "@tanstack/react-query";

const EditModel = () => {
	const { model } = useLoaderData();
	const { id } = useParams();
	const navigate = useNavigate();
	const queryClient = useQueryClient();
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageName, setImageName] = useState("");
	const [twoD, set2d] = useState("");
	const [formData, setFormData] = useState({
		modelName: model.modelName,
		description: model.description,
		location: model.location?._id,
		coverPicture: model.coverPicture,
		twoD: model.twoD,
		isComplete: model.isComplete || false,
	});
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

	const handleInputChange = (e) => {
		const { name, value, files, type, checked } = e.target;
		if (name === "coverPicture") {
			setImageName(files[0].name);
		}
		if (name === "twoD") {
			set2d(files[0].name);
		}
		setFormData({
			...formData,
			[name]: type === "checkbox" ? checked : files ? files[0] : value,
		});
	};

	const handleEdit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("modelName", formData.modelName);
			formDataForUpload.append("description", formData.description);
			formDataForUpload.append("location", formData.location);
			formDataForUpload.append("image", formData.coverPicture);
			formDataForUpload.append("twoD", formData.twoD);
			formDataForUpload.append("isComplete", formData.isComplete);
			formDataForUpload.append("userId", currentUser?._id);
			const response = await customFetch.post(
				`/model/update-model/${id}`,
				formDataForUpload
			);
			if (response.data?.status !== "error") {
				toast.success(`Facility Section edited successfully`);
				setImageName("");
				set2d("");
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["model"] }),
					queryClient.invalidateQueries({ queryKey: ["deleted_model"] }),
				]);
				navigate(-1);
			} else {
				toast.error(response.data?.message);
			}
			// setShowModal(true);
		} catch (error) {
			const errorMessage =
				error?.response?.data?.msg || "Error editing Model";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<div className="py-8 AddUser">
			{/* Gradient Header */}
			<GradientHeader />
			<form
				method="POST"
				encType="multipart/form-data"
				className="flex flex-col justify-start items-center w-full"
				onSubmit={handleEdit}
			>
				<div className="flex flex-col gap-4 justify-center items-center w-full max-w-2xl">
					<div className="heading">
						<h1 className="heading-large font-bold text-center">
							Edit Facility Section
						</h1>
						<p className="mb-3 text-center font-[3400]">
							Please edit Facility Section details
						</p>
					</div>
					<div className="flex flex-col justify-center items-start w-full">
						<p>Facility Section name</p>
						<input
							className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
							type="text"
							name="modelName"
							value={formData.modelName}
							placeholder="Enter Facility Section name"
							onChange={handleInputChange}
							required
						/>
					</div>
					<div className="flex flex-col justify-center items-start w-full">
						<p>Description</p>
						<input
							type="text"
							className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
							name="description"
							value={formData.description}
							placeholder="Enter Facility Section Description"
							onChange={handleInputChange}
							required
						/>
					</div>
					<div
						className={`flex flex-col items-center w-full gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4`}
					>
						<div className="img">
							<WebIcons icon="Cloud" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-bold">
								Choose 2d image to upload
							</h3>
							<p>JPEG, PNG</p>
						</div>
						<label className="btn">
							<Button className=" w-[206px] text-regular rounded-[20px] bg-gray-200 text-secondaryAlt2 shadow-none">
								{twoD || "Browse Files"}
							</Button>
							<input
								type="file"
								name="twoD"
								accept=".jpg, .jpeg, .png, .webp"
								className="hidden"
								onChange={handleInputChange}
								// required
							/>
						</label>
					</div>
					<div
						className={`flex flex-col items-center w-full gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4`}
					>
						<div className="img">
							<WebIcons icon="Cloud" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-bold">
								Choose a cover photo to upload
							</h3>
							<p>JPEG, PNG, up to 2MB</p>
						</div>
						<label className="btn">
							<Button className=" w-[206px] text-regular rounded-[20px] bg-gray-200 text-secondaryAlt2 shadow-none">
								{imageName || "Browse Files"}
							</Button>
							<input
								type="file"
								name="coverPicture"
								accept=".jpg, .jpeg, .png, .webp"
								className="hidden"
								onChange={handleInputChange}
								// required
							/>
						</label>
					</div>
					<div className="flex items-center gap-2 w-full mb-3">
						<CustomCheckbox
							id="isComplete"
							checked={formData.isComplete}
							onCheckedChange={(val) =>
								setFormData((prev) => ({ ...prev, isComplete: !!val }))
							}
							className="h-5 w-5"
						/>
						<label
							htmlFor="isComplete"
							className="text-regular font-medium"
						>
							Mark as complete facility
						</label>
					</div>
					<div className="mt-4 w-full">
						<SubmitBtn text="Save model" isSubmitting={isSubmitting} />
					</div>
				</div>
			</form>
		</div>
	);
};

export default EditModel;
