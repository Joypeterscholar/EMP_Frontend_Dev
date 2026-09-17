import React from "react";
import { useNavigate } from "react-router-dom";
import OverviewSection from "../../components/ui/overview-section";

const ReportOverview = ({ reportData }) => {
	const navigate = useNavigate();

	const {
		totalReports = 0,
		sampleReports = 0,
		incidentReports = 0,
		approvedReports = 0,
	} = reportData;

	// Report-specific stats cards
	const statsCards = [
		{
			icon: "clipboard", // Using your WebIcon system
			title: "Total Reports",
			count: totalReports,
			trend: "+34",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-purple-100",
			iconColor: "text-purple-600",
			trendColor: "text-green-500",
		},
		{
			icon: "activity",
			title: "Sample Reports",
			count: sampleReports,
			trend: "+0",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-blue-100",
			iconColor: "text-blue-600",
			trendColor: "text-red-500",
			onClick: () => navigate("reports?type=sample"),
			isClickable: true,
		},
		{
			icon: "report",
			title: "Incident Reports",
			count: incidentReports,
			trend: "+200",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-green-100",
			iconColor: "text-green-600",
			trendColor: "text-green-500",
			onClick: () => navigate("reports?type=incident"),
			isClickable: true,
		},
		{
			icon: "check_clipboard",
			title: "Approved Reports",
			count: approvedReports,
			trend: "+1",
			trendLabel: "to last month",
			chartData: [],
			iconBgColor: "bg-orange-100",
			iconColor: "text-orange-600",
			trendColor: "text-red-500",
			onClick: () => navigate("reports?status=approved"),
			isClickable: true,
		},
	];

	// Standard filter configuration - consistent across all pages
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
			title="Report Overview"
			welcomeMessage="Take a look at all the reports that you have submitted so far."
			filters={filters}
			statsCards={statsCards}
		/>
	);
};

export default ReportOverview;
