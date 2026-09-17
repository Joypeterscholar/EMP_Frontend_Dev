import React from "react";
import { NavLink } from "react-router-dom";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { getUserFromLocalStorage } from "../../redux/reducers/userReducer";
import WebIcon from "../../components/custom/WebIcons";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../../components/ui/tooltip";

const NavLinksNew = ({ collapsed }) => {
	const user = useSelector(memoize((state) => state.userState.user));
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

	let links = [
		{
			id: 1,
			url: `${
				["admin", "superAdmin"].includes(currentUser.role)
					? "/admin"
					: `/${currentUser.role}`
			}`,
			text: "Dashboard",
			icon: "activity",
		},
		{ id: 2, url: "models", text: "Facility Sections", icon: "report" },
		{ id: 3, url: "users", text: "Users", icon: "activity" },
		// { id: 4, url: "location", text: "Facility", icon: "facility" }, // removed from sidebar
		{ id: 6, url: "report", text: "Report", icon: "report" },
		{ id: 8, url: "feedback", text: "Feedback", icon: "clipboard" },
		{ id: 7, url: "trash", text: "Recycle Bin", icon: "settings" },
	];

	if (currentUser.role !== "superAdmin") {
		// For non-superAdmin roles (e.g. tagger, sampler), keep Dashboard and Report
		// but hide admin-only links like Users, Locations, and Trash.
		links = links.filter(
			(l) => !["users", "location", "trash", "/tagger"].includes(l.url)
		);
	}
	if (currentUser.role === "reviewer") {
		links = [
			{
				id: 1,
				url: `/${currentUser.role}`,
				text: "Dashboard",
				icon: "activity",
			},
			{ id: 6, url: "report", text: "Report", icon: "report" },
			{ id: 8, url: "feedback", text: "Feedback", icon: "clipboard" },
		];
	}

	if (collapsed) {
		return (
			<TooltipProvider>
				<div
					className="rounded-[100px] p-1.5 flex flex-col items-center gap-2"
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

					{links.map((l) => (
						<Tooltip key={l.id}>
							<TooltipTrigger asChild>
								<NavLink
									to={l.url}
									end
									className={({ isActive }) =>
										`relative z-10 flex items-center justify-center w-8 h-8 rounded-full transition-all duration-200 ${
											isActive
												? "bg-accentAlt"
												: "bg-white/5 hover:bg-accentAlt"
										}`
									}
								>
									{({ isActive }) => (
										<WebIcon
											icon={l.icon}
											className={`w-4 h-4 transition-all duration-200 ${
												isActive
													? "web-icon-accent"
													: "web-icon-white hover:web-icon-accent"
											}`}
										/>
									)}
								</NavLink>
							</TooltipTrigger>
							<TooltipContent
								side="right"
								className="bg-secondary text-white border-none shadow-lg"
							>
								<p>{l.text}</p>
							</TooltipContent>
						</Tooltip>
					))}
				</div>
			</TooltipProvider>
		);
	}

	return (
		<ul className="flex flex-col gap-1">
			{links.map((l) => (
				<li key={l.id}>
					<NavLink
						to={l.url}
						end
						className={({ isActive }) =>
							`group flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-colors ${
								isActive
									? "bg-accentAlt text-accent"
									: "text-white hover:bg-accentAlt hover:text-accent"
							}`
						}
					>
						{({ isActive }) => (
							<>
								<WebIcon
									icon={l.icon}
									className={`transition-all duration-200 ${
										isActive
											? "web-icon-accent"
											: "web-icon-white group-hover:web-icon-accent"
									}`}
								/>
								<span>{l.text}</span>
							</>
						)}
					</NavLink>
				</li>
			))}
		</ul>
	);
};

export default NavLinksNew;
