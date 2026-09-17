// eslint-disable-next-line no-unused-vars
import React, { useEffect, useState } from "react";
// import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { customFetch } from "../utils";
import { toast } from "react-toastify";
import { Successful } from "../components";
import { useLoaderData, useNavigate } from "react-router-dom";

import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import { Upload, UserCog } from "lucide-react"; // Import icons
import WebIcons from "../components/custom/WebIcons";

// Import shadcn components
import { Button } from "../components/ui/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "../components/ui/card";
import { Label } from "../components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "../components/ui/select";
// import GradientHeader from "../components/ui/GradientHeader";

const singleUserQuery = (id) => {
	return {
		queryKey: ["user", id],
		queryFn: () => customFetch.get(`/user/get-a-user/${id}`),
	};
};

// eslint-disable-next-line react-refresh/only-export-components
export const singleUserLoader =
	(queryClient) =>
	async ({ params }) => {
		const response = await queryClient.ensureQueryData(
			singleUserQuery(params.id)
		);
		const user = response.data?.data;
		if (response?.data.status === "error") {
			toast.error(response?.data.message);
		}
		return { user };
	};

const EditUser = () => {
	const { user } = useLoaderData();
	const navigate = useNavigate();

	const [formData, setFormData] = useState({
		fullname: user?.fullname || "",
		username: user?.username || "",
		email: user?.email || "",
		role: user?.role || "",
		image: user?.imageUrl || "",
		location: user?.location || "",
		password: "",
	});
	// const [visible, setVisible] = useState(false);
	const [showModal, setShowModal] = useState(false);
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [imageName, setImageName] = useState("");
	const [locations, setLocations] = useState([]);
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
			}
		});
	}

	useEffect(() => {
		const pageViewer = getUserFromLocalStorage();
		if (pageViewer?.role !== "superAdmin") {
			toast.error("You are not permitted to view this page");
			navigate(-1);
		}
		fetchLocations();
	}, []);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsSubmitting(true);
		try {
			const formDataForUpload = new FormData();
			formDataForUpload.append("fullname", formData.fullname);
			formDataForUpload.append("email", formData.email);
			formDataForUpload.append("password", formData.password);
			formDataForUpload.append("username", formData.username);
			formDataForUpload.append("role", formData.role);
			formDataForUpload.append("image", formData.image);
			formDataForUpload.append("location", formData.location);
			const response = await customFetch.put(
				`/user/update-user/${user._id}`,
				formDataForUpload
			);
			if (response.data?.status !== "error") {
				toast.success(`User Edited successfully`);
			} else {
				toast.error(response.data?.message);
			}
		} catch (error) {
			const errorMessage =
				error?.response?.data?.msg || "Error editing user";
			toast.error(errorMessage);
		} finally {
			setIsSubmitting(false);
		}
	};
	return (
		<div className="py-8">
			{/* Gradient Header to match EditModel pattern */}
			{/* <GradientHeader /> */}
			<Card className="mx-auto max-w-2xl bg-white shadow-md">
				<CardHeader className="text-center space-y-1">
					<div className="flex justify-center mb-2">
						<div className="h-12 w-12 rounded-full bg-[#021431]/10 flex items-center justify-center">
							<UserCog className="h-6 w-6 text-primary" />
						</div>
					</div>
					<CardTitle className="heading-large font-bold">
						Edit User
					</CardTitle>
					<p className="text-center text-primary text-bold font-normal">
						Please edit user details
					</p>
				</CardHeader>

				<CardContent>
					<form encType="multipart/form-data" className="space-y-4">
						{/* Full Name */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								Full Name
							</Label>
							<input
								type="text"
								name="fullname"
								value={formData.fullname}
								onChange={handleChange}
								placeholder="Enter your fullname"
								className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
							/>
						</div>

						{/* Email */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								Email
							</Label>
							<input
								type="email"
								name="email"
								value={formData.email}
								onChange={handleChange}
								placeholder="Enter your email"
								className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
							/>
						</div>

						{/* Password */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								Password
							</Label>
							<input
								type="password"
								name="password"
								value={formData.password}
								onChange={handleChange}
								placeholder="Enter your password"
								className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
							/>
						</div>

						{/* Username */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								Username
							</Label>
							<input
								type="text"
								name="username"
								value={formData.username}
								onChange={handleChange}
								placeholder="Enter your username"
								className="w-full h-11 px-3 py-2 rounded-md border border-gray-400 focus:outline-none focus:ring-2 focus:ring-[#021431] focus:border-transparent"
							/>
						</div>

						{/* Role Selection */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								User Role
							</Label>
							<Select
								name="role"
								value={formData.role}
								onValueChange={(value) =>
									handleChange({ target: { name: "role", value } })
								}
							>
								<SelectTrigger className="w-full h-11 border-gray-400 bg-white focus:ring-2 focus:ring-[#021431] focus:border-transparent">
									<SelectValue placeholder="Select user role" />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-200 shadow-lg">
									{user.role === "superAdmin" && (
										<SelectItem
											value="superAdmin"
											className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
										>
											SuperAdmin
										</SelectItem>
									)}
									<SelectItem
										value="tagger"
										className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
									>
										Sampler
									</SelectItem>
									<SelectItem
										value="reviewer"
										className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
									>
										Reviewer
									</SelectItem>
									<SelectItem
										value="admin"
										className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
									>
										Admin
									</SelectItem>
								</SelectContent>
							</Select>
						</div>

						{/* Location Selection */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								Location
							</Label>
							<Select
								name="location"
								value={formData?.location?._id || ""}
								onValueChange={(value) =>
									handleChange({ target: { name: "location", value } })
								}
							>
								<SelectTrigger className="w-full h-11 border-gray-400 bg-white focus:ring-2 focus:ring-[#021431] focus:border-transparent">
									<SelectValue placeholder="Select location" />
								</SelectTrigger>
								<SelectContent className="bg-white border border-gray-200 shadow-lg">
									{Array.isArray(locations) &&
										locations.map((item, index) => (
											<SelectItem
												key={index}
												value={item.value}
												className="hover:bg-[#021431] hover:text-white focus:bg-[#021431] focus:text-white"
											>
												{item.label}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>

						{/* Image Upload */}
						<div className="space-y-2">
							<Label className="text-primary text-bold font-normal">
								Profile Image
							</Label>
							<div className="flex flex-col items-center gap-y-2 w-full rounded-lg border-2 border-dashed border-[#E6E6E6] bg-[#f4f4f4] p-6">
								<div className="img">
									<WebIcons icon="Cloud" />
								</div>
								<div className="space-y-1 text-center">
									<h3 className="text-lg font-bold text-primary">
										Choose a cover photo to upload
									</h3>
									<p className="text-sm text-primary text-bold font-normal">
										JPEG, PNG up to 2MB
									</p>
								</div>
								<label className="cursor-pointer">
									<Button
										className="w-[206px] text-regular rounded-[20px] bg-gray-200 text-secondaryAlt2 shadow-none"
										type="button"
									>
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

						{/* Submit Button */}
						<Button
							type="submit"
							className="w-full h-12 text-base font-semibold bg-primary hover:bg-secondaryAlt text-white transition-colors rounded-2xl"
							disabled={isSubmitting}
							onClick={handleSubmit}
						>
							{isSubmitting ? (
								<div className="flex items-center justify-center space-x-2">
									<div className="h-4 w-4 border-2 border-white border-t-transparent animate-spin rounded-full" />
									<span className="text-regular font-semibold text-white">
										Updating...
									</span>
								</div>
							) : (
								<span className="text-regular font-semibold text-white">
									Update Profile
								</span>
							)}
						</Button>
					</form>
				</CardContent>
			</Card>

			<Successful
				text="User Edited"
				showModal={showModal}
				setShowModal={setShowModal}
			/>
		</div>
	);
};

export default EditUser;
