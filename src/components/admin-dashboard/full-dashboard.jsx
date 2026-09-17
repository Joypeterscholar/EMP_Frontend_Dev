import React, { useMemo, useState, useEffect } from "react";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import WebIcon from "../custom/WebIcons";
import { customFetch } from "../../utils";
import { toast } from "react-toastify";

/* ---------------- Colors ---------------- */
const BASE_PALETTE = [
	"#7E45D3",
	"#412461",
	"#D1B1F4",
	"#F472B6",
	"#34D399",
	"#60A5FA",
	"#F59E0B",
	"#10B981",
	"#EF4444",
	"#6366F1",
];

const buildPaletteMap = (keys = []) => {
	const map = new Map();
	keys.forEach((k, i) => map.set(k, BASE_PALETTE[i % BASE_PALETTE.length]));
	return map;
};

/* ---------------- Helpers ---------------- */
const formatNumberLabel = (n) => (n >= 1000 ? n.toLocaleString() : n);

/* ---------------- Donut Tooltip ---------------- */
const DonutTooltip = ({ active, payload }) => {
	if (!active || !payload?.length) return null;
	const p = payload[0].payload; // { name, value, color }
	return (
		<div
			className="bg-white p-3 rounded-lg shadow-lg border border-gray-100 text-xs"
			style={{ minWidth: 160 }}
		>
			<div className="flex items-center gap-2">
				<div
					style={{
						width: 10,
						height: 10,
						borderRadius: 6,
						background: p.color,
					}}
				/>
				<div className="text-sm font-semibold text-gray-800">{p.name}</div>
			</div>
			<div className="text-gray-600 mt-2">
				Value:{" "}
				<span className="font-semibold">{formatNumberLabel(p.value)}</span>
			</div>
		</div>
	);
};

/* ---------------- Left Donut Tooltip (with model names) ---------------- */
const LeftDonutTooltip = ({ active, payload }) => {
	if (!active || !payload?.length) return null;
	const p = payload[0].payload; // { name, value, color, modelNames }
	const modelNames = Array.isArray(p.modelNames) ? p.modelNames : [];
	const preview = modelNames.slice(0, 10);
	const remaining = Math.max(0, modelNames.length - preview.length);
	return (
		<div
			className="bg-white opacity-100 z-50 p-3 rounded-lg shadow-xl border border-gray-200 text-xs"
			style={{ minWidth: 240, maxWidth: 360, backgroundColor: "#ffffff" }}
		>
			<div className="flex items-center justify-between gap-2 mb-2">
				<div className="flex items-center gap-2">
					<div
						style={{
							width: 10,
							height: 10,
							borderRadius: 6,
							background: p.color,
						}}
					/>
					<div className="text-sm font-semibold text-gray-800">
						{p.name}
					</div>
				</div>
				<div className="text-gray-600">
					Total:{" "}
					<span className="font-semibold">
						{formatNumberLabel(p.value)}
					</span>
				</div>
			</div>
			{preview.length > 0 && (
				<div className="mt-2 pt-2 border-t border-gray-200">
					<div className="text-xs font-semibold text-gray-700 mb-2">
						Facility Sections
					</div>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 max-h-48 overflow-y-auto pr-1">
						{preview.map((modelName, idx) => (
							<div
								key={idx}
								className="flex items-start gap-2 text-[11px] text-gray-700"
							>
								<span className="mt-1 block w-1.5 h-1.5 rounded-full bg-gray-300" />
								<span className="leading-snug">{modelName}</span>
							</div>
						))}
					</div>
					{remaining > 0 && (
						<div className="text-[11px] text-gray-500 mt-2">
							+{remaining} more…
						</div>
					)}
				</div>
			)}
		</div>
	);
};

