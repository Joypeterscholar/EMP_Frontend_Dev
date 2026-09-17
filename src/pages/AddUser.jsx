// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { Successful } from "../components";
import { getUserFromLocalStorage } from "@/redux/reducers/userReducer";
import { useNavigate } from "react-router-dom";
import WebIcons from "../components/custom/WebIcons";
import { Button } from "../components/ui/button";
// import GradientHeader from "../components/ui/GradientHeader";
import { FormControl, InputLabel, MenuItem, Select } from "@mui/material";

const AddUser = () => {
	const [formData, setFormData] = useState({
		fullname: "",
		username: "",
		email: "",
		password: "",
		role: "",
		image: "",
		location: "",
	});
	const [visible, setVisible] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageName, setImageName] = useState("");
	const [locations, setLocations] = useState([]);
	const navigate = useNavigate();

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

	async function fetchLocations() {
		await customFetch.get("/location/locations").then(({ data }) => {
			if (data?.data) {
				const LocationsNew = data.data.map((item) => ({
					label: item.name,
					value: item._id,
				}));
				setLocations(LocationsNew);
				// Default the user's location to the first available location
				if (LocationsNew.length > 0) {
					setFormData((prev) => ({
						...prev,
						location: LocationsNew[0].value,
					}));
				}
			}
		});
	}

	useEffect(() => {
		fetchLocations();
	}, []);

	useEffect(() => {
		const pageViewer = getUserFromLocalStorage();
		if (pageViewer?.role !== "superAdmin") {
			toast.error("You are not permitted to view this page");
			navigate(-1);
		}
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		// Frontend validation: ensure required fields are present (image optional)
		const requiredFields = [
			{ key: "fullname", label: "Full name" },
			{ key: "username", label: "Username" },
			{ key: "email", label: "Email" },
			{ key: "password", label: "Password" },
			{ key: "role", label: "Role" },
			{ key: "location", label: "Location" },
		];
		for (const field of requiredFields) {
			if (!String(formData[field.key] || "").trim()) {
				toast.error(`${field.label} is required`);
				return;
			}
		}
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("fullname", formData.fullname);
			formDataForUpload.append("username", formData.username);
			formDataForUpload.append("email", formData.email);
			formDataForUpload.append("password", formData.password);
			formDataForUpload.append("role", formData.role);
			// Image is optional; append only if provided
			if (formData.image) {
				formDataForUpload.append("image", formData.image);
			}
			formDataForUpload.append("location", formData.location);

			const response = await customFetch.post(
				"/user/register-tagger",
				formDataForUpload
			);
			if (response.data?.status !== "error") {
				toast.success(`User added successfully`);
			} else {
				toast.error(response.data?.message);
			}
			setImageName("");
		} catch (error) {
			const errorMessage = error?.response?.data?.msg || "Error adding user";
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
					Add New User
				</h3>
				<div className="flex flex-col gap-4 justify-center items-center w-full max-w-2xl">
					{/* Full Name */}
					<input
						type="text"
						name="fullname"
						value={formData.fullname}
						onChange={handleChange}
						placeholder="Full Name"
						className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
						required
					/>

					{/* Username */}
					<input
						type="text"
						name="username"
						value={formData.username}
						onChange={handleChange}
						placeholder="Username"
						className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
						required
					/>

					{/* Email */}
					<input
						type="email"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="Email"
						className="p-1 w-full h-11 rounded-md border border-gray-400 border-solid"
						required
					/>

					{/* Password field with toggle */}
					<div className="relative w-full">
						<input
							type={visible ? "text" : "password"}
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder="Password"
							className="p-1 w-full h-11 pr-10 rounded-md border border-gray-400 border-solid"
							required
						/>
						<button
							type="button"
							onClick={() => setVisible(!visible)}
							className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
						>
							{visible ? (
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.736m0 0L21 21"
									/>
								</svg>
							) : (
								<svg
									className="h-5 w-5"
									fill="none"
									stroke="currentColor"
									viewBox="0 0 24 24"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
									/>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
									/>
								</svg>
							)}
						</button>
					</div>

					{/* Role Selection */}
					<FormControl fullWidth className="border-0 shadow-none">
						<InputLabel id="role-select-label">
							Select user role
						</InputLabel>
						<Select
							className="w-full h-12 border-0 shadow-none"
							labelId="role-select-label"
							id="role-select"
							onChange={handleChange}
							fullWidth
							label="Select user role"
							value={formData.role || ""}
							name="role"
						>
							<MenuItem value="">
								<em>None</em>
							</MenuItem>
							<MenuItem value="tagger">Sampler</MenuItem>
							<MenuItem value="reviewer">Reviewer</MenuItem>
							<MenuItem value="admin">Admin</MenuItem>
						</Select>
					</FormControl>

					{/* Location selection UI removed.
						The first available location from the API is automatically
						set in formData.location before submission so the payload
						continues to include a valid location. */}

					{/* Profile Image Upload */}
					<div className="flex w-full flex-col items-center gap-y-2 rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-4">
						<div className="img">
							<WebIcons icon="Cloud" />
						</div>
						<div className="text-center">
							<h3 className="text-lg font-bold">
								Choose a profile photo
							</h3>
							<p>JPEG, PNG up to 2MB</p>
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

					{/* Submit Button */}
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
				text="User added successfully"
				showModal={showModal}
				setShowModal={setShowModal}
			/>
		</section>
	);
};

export default AddUser;
