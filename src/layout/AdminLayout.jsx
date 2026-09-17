/* eslint-disable no-unused-vars */

import "../index.css";
import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigation } from "react-router-dom";
import { Header, Loading, Menu } from "../components";
import "../styles/AdminLayout.css";
import { useSelector } from "react-redux";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import CheckAuth from "@/components/CheckAuth";

function AdminLayout() {
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const mobile = useSelector((state) => state.menuState.mobile);
	const navigation = useNavigation();
	const isPageLoading = navigation.state === "loading";
	const currentUser = localUser || user;
	if (!user && !localUser) {
		return <Navigate to="/login" replace />;
	}

	if (!["superAdmin", "admin"].includes(currentUser.role)) {
		return <Navigate to="/unauthorized" replace />;
	}

	return (
		<div className="box-border flex relative flex-row justify-start items-start w-screen h-screen">
			<div
				className={
					mobile
						? "flex overflow-y-auto absolute top-0 left-0 z-50 flex-col flex-grow w-screen h-screen bg-slate-300 border-slate-300 py-[5px]"
						: "flex overflow-y-auto relative bottom-0 left-0 h-screen py-[5px] min-w-60 md:max-lg:w-[20vw] lg:w-[16vw] max-md:hidden bg-slate-300 border-slate-300"
				}
			>
				<Menu />
			</div>
			<div className="lg:w-[calc(100vw - 16vw)] relative flex h-screen flex-grow flex-col bg-white max-lg:w-[calc(100vw-20vw)] max-md:w-screen md:overflow-y-auto">
				<Header />
				<div className="h-[calc(100% - 100px)] overflow-y-auto relative">
					{isPageLoading ? <Loading /> : <Outlet />}
				</div>
			</div>
			<CheckAuth />
		</div>
	);
}

export default AdminLayout;
