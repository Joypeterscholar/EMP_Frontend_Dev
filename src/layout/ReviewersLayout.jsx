/* eslint-disable no-unused-vars */

import "../index.css";
import React, { useEffect } from "react";
import { Navigate, Outlet, useNavigation } from "react-router-dom";
import { Header, Loading, Menu } from "../components";
import "../styles/AdminLayout.css";
import { useSelector } from "react-redux";
import HeaderTwo from "../components/HeaderTwo";
import { getUserFromLocalStorage } from "../redux/reducers/userReducer";
import CheckAuth from "@/components/CheckAuth";

function ReviewersLayout() {
	const user = useSelector((state) => state.userState.user);
	const mobile = useSelector((state) => state.menuState.mobile);
	const localUser = getUserFromLocalStorage();
	const navigation = useNavigation();
	const isPageLoading = navigation.state === "loading";
	const currentUser = localUser || user;
	if (!user && !localUser) {
		return <Navigate to="/login" replace />;
	}
	if (currentUser.role !== "reviewer") {
		return (
			localStorage.removeItem("user"),
			(<Navigate to="/unauthorized" replace />)
		);
	}
	return (
		<div className="box-border flex relative flex-row justify-start items-start w-screen h-screen">
			<div
				className={
					mobile
						? "w-screen absolute top-0 left-0 flex flex-col overflow-y-auto flex-grow bg-[#b9b7b7] border-[#384256] h-screen py-[5px] z-50"
						: "relative flex py-[5px] bottom-0 left-0 h-screen overflow-y-auto min-w-60 md:max-lg:w-[20vw] lg:w-[16vw] max-md:hidden bg-[#b9b7b7] border-[#384256]"
				}
			>
				<Menu />
			</div>
			<div className="lg:w-[calc(100vw - 16vw)] relative flex h-screen flex-grow flex-col bg-white max-lg:w-[calc(100vw-20vw)] max-md:w-screen md:overflow-y-auto">
				<Header />
				<div className="h-[calc(100% - 100px)] relative">
					{isPageLoading ? <Loading /> : <Outlet />}
				</div>
			</div>
			<CheckAuth />
		</div>
	);
}

export default ReviewersLayout;
