// eslint-disable-next-line no-unused-vars
import React from "react";
import { NavLink } from "react-router-dom";
import "../styles/menu.css";
import { useSelector } from "react-redux";
import { memoize } from "proxy-memoize";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import {
	Tooltip,
	TooltipContent,
	TooltipTrigger,
	TooltipProvider,
} from "./ui/tooltip";
import { useQuery } from "@tanstack/react-query";
import { customFetch } from "../utils";

// eslint-disable-next-line react-refresh/only-export-components

const NavLinks = () => {
	const user = useSelector(memoize((state) => state.userState.user));
	const localUser = getUserFromLocalStorage();
	const currentUser = localUser || user;

	// We can keep the query to check if we have any completed models
	const { data: completedModelsData } = useQuery({
		queryKey: ["completedModels"],
		queryFn: async () => {
			const response = await customFetch("/model/get-models");
			if (response.data.status !== "error") {
				return (response.data.data || []).filter((item) => item.isComplete);
			}
			return [];
		},
	});

	const completedModelsCount = completedModelsData?.length || 0;

	let links = [
		{
			id: 1,
			url: `${
				["admin", "superAdmin"].includes(currentUser.role)
					? "/admin"
					: `/${currentUser.role}`
			}`,
			text: "Dashboard",
		},
		{ id: 2, url: "models", text: "Facility Sections" },
		{ id: 3, url: "users", text: "Users" },
		// { id: 4, url: 'location', text: 'Facility' }, // removed from sidebar for admin
		// { id: 5, url: 'form-features', text: 'Form Features' },
		{ id: 6, url: "report", text: "Report" },
		{ id: 9, url: "feedback", text: "Feedback" },
		{ id: 7, url: "trash", text: "Recycle Bin" },
	];

	// Add the Completed Models link if there are any completed models
	if (completedModelsCount > 0) {
		links.push({
			id: 8,
			url: "models/?type=completed",
			text: "Complete Facility",
		});
	}

	if (currentUser.role !== "superAdmin") {
		// remove users and location links as only superAdmin can have access to those
		links = links.filter(
			(link) => !["users", "location", "trash", "/tagger"].includes(link.url)
		);
	}

	if (currentUser.role === "reviewer") {
		links = [
			{ id: 1, url: "report", text: "Report" },
			{ id: 9, url: "feedback", text: "Feedback" },
		];
	}

	return (
		<TooltipProvider>
			{links.map((link, index) => {
				const { url, text } = link;
				return (
					<li key={index}>
						<Tooltip>
							<TooltipTrigger asChild>
								<NavLink
									className={({ isActive }) =>
										`listItem overflow-hidden text-ellipsis truncate max-w-[150px] block ${
											isActive ? "active font-bold text-white" : ""
										}`
									}
									end
									to={url}
								>
									{text}
								</NavLink>
							</TooltipTrigger>
							<TooltipContent>
								<p>{text}</p>
							</TooltipContent>
						</Tooltip>
					</li>
				);
			})}
		</TooltipProvider>
	);
};

export default NavLinks;
