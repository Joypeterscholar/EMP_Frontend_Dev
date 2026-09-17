import React from "react";
import { useSelector } from "react-redux";
import { useLoaderData, useNavigate } from "react-router-dom";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";

// Import shadcn components
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "../components/ui/avatar";
import GradientHeader from "../components/ui/GradientHeader";
import { getRealFileUrl } from "@/utils";

// default avatar
const defaultAvatar = "https://cdn-icons-png.flaticon.com/512/3177/3177440.png";

const UserProfile = () => {
	const { user } = useLoaderData();
	const navigate = useNavigate();
	const user_one = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user_one;

	const formatJoined = (dateStr) => {
		try {
			const d = new Date(dateStr || user.createdAt);
			return d.toLocaleDateString("en-GB", {
				day: "2-digit",
				month: "long",
				year: "numeric",
			});
		} catch {
			return "";
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white p-4 md:p-8">
			<GradientHeader />
			<Card className="mx-auto max-w-sm border-none shadow-xl -mt-24 relative z-10 rounded-3xl bg-white">
				<CardContent className="p-6 md:p-10 text-center">
					{/* Column layout */}
					<div className="flex flex-col items-center">
						{/* Avatar */}
						<div className="mb-4">
							<Avatar className="h-28 w-28">
								<AvatarImage
									src={getRealFileUrl(user.imageUrl) || defaultAvatar}
									alt={user.fullname || user.username}
									className="object-cover"
								/>
								<AvatarFallback className="bg-primary/5">
									<img
										src={defaultAvatar}
										alt="default profile"
										className="h-full w-full object-cover"
									/>
								</AvatarFallback>
							</Avatar>
						</div>

						{/* Name */}
						<h2 className="heading-large font-bold tracking-tight text-primary">
							{user.fullname || user.username}
						</h2>

						{/* Role pill */}
						<div className="mt-2 mb-5">
							<span className="inline-flex items-center justify-center px-4 py-1 rounded-full bg-gray-100 text-secondaryAlt text-regular">
								{user.role}
							</span>
						</div>

						{/* Info rows label : data */}
						<div className="w-full max-w-xs space-y-3">
							<div className="flex items-center justify-between">
								<span className=" text-bold font-bold text-primary">
									Role:
								</span>
								<span className="text-bold font-normal text-primary">
									{user.role}
								</span>
							</div>
							<div className="flex items-center justify-between">
								<span className="text-bold font-bold text-primary">
									Joined:
								</span>
								<span className="text-bold font-normal text-primary">
									{formatJoined(user.createdAt)}
								</span>
							</div>
							{user.email && (
								<div className="flex items-center justify-between">
									<span className="text-bold font-bold text-primary">
										Email:
									</span>
									<span className="text-bold font-normal text-primary">
										{user.email}
									</span>
								</div>
							)}
						</div>

						{/* Edit button (only for self and non-tagger roles) */}
						{user._id === currentUser._id && currentUser.role !== "tagger" && (
							<div className="mt-6">
								<Button
									className="w-full text-regular font-semibold bg-primary hover:bg-secondaryAlt text-white transition-colors rounded-2xl"
									onClick={() =>
										navigate(
											`/${
												["admin", "superAdmin"].includes(
													currentUser.role
												)
													? "admin"
													: currentUser.role
											}/edit-user/${currentUser._id}`
										)
									}
								>
									Edit Profile
								</Button>
							</div>
						)}
					</div>
				</CardContent>
			</Card>
		</div>
	);
};

export default UserProfile;
