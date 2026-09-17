import OverviewSection from "../../components/ui/overview-section";
import StatsCard from "../../components/ui/stats-card";

const LocationOverview = ({ locationData }) => {
	// Calculate stats
	const totalLocations = locationData?.totalLocations || 0;
	const activeLocations = locationData?.activeLocations || 0;
	const totalFacilities = locationData?.totalFacilities || 0;

	const statsCards = [
		{
			title: "Total Locations",
			count: totalLocations,
			trend: "+12%",
			trendLabel: "vs last month",
			chartData: [25, 32, 28, 35, 30, 38, 35],
			icon: "activity",
			iconBgColor: "bg-blue-100",
			iconColor: "text-blue-600",
			trendColor: "text-green-500",
		},
		{
			title: "Active Locations",
			count: activeLocations,
			trend: "+8%",
			trendLabel: "vs last month",
			chartData: [18, 24, 20, 28, 25, 30, 28],
			icon: "facility",
			iconBgColor: "bg-green-100",
			iconColor: "text-green-600",
			trendColor: "text-green-500",
		},
		{
			title: "Total Facilities",
			count: totalFacilities,
			trend: "+15%",
			trendLabel: "vs last month",
			chartData: [30, 38, 35, 42, 40, 45, 42],
			icon: "activity",
			iconBgColor: "bg-purple-100",
			iconColor: "text-purple-600",
			trendColor: "text-green-500",
		},
	];

	return (
		<OverviewSection
			title="Location Management"
			welcomeMessage="Manage and monitor all facility locations"
			statsCards={statsCards}
			filters={[]}
		/>
	);
};

export default LocationOverview;
