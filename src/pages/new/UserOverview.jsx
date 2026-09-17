import React from "react";
import { useNavigate } from "react-router-dom";
import OverviewSection from "../../components/ui/overview-section";

// A slim header for the Users page showing only the "Total Users" card
const UserOverview = ({ dashboardData }) => {
	const navigate = useNavigate();

	const {
		totalTagsThisMonth = 0,
		totalModels = 0,
		totalReviewers = 0,
		totalTaggers = 0,
		todaysModels = 0,
	} = dashboardData || {};

	// Only one card: Total Users
	const statsCards = [
		// -------------------------- user profile overview card --------------------------
		{
			icon: "user_icon",
			title: "Total Users",
			count: totalTagsThisMonth,
			trend: "+1",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-purple-100",
			iconColor: "text-purple-600",
			trendColor: "text-red-500",
		},
		{
			icon: "tagger",
			title: "Total Facilities",
			count: totalModels,
			trend: "+34",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-blue-100",
			iconColor: "text-blue-600",
			trendColor: "text-green-500",
			onClick: () => navigate("models"),
			isClickable: true,
		},
		{
			icon: "inactive_users",
			title: "Total Reviewers",
			count: totalReviewers,
			trend: "+200",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-green-100",
			iconColor: "text-green-600",
			trendColor: "text-green-500",
			onClick: () => navigate("users"),
			isClickable: true,
		},
		{
			icon: "new_tagger",
			title: "Total Samplers",
			count: totalTaggers,
			trend: "+0",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-orange-100",
			iconColor: "text-orange-600",
			trendColor: "text-red-500",
			onClick: () => navigate("users"),
			isClickable: true,
		},
	];

	// Keep filters consistent with other headers for layout
	const filters = [
		{ label: "Start Date", showDropdown: true, onClick: () => {} },
		{ label: "End Date", showDropdown: true, onClick: () => {} },
		{ label: "Monthly", showDropdown: true, onClick: () => {} },
	];

	return (
		<OverviewSection
			title="Welcome back"
			welcomeMessage="Here's a quick look at all the users."
			filters={filters}
			statsCards={statsCards}
		/>
	);
};

export default UserOverview;
