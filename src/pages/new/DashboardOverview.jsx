import React from "react";
import { useNavigate } from "react-router-dom";
import OverviewSection from "../../components/ui/overview-section";

const DashboardOverview = ({ dashboardData }) => {
	const navigate = useNavigate();

	const {
		totalTagsThisMonth = 0,
		totalModels = 0,
		totalReviewers = 0,
		totalTaggers = 0,
		todaysModels = 0,
	} = dashboardData;

	const statsCards = [
		{
			icon: "activity",
			title: "Total Tags This Month",
			count: totalTagsThisMonth,
			trend: "+1",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-purple-100",
			iconColor: "text-purple-600",
			trendColor: "text-red-500",
		},
		{
			icon: "facility",
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
			icon: "activity",
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
			icon: "activity",
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

	// Filter configuration - calendar icon is now hardcoded in overview-section
	const filters = [
		{
			label: "Start Date",
			showDropdown: true,
			onClick: () => console.log("Start Date clicked"),
		},
		{
			label: "End Date",
			showDropdown: true,
			onClick: () => console.log("End Date clicked"),
		},
		{
			label: "Monthly",
			showDropdown: true,
			onClick: () => console.log("Monthly clicked"),
		},
	];

	return (
		<OverviewSection
			title="Welcome back!"
			welcomeMessage="Here's a quick look at your recent activity and ongoing tasks."
			filters={filters}
			statsCards={statsCards}
		/>
	);
};

export default DashboardOverview;
