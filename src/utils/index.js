import axios from "axios";
import { store } from "../redux/store";
import { Navigate } from "react-router";

export const baseURL =
	import.meta.env.VITE_BACKEND_BASE_URL || "http://localhost:8000";
const appURL = import.meta.env.VITE_APP_URL;
const evMappingUrl = `${baseURL}/api`;

export const getPasswordToken = () => {
	try {
		const reduxToken = store.getState().userState?.accessToken;
		if (reduxToken !== undefined && reduxToken !== "") {
			return reduxToken;
		}
		const localStorageToken = localStorage.getItem("accessToken");
		return localStorageToken;
	} catch (err) {
		console.error(err);
	}
};

export const customFetch = axios.create({
	baseURL: evMappingUrl,
	headers: {
		"Access-Control-Allow-Origin": `${appURL}`,
	},
});

customFetch.interceptors.request.use((config) => {
	// Dynamically set the Authorization header before each request
	const token = getPasswordToken();
	if (token && token !== "null" && token !== "undefined") {
		config.headers.Authorization = `Bearer ${token}`;
	}
	return config;
});

export function formatDate(dateString) {
	const options = { year: "numeric", month: "long", day: "numeric" };
	return new Date(dateString).toLocaleDateString(undefined, options);
}

export function formatTime(dateString) {
	const options = {
		hour: "numeric",
		minute: "numeric",
		second: "numeric",
		hour12: true,
	};
	return new Date(dateString).toLocaleTimeString(undefined, options);
}

export function filterDataByDateRange(data, startDate, endDate) {
	const startTime = "00:00";
	const endTime = "23:59";
	// Convert startDate and endDate to Date objects
	const startTimeParts = startTime.split(":").map(Number);
	const endTimeParts = endTime.split(":").map(Number);

	startDate = new Date(startDate);
	startDate.setHours(startTimeParts[0], startTimeParts[1], 0, 0);

	endDate = new Date(endDate);
	endDate.setHours(endTimeParts[0], endTimeParts[1], 59, 999);

	// Filter the data based on the date range
	const filteredData = data.filter((item) => {
		const createdAt = new Date(item.createdAt);
		return createdAt >= startDate && createdAt <= endDate;
	});

	return filteredData;
}

export function filterDataByDateAndTimeRange(
	data,
	startDate,
	endDate,
	startTime = "00:00",
	endTime = "23:59"
) {
	if (!startDate || !endDate) {
		return data;
	}
	// Convert startDate, startTime, endDate, and endTime to Date objects
	const startTimeParts = startTime.split(":").map(Number);
	const endTimeParts = endTime.split(":").map(Number);

	startDate = new Date(startDate);
	startDate.setHours(startTimeParts[0], startTimeParts[1], 0, 0);

	endDate = new Date(endDate);
	endDate.setHours(endTimeParts[0], endTimeParts[1], 59, 999);
	// Filter the data based on the date-time range
	const filteredData = data.filter((item) => {
		const createdAt = new Date(item.createdAt);
		return (
			createdAt.getTime() >= startDate.getTime() &&
			createdAt.getTime() <= endDate.getTime()
		);
	});

	return filteredData;
}

export function axiosMiddleware() {
	axios.interceptors.response.use((res) => {
		if (
			res.data?.status === "error" &&
			(res.data?.message.toLowerCase() === "authentication invalid" ||
				res.data?.message.toLowerCase() === "invalid authentication")
		) {
			return Navigate("/login");
		}
	});
	axios.interceptors.request.use((res) => {
		if (
			res.headers.Authorization.split(" ")[1] === null ||
			res.headers.Authorization.split(" ")[1] === undefined
		) {
			res.headers.Authorization = `Bearer ${getPasswordToken()}`;
		}
	});
}

export const handleReload = () => {
	return Navigate(location.pathname);
};

export function removeCommas(str) {
	return str.replace(/,/g, "");
}

export function getRandomArbitrary(min, max) {
	return Math.random() * (max - min) + min;
}

export function getRealFileUrl(url) {
	if (!url) return "";
	if (
		!url.toLowerCase().includes("api") &&
		url.toLowerCase().includes("file")
	) {
		return `${baseURL}/api/${url}`;
	}
	if (
		url.toLowerCase().includes("api") &&
		url.toLowerCase().includes("file")
	) {
		return `${baseURL}/${url}`;
	}
	return url;
}
