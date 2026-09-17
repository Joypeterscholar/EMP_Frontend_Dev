// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { Successful } from "../components";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";
import { customFetch } from "../utils";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import WebIcons from "../components/custom/WebIcons";
import { Button } from "../components/ui/button";
import { CustomCheckbox } from "../components/custom/CustomCheckbox";
import GradientHeader from "../components/ui/GradientHeader";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";

const AddModel = () => {
	const [showModal, setShowModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [locations, setLocations] = useState();
	const [imageName, setImageName] = useState("");
	const [modelName, setModelName] = useState("");
	const [twoD, set2d] = useState("");
	const [formData, setFormData] = useState({
		modelName: "",
		description: "",
		location: "",
		file: null,
		coverPicture: null,
		twoD: null,
		isComplete: false,
	});
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const queryClient = useQueryClient();
	const navigate = useNavigate();
	async function fetchLocations() {
		await customFetch.get("/location/locations").then(({ data }) => {
			if (data?.data) {
				const locationsNew = data.data.map((item) => ({
					label: item.name,
					value: item._id,
				}));
				setLocations(locationsNew);
				// Default the model location to the first available location
				if (locationsNew.length > 0) {
					setFormData((prev) => ({
						...prev,
						location: locationsNew[0].value,
					}));
				}
			}
		});
	}

	useEffect(() => {
		fetchLocations();
	}, []);
	const handleInputChange = (e) => {
		const { name, value, files, type, checked } = e.target;
		if (name === "file") {
			setModelName(files[0].name);
		}
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

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			if (!formData.file) {
				toast.error("please provide a model file");
				setIsSubmitting(false);
				return;
			}

			formDataForUpload.append("modelName", formData.modelName);
			formDataForUpload.append("description", formData.description);
			formDataForUpload.append("location", formData.location);
			formDataForUpload.append("model", formData.file);
			formDataForUpload.append("size", formData.file.size);
			formDataForUpload.append("image", formData.coverPicture);
			formDataForUpload.append("twoD", formData.twoD);
			formDataForUpload.append("isComplete", formData.isComplete);
			formDataForUpload.append("userId", currentUser?._id);

			const response = await customFetch.post(
				"/model/create-models",
				formDataForUpload
			);
			if (response.data?.status !== "error") {
				toast.success(`Model added successfully`);
				// Invalidate and refetch queries to automatically update the models list
				await Promise.all([
					queryClient.invalidateQueries({ queryKey: ["model"] }),
					queryClient.invalidateQueries({ queryKey: ["deleted_model"] }),
					queryClient.refetchQueries({ queryKey: ["model"] }),
					queryClient.refetchQueries({ queryKey: ["deleted_model"] }),
				]).catch(() => {});
				setFormData({
					modelName: "",
					description: "",
					location: "",
					file: null,
					coverPicture: null,
					twoD: null,
					isComplete: false,
				});
				setModelName("");
				setImageName("");
				set2d("");
				// Navigate back to Facility Sections with automatic data refresh
				// Dynamic navigation based on user role
				const basePath = ["admin", "superAdmin"].includes(currentUser?.role)
					? "/admin"
					: `/${currentUser?.role}`;
				navigate(`${basePath}/models`);
			} else {
				toast.error(response.data?.message);
			}
			// setShowModal(true);
		} catch (error) {
			const errorMessage =
				error?.response?.data?.msg || "Error adding model";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<section className="grid gap-10 place-items-center py-5 w-full">
			{/* Gradient Header */}
			{/* <GradientHeader /> */}
			<form
				onSubmit={handleSubmit}
				method="POST"
				encType="multipart/form-data"
				className="flex flex-col justify-start items-center w-full "
			>
				<h3 className="mb-4 heading-large font-bold text-center">
					Add Facility Section
				</h3>
				<div className="flex flex-col gap-4 justify-center items-center w-full max-w-2xl">
					<input
						type="text"
						name="modelName"
						placeholder="Facility Section Name"
						className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
						onChange={handleInputChange}
						required
					/>
					<input
						type="text"
						name="description"
						placeholder="Facility Section Description"
						className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
						onChange={handleInputChange}
						required
					/>
					{/* Location selection removed from UI.
						The first available location from the API is automatically
						set in formData.location before submission. */}
					<div className="flex w-full flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
						<WebIcons icon="Cloud" />
						<div className="text-center">
							<h3 className="text-lg font-bold">
								Choose a facility section to upload
							</h3>
							<p>GLTF, GLB, OBJ, STL formats</p>
						</div>
						<label className="btn">
							<Button className=" w-[206px] text-regular rounded-[20px] bg-gray-200 text-secondaryAlt2 shadow-none">
								{modelName || "Browse Files"}
							</Button>
							<input
								type="file"
								name="file"
								accept=".gltf, .glb, .obj, .stl"
								required
								className="hidden"
								onChange={handleInputChange}
							/>
						</label>
					</div>
					<div className="flex w-full flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
						<div className="img">
							<WebIcons icon="Cloud" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-bold">Choose a 2d Image</h3>
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
							/>
						</label>
					</div>
					<div className="flex w-full flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
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
					<button
						className="w-full h-12 text-regular font-semibold bg-primary hover:bg-secondaryAlt text-white transition-colors rounded-2xl"
						type="submit"
						disabled={isSubmitting}
					>
						{isSubmitting ? (
							<>
								<span className="loading loading-spinner"></span>
								sending...
							</>
						) : (
							"Save"
						)}
					</button>
				</div>
			</form>
			<Successful
				text="Model added"
				showModal={showModal}
				setShowModal={setShowModal}
			/>
		</section>
	);
};

export default AddModel;