/* ---------------- FullDashboard ---------------- */
const FullDashboard = ({ dashboardData = {} }) => {
	// Right side (Donut chart) state
	const [rightFilterType, setRightFilterType] = useState("All");
	const [showRightFilterDropdown, setShowRightFilterDropdown] =
		useState(false);

	// All models for left donut aggregation
	const [allModels, setAllModels] = useState([]);

	useEffect(() => {
		let isMounted = true;
		(async () => {
			try {
				const res = await customFetch("/model/get-models");
				const list = Array.isArray(res?.data?.data) ? res.data.data : [];
				if (isMounted) {
					setAllModels(list);
				}
			} catch (_e) {
				if (isMounted) {
					setAllModels([]);
					toast.error("Failed to load models for dashboard charts.");
				}
			}
		})();
		return () => {
			isMounted = false;
		};
	}, []);

	// Left Donut: Only show models by location (computed from ALL models)
	const computedLeftDonut = useMemo(() => {
		if (!Array.isArray(allModels) || allModels.length === 0) return [];

		// Group all models by location (prefer ID, fallback to name)
		const group = new Map();
		allModels.forEach((m) => {
			const locId = m?.location?._id;
			const locName = m?.location?.name || "Unknown";
			const key = locId || locName;
			const modelName = m?.modelName || m?.slug || "Unnamed Model";
			if (!group.has(key)) {
				group.set(key, {
					locationId: locId,
					locationName: locName,
					count: 0,
					modelNames: [],
				});
			}
			const entry = group.get(key);
			entry.count += 1;
			if (!entry.modelNames.includes(modelName))
				entry.modelNames.push(modelName);
		});

		const names = Array.from(group.values()).map((g) => g.locationName);
		const palette = buildPaletteMap(names);
		return Array.from(group.values()).map((g) => ({
			name: g.locationName,
			value: g.count,
			color: palette.get(g.locationName),
			modelNames: g.modelNames,
		}));
	}, [allModels]);

	// Donut: switch by rightFilterType (use same semantics: All/Sample/Incident)
	const computedDonut = useMemo(() => {
		const mode = rightFilterType;
		if (mode === "All") {
			const byLocation = dashboardData?.modelsInEachLocation;
			if (Array.isArray(byLocation) && byLocation.length > 0) {
				const names = byLocation.map((l) => l.locationName || "Location");
				const palette = buildPaletteMap(names);
				return byLocation.map((loc) => ({
					name: loc.locationName || "Location",
					value: Number(loc.totalModels) || 0,
					color: palette.get(loc.locationName || "Location"),
				}));
			}
			return [];
		}
		if (mode === "Sample") {
			const bySample = dashboardData?.TotalTagsBySampleAndMonth;
			if (bySample && typeof bySample === "object") {
				const organisms = Object.keys(bySample);
				const totals = organisms.map((org) => ({
					name: org,
					value: (bySample[org] || []).reduce(
						(s, it) => s + (Number(it.totalTags) || 0),
						0
					),
				}));
				const palette = buildPaletteMap(organisms);
				return totals.map((t) => ({ ...t, color: palette.get(t.name) }));
			}
			return [];
		}
		if (mode === "Incident") {
			const byIncident = dashboardData?.TotalIncidentsByMonth;
			if (byIncident && typeof byIncident === "object") {
				const incidents = Object.keys(byIncident);
				const totals = incidents.map((inc) => ({
					name: inc,
					value: (byIncident[inc] || []).reduce(
						(s, it) => s + (Number(it.totalTags) || 0),
						0
					),
				}));
				const palette = buildPaletteMap(incidents);
				return totals.map((t) => ({ ...t, color: palette.get(t.name) }));
			}
			return [];
		}
		return [];
	}, [dashboardData, rightFilterType]);

	const leftDonutTotal = useMemo(
		() => computedLeftDonut.reduce((s, d) => s + (Number(d.value) || 0), 0),
		[computedLeftDonut]
	);

	const donutTotal = useMemo(
		() => computedDonut.reduce((s, d) => s + (Number(d.value) || 0), 0),
		[computedDonut]
	);

	// Calculate responsive donut radii based on container size
	const getDonutRadii = () => {
		const innerRadius =
			window.innerWidth < 640 ? 80 : window.innerWidth < 768 ? 90 : 100;
		const outerRadius =
			window.innerWidth < 640 ? 112 : window.innerWidth < 768 ? 126 : 140;
		return { innerRadius, outerRadius };
	};

	const [donutRadii, setDonutRadii] = useState(getDonutRadii());

	// Update radii on resize
	useEffect(() => {
		const handleResize = () => setDonutRadii(getDonutRadii());
		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	// Close dropdowns when clicking outside
	useEffect(() => {
		const handleClickOutside = (event) => {
			if (!event.target.closest(".dropdown-container")) {
				setShowRightFilterDropdown(false);
			}
		};
		document.addEventListener("click", handleClickOutside);
		return () => document.removeEventListener("click", handleClickOutside);
	}, []);

	return (
		<div className="grid mx-2 sm:mx-4 lg:mx-5 grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mb-6 md:mb-10">
			{/* LEFT: Donut Chart */}
			<div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl md:shadow-2xl flex flex-col">
				{/* Header with Title */}
				<div className="flex items-center justify-between mb-3 md:mb-4">
					<div className="flex items-center gap-1 md:gap-2">
						<h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
							Models by Location
						</h1>
					</div>
				</div>

				{/* Donut Chart Container */}
				<div className="flex-1 flex flex-col items-center justify-center">
					<div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={computedLeftDonut}
									cx="50%"
									cy="50%"
									innerRadius={donutRadii.innerRadius}
									outerRadius={donutRadii.outerRadius}
									paddingAngle={0}
									dataKey="value"
									stroke="none"
									cornerRadius={8}
								>
									{computedLeftDonut.map((entry, i) => (
										<Cell key={`cell-left-${i}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip
									content={<LeftDonutTooltip />}
									cursor={false}
									wrapperStyle={{
										zIndex: 1000,
									}}
								/>
							</PieChart>
						</ResponsiveContainer>

						{/* Content inside Donut */}
						<div className="absolute inset-[15%] flex shadow-lg rounded-full flex-col items-center justify-center pointer-events-none">
							<div className="flex flex-col gap-1 mb-1 md:mb-2">
								{computedLeftDonut.map((item) => {
									const percentage = leftDonutTotal > 0
										? ((item.value / leftDonutTotal) * 100).toFixed(1)
										: 0;
									return (
										<div
											key={item.name}
											className="flex items-center justify-between gap-2 md:gap-3 min-w-[120px] md:min-w-[140px]"
										>
											<div className="flex items-center gap-1 md:gap-2">
												<div
													className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
													style={{ background: item.color }}
												/>
												<span className="text-[10px] md:text-xs font-semibold text-gray-900">
													{percentage}%
												</span>
											</div>
											<div className="flex items-center gap-1" />
										</div>
									);
								})}
							</div>
							<div className="text-sm md:text-base font-bold text-gray-900">
								Total: {leftDonutTotal}
							</div>
							<div className="text-[10px] md:text-xs text-purple-600">
								Locations
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Legend */}
				<div className="flex flex-wrap items-center gap-4 justify-center pt-4 border-t border-gray-100">
					{computedLeftDonut.map((item) => (
						<div key={item.name} className="flex items-center gap-2">
							<div
								style={{
									width: 10,
									height: 10,
									borderRadius: "50%",
									background: item.color,
								}}
							/>
							<span className="text-sm text-gray-700">{item.name}</span>
						</div>
					))}
				</div>
			</div>

			{/* RIGHT: Donut */}
			<div className="bg-white rounded-xl md:rounded-2xl p-4 md:p-6 shadow-xl md:shadow-2xl flex flex-col">
				{/* Header with Title and Icons */}
				<div className="flex items-center justify-between mb-3 md:mb-4">
					<div className="flex items-center gap-1 md:gap-2">
						<h1 className="text-lg md:text-xl lg:text-2xl font-bold text-gray-900">
							{rightFilterType === "All"
								? "Positive Samples detected"
								: rightFilterType === "Sample"
								? "Samples by Organism"
								: "Incidents by Type"}
						</h1>

					</div>
					<div className="flex items-center gap-3" />

					{/* Filter Bar */}
					<div className="flex flex-wrap items-center gap-2">
						<div className="relative dropdown-container">
							<button
								onClick={() =>
									setShowRightFilterDropdown(!showRightFilterDropdown)
								}
								className="flex items-center gap-2 px-3 py-1.5 bg-primary text-white rounded-full hover:bg-[#7C3AED] transition-colors"
							>
								<span className="text-xs font-medium">
									{rightFilterType}
								</span>
								<WebIcon
									icon="chevron_down"
									className="w-4 h-4 text-white"
								/>
							</button>
							{showRightFilterDropdown && (
								<div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 min-w-[120px]">
									{["All", "Sample", "Incident"].map((opt) => (
										<button
											key={opt}
											onClick={() => {
												setRightFilterType(opt);
												setShowRightFilterDropdown(false);
											}}
											className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg"
										>
											{opt}
										</button>
									))}
								</div>
							)}
						</div>
					</div>
				</div>

				{/* Donut Chart Container */}
				<div className="flex-1 flex flex-col items-center justify-center">
					<div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80">
						<ResponsiveContainer width="100%" height="100%">
							<PieChart>
								<Pie
									data={computedDonut}
									cx="50%"
									cy="50%"
									innerRadius={donutRadii.innerRadius}
									outerRadius={donutRadii.outerRadius}
									paddingAngle={0}
									dataKey="value"
									stroke="none"
									cornerRadius={8}
								>
									{computedDonut.map((entry, i) => (
										<Cell key={`cell-${i}`} fill={entry.color} />
									))}
								</Pie>
								<Tooltip content={<DonutTooltip />} cursor={false} />
							</PieChart>
						</ResponsiveContainer>

						{/* Content inside Donut */}
						<div className="absolute inset-[15%] flex shadow-lg rounded-full flex-col items-center justify-center pointer-events-none">
							<div className="flex flex-col gap-1 mb-1 md:mb-2">
								{computedDonut.map((item) => {
									const percentage = donutTotal > 0
										? ((item.value / donutTotal) * 100).toFixed(1)
										: 0;
									return (
										<div
											key={item.name}
											className="flex items-center justify-between gap-2 md:gap-3 min-w-[120px] md:min-w-[140px]"
										>
											<div className="flex items-center gap-1 md:gap-2">
												<div
													className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
													style={{ background: item.color }}
												/>
												<span className="text-[10px] md:text-xs font-semibold text-gray-900">
													{percentage}%
												</span>
											</div>
											<div className="flex items-center gap-1" />
										</div>
									);
								})}
							</div>
							<div className="text-sm md:text-base font-bold text-gray-900">
								Total: {donutTotal}
							</div>
							<div className="text-[10px] md:text-xs text-purple-600">
								{rightFilterType}
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Legend */}
				<div className="flex flex-wrap items-center gap-4 justify-center pt-4 border-t border-gray-100">
					{computedDonut.map((item) => (
						<div key={item.name} className="flex items-center gap-2">
							<div
								style={{
									width: 10,
									height: 10,
									borderRadius: "50%",
									background: item.color,
								}}
							/>
							<span className="text-sm text-gray-700">{item.name}</span>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};

export default FullDashboard;
