// eslint-disable-next-line no-unused-vars
import React, { useState, useEffect } from "react";
import { MdOutlineCancel } from "react-icons/md";
import { CiLocationOn } from "react-icons/ci";
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import { Button } from "../components/ui/button";
import WebIcons from "../components/custom/WebIcons";

// eslint-disable-next-line react/prop-types
const AddLocation = ({ showModal, setShowModal, fetchData }) => {
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageName, setImageName] = useState("");
	const [formData, setFormData] = useState({
		name: "",
		user: currentUser._id,
		image: "",
	});

	useEffect(() => {
		if (showModal) {
			// prevent background scrolling when modal is open
			document.body.classList.add("overflow-hidden");
			return () => document.body.classList.remove("overflow-hidden");
		}
		// ensure cleanup if modal closes without unmount
		document.body.classList.remove("overflow-hidden");
	}, [showModal]);

	const handleChange = (e) => {
		const { name, value, files } = e.target;
		if (name === "image") {
			setImageName(files[0].name);
		}
		setFormData({
			...formData,
			[name]: files ? files[0] : value,
		});
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("name", formData.name);
			formDataForUpload.append("user", currentUser._id);
			formDataForUpload.append("image", formData.image);

			const response = await customFetch.post(
				"/location/create-location",
				formDataForUpload
			);
			if (response.data?.status !== "error") {
				fetchData();
				toast.success(`Facility added successfully`);
				setShowModal(true);
				for (let key in formData) {
					formData[key] = "";
				}
				setFormData(formData);
				setImageName("");
			} else {
				toast.error(response.data?.message);
			}
		} catch (error) {
			const errorMessage =
				error?.response?.data?.msg || "Error adding Facility";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};

	const closeModal = () => {
		setShowModal(!showModal);
	};
	return (
		<>
			{showModal && (
				<div className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50 py-4 overflow-y-auto">
					<form
						onSubmit={handleSubmit}
						method="POST"
						encType="multipart/form-data"
						className="card relative flex max-w-md flex-grow flex-col justify-start gap-4 bg-base-100 p-4"
					>
						<div className="absolute right-5 top-5" onClick={closeModal}>
							<MdOutlineCancel className="h-5 w-5" />
						</div>
						<div className="flex flex-col items-center justify-center">
							<CiLocationOn className="h-10 w-10" />
							<h3 className="mb-4 text-center text-2xl font-bold">
								Add Facility
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
										name="image"
										accept=".jpg, .jpeg, .png, .webp"
										className="hidden"
										onChange={handleChange}
										// hack - do we need this
										// required
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

export default AddLocation;
