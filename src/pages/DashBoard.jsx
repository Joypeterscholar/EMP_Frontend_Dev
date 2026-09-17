/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { ChartBox, ModelList, PieChartBox } from "../components";
import "../styles/DashBoard.css";
import { customFetch } from "../utils";
import { useLoaderData, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import SampleChart from "../components/SampleChart";
import LineChart from "../components/LineChart";
import BarChart from "../components/BarChart";
import { DashboardCard } from "../components/DashboardCard";
import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "../components/ui/tooltip";

const url = "/user/dashboard";

const userQuery = {
	queryKey: ["dashboard"],
	queryFn: () => customFetch(url),
};

// eslint-disable-next-line react-refresh/only-export-components
export const loader = (queryClient) => async () => {
	const response = await queryClient.ensureQueryData(userQuery);
	const items = response.data;
	if (response?.data.status === "error") {
		toast.error(response?.data.message);
	}
	return { items };
};

const DashBoard = () => {
	const navigate = useNavigate();
	const { items } = useLoaderData() || {};
	const [activeItem, setActiveItem] = useState("Overview");
	// Seed initial state from loader data so we don't refetch on first paint
	const [item, setItem] = useState(items || null);
	const [isLoading, setIsLoading] = useState(!items);
	const [error, setError] = useState("");

	const fetchData = async () => {
		try {
			setIsLoading(true);
			const response = await customFetch(url);

			if (response.data?.status !== "error") {
				setItem(response.data || {});
				setError("");
			} else {
				const message =
					response.data?.message || "Unable to load dashboard data.";
				setError(message);
				toast.error(message);
			}
		} catch (err) {
			console.error("Error loading dashboard:", err);
			const message =
				err?.response?.data?.message ||
				"Unable to load dashboard data. Please try again.";
			setError(message);
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	useEffect(() => {
		// If loader already gave us data, just stop loading; otherwise fetch
		if (items) {
			setIsLoading(false);
			setItem(items || {});
		} else {
			fetchData();
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [items]);

	const handleItemClick = (item) => {
		setActiveItem(item);
	};

	if (isLoading) {
		return (
			<div className="flex flex-1 items-center justify-center p-5">
				<p className="text-gray-500 text-sm">Loading dashboard...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex flex-1 items-center justify-center p-5">
				<p className="text-red-500 text-sm text-center max-w-md">
					{error}
				</p>
			</div>
		);
	}

	if (!item) {
		return (
			<div className="flex flex-1 items-center justify-center p-5">
				<p className="text-gray-500 text-sm text-center">
					No dashboard data available yet.
				</p>
			</div>
		);
	}

	const {
		tagsThisMonth = 0,
		tagsLastMonth = 0,
		totalTagsThisMonth = 0,
		positivityRateThisMonth = 0,
		positiveTagsThisMonth = 0,
		tagsYearToDate = 0,
		positivityRateYearToDate = 0,
		positivityRatePerMonthYearToDate = [],
		totalReviewers = 0,
		totalTaggers = 0,
		totalModels = 0,
		todaysModels = 0,
		modelsInEachLocation = [],
		TotalTagsBySampleAndDay: dailyData = [],
		TotalTagsBySampleAndMonth: monthlyData = [],
		recentModels = [],
	} = item || {};

	const dailyModels = {
		title: "Today(s) Facilities",
		number: `${todaysModels}`,
	};
	const totalModel = {
		title: "Total Facilities",
		number: `${totalModels}`,
	};
	const taggers = {
		title: "Samplers",
		number: `${totalTaggers}`,
	};
	const reviewers = {
		title: "Reviewers",
		number: `${totalReviewers}`,
	};
	const barChartSampleType = {
		daily: "Daily samples",
		monthly: "Monthly samples",
		title: "Overview",
		color: "#5EA33E",
		alt: "No Recent Samples",
		data: {
			dailyData,
			monthlyData,
		},
	};
	const barChartIncidentType = {
		daily: "Daily Incidents",
		monthly: "Monthly Incidents",
		title: "Overview",
		color: "#e38557",
		alt: "No Recent Incident",
		data: {
			dailyData: item.TotalIncidentsByDay,
			monthlyData: item.TotalIncidentsByMonth,
		},
	};

	const getRandomColor = () => {
		const letters = "0123456789ABCDEF";
		let color = "#";
		for (let i = 0; i < 6; i++) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	};

	// hack
	const data = (modelsInEachLocation || []).map((item) => ({
		...item,
		name: item.locationName,
		value: item.totalModels,
		color: getRandomColor(),
	}));

	return (
		<TooltipProvider>
			<div className="flex flex-col flex-grow p-5 w-auto">
				{/* Navigation */}
				<div className="flex justify-center items-center mb-16">
					<div className="flex gap-4 justify-center items-center px-4 py-1 rounded-full bg-slate-300">
						{["Overview", "Sample", "Incident", "Activity"].map(
							(item) => (
								<button
									key={item}
									className={`
                px-5 max-sm:px-3 py-1 rounded-full cursor-pointer font-bold
                transition-all duration-200
                ${
							activeItem === item
								? "text-white bg-black"
								: "hover:bg-black/10"
						}
              `}
									onClick={() => handleItemClick(item)}
								>
									{item}
								</button>
							)
						)}
					</div>
				</div>

				{/* Overview Section */}
				{activeItem === "Overview" && (
					<div className="flex flex-col gap-4 justify-center items-center w-full">
						{/* First Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Positivity Rate Year To Date"
											bgColor="bg-[#333fc5]"
											className="text-white"
										>
											<ChartBox
												number={returnNumberOrZero(
													parseFloat(
														positivityRateYearToDate
													).toFixed(2)
												)}
												bg="text"
											/>
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Positivity Rate (YTD)
										</p>
										<p className="text-gray-300 text-xs">
											Value:{" "}
											{returnNumberOrZero(
												parseFloat(
													positivityRateYearToDate
												).toFixed(2)
											)}
											%
										</p>
										<p className="text-gray-300 text-xs">
											Overall positivity rate for samples collected
											this year
										</p>
									</div>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard title="Positivity Rate This Month">
											<ChartBox
												number={returnNumberOrZero(
													parseFloat(
														positivityRateThisMonth
													).toFixed(2)
												)}
											/>
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Monthly Positivity Rate
										</p>
										<p className="text-gray-300 text-xs">
											Value:{" "}
											{returnNumberOrZero(
												parseFloat(positivityRateThisMonth).toFixed(
													2
												)
											)}
											%
										</p>
										<p className="text-gray-300 text-xs">
											Current month's sample positivity rate
										</p>
									</div>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Positive Samples This Month"
											bgColor="bg-[#746c6c]"
											className="text-white"
										>
											<ChartBox number={positiveTagsThisMonth} />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Positive Samples
										</p>
										<p className="text-gray-300 text-xs">
											Count: {positiveTagsThisMonth}
										</p>
										<p className="text-gray-300 text-xs">
											Number of positive samples detected this month
										</p>
									</div>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Total Samples This Month"
											bgColor="bg-[#5EA33E]"
											className="text-white"
										>
											<ChartBox number={totalTagsThisMonth} />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Total Samples
										</p>
										<p className="text-gray-300 text-xs">
											Count: {totalTagsThisMonth}
										</p>
										<p className="text-gray-300 text-xs">
											Total number of samples collected this month
										</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>

						{/* Second Row */}
						<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Today's Facilities"
											bgColor="bg-[#746c6c]"
											className="text-white"
											onClick={() => navigate("models")}
											isClickable
										>
											<ChartBox {...dailyModels} />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Today's Facilities
										</p>
										<p className="text-gray-300 text-xs">
											Count: {todaysModels}
										</p>
										<p className="text-gray-300 text-xs">
											Number of facilities processed today
										</p>
									</div>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Total Facilities"
											bgColor="bg-[#5EA33E]"
											className="text-white"
											onClick={() => navigate("models")}
											isClickable
										>
											<ChartBox {...totalModel} />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Total Facilities
										</p>
										<p className="text-gray-300 text-xs">
											Count: {totalModels}
										</p>
										<p className="text-gray-300 text-xs">
											Total number of facilities in the system
										</p>
									</div>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Samplers"
											onClick={() => navigate("users")}
											isClickable
										>
											<ChartBox {...taggers} />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">Samplers</p>
										<p className="text-gray-300 text-xs">
											Count: {totalTaggers}
										</p>
										<p className="text-gray-300 text-xs">
											Total number of active samplers
										</p>
									</div>
								</TooltipContent>
							</Tooltip>

							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard
											title="Reviewers"
											bgColor="bg-[#333fc5]"
											className="text-white"
											onClick={() => navigate("users")}
											isClickable
										>
											<ChartBox {...reviewers} bg="text" />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">Reviewers</p>
										<p className="text-gray-300 text-xs">
											Count: {totalReviewers}
										</p>
										<p className="text-gray-300 text-xs">
											Total number of active reviewers
										</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>

						{/* Pie Chart */}
						<div className="w-full">
							<Tooltip>
								<TooltipTrigger asChild>
									<div>
										<DashboardCard title="Location Distribution">
											<PieChartBox data={data} />
										</DashboardCard>
									</div>
								</TooltipTrigger>
								<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
									<div className="flex flex-col gap-1">
										<p className="font-semibold text-sm">
											Location Distribution
										</p>
										<p className="text-gray-300 text-xs">
											Total Locations: {data.length}
										</p>
										<p className="text-gray-300 text-xs">
											Distribution of facilities across different
											locations
										</p>
									</div>
								</TooltipContent>
							</Tooltip>
						</div>
					</div>
				)}

				{/* Sample Section */}
				{activeItem === "Sample" && (
					<div className="space-y-4">
						<DashboardCard title="Sample Charts">
							<div className="h-[600px]">
								<SampleChart barChartSampleType={barChartSampleType} />
							</div>
						</DashboardCard>

						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DashboardCard title="Samples This Month">
										<div className="h-[600px]">
											<BarChart
												barDataKey="count"
												xAxisKey="_id"
												barColor="#8884d8"
												data={[{ count: tagsThisMonth }]}
											/>
										</div>
									</DashboardCard>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
								<div className="flex flex-col gap-1">
									<p className="font-semibold text-sm">
										Current Month Samples
									</p>
									<p className="text-gray-300 text-xs">
										Sample distribution for the current month
									</p>
								</div>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DashboardCard title="Samples Last Month">
										<div className="h-[600px]">
											<BarChart
												barDataKey="count"
												xAxisKey="_id"
												barColor="#8884d8"
												data={[{ count: tagsLastMonth }]}
											/>
										</div>
									</DashboardCard>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
								<div className="flex flex-col gap-1">
									<p className="font-semibold text-sm">
										Last Month Samples
									</p>
									<p className="text-gray-300 text-xs">
										Sample distribution for the previous month
									</p>
								</div>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DashboardCard title="Samples Year to Date">
										<div className="h-[600px]">
											<BarChart
												barDataKey="count"
												xAxisKey="_id"
												barColor="#8884d8"
												data={[{ count: tagsYearToDate }]}
											/>
										</div>
									</DashboardCard>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
								<div className="flex flex-col gap-1">
									<p className="font-semibold text-sm">
										Year to Date Samples
									</p>
									<p className="text-gray-300 text-xs">
										Total sample distribution for the current year
									</p>
								</div>
							</TooltipContent>
						</Tooltip>

						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DashboardCard title="Positivity Rate Per Month">
										<div className="h-[600px]">
											<LineChart
												lineDataKey="positivityRate"
												xAxisKey="month"
												lineColor="#000000"
												data={positivityRatePerMonthYearToDate?.map(
													(rate) => ({
														...rate,
														positivityRate:
															(rate.positivityRate || 0) * 100,
														month: getMonthName(rate.month),
													})
												)}
											/>
										</div>
									</DashboardCard>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
								<div className="flex flex-col gap-1">
									<p className="font-semibold text-sm">
										Monthly Positivity Rates
									</p>
									<p className="text-gray-300 text-xs">
										Trend of positivity rates across months
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</div>
				)}

				{/* Incident Section */}
				{activeItem === "Incident" && (
					<section className="flex flex-col gap-4 justify-center items-center w-full h-full">
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DashboardCard title="Incident Overview">
										<div className="h-[600px]">
											<SampleChart
												barChartSampleType={barChartIncidentType}
											/>
										</div>
									</DashboardCard>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
								<div className="flex flex-col gap-1">
									<p className="font-semibold text-sm">
										Incident Overview
									</p>
									<p className="text-gray-300 text-xs">
										Daily and monthly incident distribution
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</section>
				)}

				{/* Activity Section */}
				{activeItem === "Activity" && (
					<section className="flex flex-col gap-4 justify-center items-center w-full h-full">
						<Tooltip>
							<TooltipTrigger asChild>
								<div>
									<DashboardCard title="Recently Uploaded Facility Sections">
										<div className="max-h-[600px] w-full overflow-y-auto pr-1">
											<ModelList
												text="Recently Uploaded Facility Sections"
												users={recentModels}
											/>
										</div>
									</DashboardCard>
								</div>
							</TooltipTrigger>
							<TooltipContent className="bg-black text-white border border-gray-600 p-3 rounded-lg shadow-lg">
								<div className="flex flex-col gap-1">
									<p className="font-semibold text-sm">
										Recent Uploads
									</p>
									<p className="text-gray-300 text-xs">
										List of recently uploaded facility sections
									</p>
								</div>
							</TooltipContent>
						</Tooltip>
					</section>
				)}
			</div>
		</TooltipProvider>
	);
};

function returnNumberOrZero(value) {
	if (typeof Number(value) === "number" && value !== "NaN") return value;
	return 0;
}

function getMonthName(monthNumber) {
	const months = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	if (typeof monthNumber !== "number") {
		return "Invalid input. Please provide a number between 1 and 12.";
	}

	return months[(monthNumber - 1) % (months.length - 1)];
}

export default DashBoard;
