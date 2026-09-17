import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { getUserFromLocalStorage } from "../../redux/reducers/userReducer";
import { logoutUser } from "../../redux/actions/userActions";
import WebIcon from "../../components/custom/WebIcons";

const SidebarFooter = ({ collapsed }) => {
	const user = useSelector((s) => s.userState.user);
	const currentUser = getUserFromLocalStorage() || user;
	const [activeIcon, setActiveIcon] = useState(null);
	const dispatch = useDispatch();
	const navigate = useNavigate();

	const handleLogout = () => {
		dispatch(logoutUser());
		navigate("/login");
	};

	const handleIconClick = (iconId) => {
		if (iconId === "logout") {
			handleLogout();
		} else {
			setActiveIcon(iconId);
		}
	};

	const handleProfileClick = () => {
		const baseRole = ["admin", "superAdmin"].includes(currentUser.role)
			? "admin"
			: currentUser.role;
		navigate(`/${baseRole}/single-user/${currentUser._id}`);
	};

	const footerIcons = [
		// { id: "activity", icon: "activity" },
		// { id: "settings", icon: "settings" },
		{ id: "logout", icon: "logout" },
	];

	return (
		<div className="px-3 pb-4">
			<div
				className="w-12 rounded-[100px] p-2 flex flex-col items-center gap-3"
				style={{
					background: "rgba(255, 255, 255, 0.05)",
					backdropFilter: "blur(20px)",
					WebkitBackdropFilter: "blur(20px)",
					border: "1px solid rgba(255, 255, 255, 0.1)",
					boxShadow:
						"0 8px 32px 0 rgba(0, 0, 0, 0.37), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)",
				}}
			>
				{/* Subtle gradient overlay for depth */}
				<div
					className="absolute inset-0 opacity-50 rounded-[100px]"
					style={{
						background:
							"linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.02) 100%)",
					}}
				></div>

				{/* Profile Image */}
				<div
					className="relative z-10 w-8 h-8 rounded-full overflow-hidden ring-2 ring-white/10 flex-shrink-0 cursor-pointer"
					onClick={handleProfileClick}
					aria-label="View profile"
				>
					<img
						src={currentUser?.imageUrl || "/img/avatar_male.png"}
						alt="Profile"
						className="w-full h-full object-cover"
					/>
				</div>

				{/* Action Buttons */}
				<div className="relative z-10 flex flex-col gap-3">
					{footerIcons.map((item) => (
						<button
							key={item.id}
							onClick={() => handleIconClick(item.id)}
							className={`flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
								activeIcon === item.id
									? "bg-accentAlt"
									: "bg-white/5 hover:bg-accentAlt"
							}`}
						>
							<WebIcon
								icon={item.icon}
								className={`w-5 h-5 transition-all duration-200 ${
									activeIcon === item.id
										? "web-icon-accent"
										: "web-icon-white hover:web-icon-accent"
								}`}
							/>
						</button>
					))}
				</div>
			</div>
		</div>
	);
};

export default SidebarFooter;
