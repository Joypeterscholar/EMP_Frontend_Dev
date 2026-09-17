// eslint-disable-next-line no-unused-vars
import React, { useState } from "react";
import BarChart from "./BarChart";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "./ui/select";

const SampleBarChart = ({ barChartSampleType }) => {
	const [selectedData, setSelectedData] = useState("dailyData");
	const keysArray =
		barChartSampleType?.data && barChartSampleType.data[selectedData]
			? Object.keys(barChartSampleType.data[selectedData])[0]
			: "";
	const [selectedSampleType, setSelectedSampleType] = useState(keysArray);
	const getDayOfWeekName = (dayNumber) => {
		const daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
		return daysOfWeek[dayNumber - 1];
	};

	const getMonthName = (monthNumber) => {
		const months = [
			"Jan",
			"Feb",
			"Mar",
			"Apr",
			"May",
			"Jun",
			"Jul",
			"Aug",
			"Sep",
			"Oct",
			"Nov",
			"Dec",
		];
		return months[monthNumber - 1];
	};

	// Event handlers removed - using onValueChange directly in Select components

	const isDaily = selectedData === "dailyData";
	const data =
		barChartSampleType?.data &&
		barChartSampleType.data[selectedData] &&
		barChartSampleType.data[selectedData][selectedSampleType]
			? barChartSampleType.data[selectedData][selectedSampleType].map(
					(item, i) => ({
						...item,
						label: isDaily
							? getDayOfWeekName(item.dayOfWeek)
							: getMonthName(item.month),
						key: isDaily
							? `day_${item.dayOfWeek}_${i}`
							: `month_${item.month}_${i}`,
					})
			  )
			: [];

	return (
		<div className="flex flex-col flex-grow gap-5 justify-start items-start p-2 w-full h-auto">
			<div className="flex flex-row justify-between items-center w-full">
				<div className="justify-center items-center font-bold">
					{barChartSampleType.title}
				</div>
				<div className="flex gap-3 justify-center items-center">
					<Select
						value={selectedSampleType}
						onValueChange={setSelectedSampleType}
					>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select sample type" />
						</SelectTrigger>
						<SelectContent className="z-[100000]">
							{barChartSampleType?.data[selectedData] &&
								Object.keys(barChartSampleType.data[selectedData]).map(
									(type, i) => (
										<SelectItem
											key={i}
											value={type}
											className="capitalize"
										>
											{type}
										</SelectItem>
									)
								)}
						</SelectContent>
					</Select>
					<Select value={selectedData} onValueChange={setSelectedData}>
						<SelectTrigger className="w-[180px]">
							<SelectValue placeholder="Select data type" />
						</SelectTrigger>
						<SelectContent className="z-[100000]">
							<SelectItem value="dailyData">
								{barChartSampleType.daily}
							</SelectItem>
							<SelectItem value="monthlyData">
								{barChartSampleType.monthly}
							</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>
			<div className="block w-full h-full">
				{data && data.length > 0 ? (
					<BarChart
						barDataKey="totalTags"
						xAxisKey="label"
						barColor="#8884d8"
						data={data}
					/>
				) : (
					<div className="flex justify-center items-center h-full font-bold capitalize">
						{barChartSampleType?.alt}
					</div>
				)}
			</div>
		</div>
	);
};

export default SampleBarChart;
