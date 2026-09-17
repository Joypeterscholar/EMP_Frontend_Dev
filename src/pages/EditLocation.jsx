/* eslint-disable react/prop-types */
import React, { useEffect, useState } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import WebIcons from "../components/custom/WebIcons";
import { Button } from "../components/ui/button";

const EditLocation = ({ showModal, setShowModal, data, fetchData }) => {
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageName, setImageName] = useState("");
	const [existingImage, setExistingImage] = useState("");

	const [formData, setFormData] = useState({
		name: "",
		user: currentUser._id,
		image: "",
	});

	useEffect(() => {
		if (data) {
			setFormData({
				name: data.name || "",
				user: currentUser._id,
				image: data.image || "",
			});
			setExistingImage(data.image || "");
			// Set the image name from the existing image URL if it exists
			if (data.image) {
				const imageName = data.image.split("/").pop();
				setImageName(imageName);
			}
		}
	}, [data, currentUser._id]);

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "image" && files?.length > 0) {
			setImageName(files[0].name);
			setFormData((prev) => ({
				...prev,
				[name]: files[0],
			}));
		} else {
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("name", formData.name);
			formDataForUpload.append("user", currentUser._id);

			// Only append image if a new file is selected or there's an existing image
			if (formData.image instanceof File) {
				formDataForUpload.append("image", formData.image);
			} else if (existingImage) {
				// If using existing image, send the existing image path
				formDataForUpload.append("existingImage", existingImage);
			}

			const response = await customFetch.put(
				`/location/location-update/${data._id}`,
				formDataForUpload,
				{
					headers: {
						"Content-Type": "multipart/form-data",
					},
				}
			);

			if (response.data?.status !== "error") {
				await fetchData();
				toast.success("Facility updated successfully");
				setShowModal(false);
			} else {
				toast.error(response.data?.message);
			}
		} catch (error) {
			const errorMessage =
				error?.response?.data?.msg || "Error updating Facility";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const closeModal = () => {
		setShowModal(false);
	};

	return (
		<>
			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 py-4">
					<form
						onSubmit={handleSubmit}
						className="card relative flex max-w-md flex-grow flex-col justify-start gap-4 bg-base-100 p-4"
					>
						<div className="absolute right-5 top-5" onClick={closeModal}>
							<MdOutlineCancel className="h-5 w-5" />
						</div>
						<div className="flex flex-col items-center justify-center">
							<CiLocationOn className="h-10 w-10" />
							<h3 className="mb-4 text-center text-2xl font-bold">
								Edit Facility
							</h3>
						</div>
						<div className="flex flex-col gap-y-5">
							<div className="flex flex-col gap-2">
								<label className="font-semibold">Facility Name</label>
								<input
									type="text"
									name="name"
									value={formData.name}
									placeholder="Parckard United Facility"
									className="input input-bordered"
									onChange={handleChange}
									required
								/>
							</div>
							<div className="flex flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
								<div className="img">
									<WebIcons icon="Cloud" />
								</div>
								{existingImage && (
									<div className="mb-2">
										<img
											src={existingImage}
											alt="Current"
											className="w-20 h-20 object-cover rounded"
										/>
									</div>
								)}
								<div className="text-center">
									<h3 className="text-lg font-bold">
										{existingImage
											? "Change cover photo"
											: "Choose a cover photo to upload"}
									</h3>
									<p>JPEG, PNG, up to 2MB</p>
								</div>
								<label className="btn">
									<Button className=" w-[206px] text-regular rounded-[20px] bg-gray-200 text-secondaryAlt2 shadow-none">
										{imageName || "Browse Files"}
									</Button>
									<input
										type="file"
										name="image"
										accept=".jpg, .jpeg, .png, .webp"
										className="hidden"
										onChange={handleChange}
									/>
								</label>
							</div>
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
					</form>
				</div>
			)}
		</>
	);
};

export default EditLocation;
