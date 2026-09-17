import React from "react";
import StatsCard from "./stats-card";
import WebIcon from "../custom/WebIcons";

const OverviewSection = ({
	// Header content
	title = "Overview",
	subtitle = "",
	welcomeMessage = "",

	// Filter controls
	filters = [],

	// Stats cards
	statsCards = [],

	// Layout options
	className = "",
}) => {
	return (
		<div className={`flex flex-col gap-2 sm:gap-3 md:gap-4 p-1 sm:p-2 md:p-3 ${className}`}>
			{/* Welcome Section - only show if welcomeMessage is provided */}
			{welcomeMessage && (
				<div className="mb-1 sm:mb-2">
					<h1 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary mb-1 sm:mb-2">
						{title}
					</h1>
					<p className="text-sm sm:text-base text-black font-normal">
						{welcomeMessage}
					</p>
				</div>
			)}

			{/* Overview Heading and Filters */}
			{!welcomeMessage && (
				<div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2">
					<h2 className="text-lg sm:text-xl md:text-2xl font-bold text-primary">
						{title}
					</h2>

					{/* Filters removed as requested */}
				</div>
			)}

			{/* Stats Cards Grid */}
			{statsCards.length > 0 && (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-3">
					{statsCards.map((card, index) => (
						<StatsCard key={index} {...card} />
					))}
				</div>
			)}
		</div>
	);
};

export default OverviewSection;
