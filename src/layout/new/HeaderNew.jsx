import React from "react";
import { useSelector } from "react-redux";
import { useLocation } from "react-router-dom";
import { getUserFromLocalStorage } from "../../redux/reducers/userReducer";
import WebIcon from "../../components/custom/WebIcons";

const HeaderNew = () => {
	const user = useSelector((s) => s.userState.user);
	const currentUser = getUserFromLocalStorage() || user;
	const location = useLocation();

	// Derive page title from active route/segment (aligned with sidebar labels)
	const getPageTitle = () => {
		const pathname = location.pathname || "/";
		const lower = pathname.toLowerCase();
		const segmentToTitle = {
			models: "Facility Sections",
			users: "Users",
			location: "Facility",
			report: "Report",
			feedback: "Feedback",
			trash: "Recycle Bin",
		};

		// If landing on a role root (e.g., /admin, /tagger, /reviewer), show Dashboard
		if (/^\/(admin|tagger|reviewer)\/?$/.test(lower)) {
			return "Dashboard";
		}

		// Try to find a known segment in the path
		for (const [segment, title] of Object.entries(segmentToTitle)) {
			if (lower.includes(`/${segment}`)) return title;
		}

		// Default
		return "Dashboard";
	};

	return (
		<div
			className="h-20 flex items-center px-6 border-b-2 border-lightGrey bg-surface"
			style={{ boxShadow: "0 6px 24px rgba(0, 0, 0, 0.5)" }}
		>
			<div className="text-xl font-bold text-primary">{getPageTitle()}</div>
		</div>
	);
};

export default HeaderNew;
