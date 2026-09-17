/* eslint-disable no-unused-vars */

import "../index.css";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, Outlet, useLocation, useNavigation } from "react-router-dom";
import {
	getAccessTokenFromLocalStorage,
	getUserFromLocalStorage,
} from "../redux/reducers/userReducer";
import { loginUser } from "../redux/actions/userActions";
import { Loading } from "../components";
import { useEffect } from "react";
import CheckAuth from "@/components/CheckAuth";

const RootLayout = () => {
	const user = useSelector((state) => state.userState.user);
	const localUser = getUserFromLocalStorage();
	const localAccessToken = getAccessTokenFromLocalStorage();
	const location = useLocation();
	const navigation = useNavigation();
	const isPageLoading = navigation.state === "loading";
	const dispatch = useDispatch();
	const { pathname } = location;

	useEffect(() => {
		if (localUser && !user) {
			dispatch(
				loginUser({
					data: { user: localUser, accessToken: localAccessToken },
				})
			);
		}
	}, [localUser]);

	let targetRoute;
	const currentUser = localUser || user;
	if (currentUser?.role === "superAdmin" || currentUser?.role === "admin") {
		targetRoute = "/admin";
	} else if (["sampler", "tagger"].includes(currentUser?.role)) {
		targetRoute = "/tagger/models";
	} else if (currentUser?.role === "reviewer") {
		targetRoute = "/reviewer";
	} else {
		return <Navigate to="/login" replace />;
	}

	if (targetRoute) {
		if (pathname === "" || pathname === "/") {
			return <Navigate to={targetRoute} replace />;
		}
	}

	return (
		<div className="flex flex-grow justify-center items-start pt-10 w-full">
			{isPageLoading ? <Loading /> : <Outlet />}
			<CheckAuth />
		</div>
	);
};

export default RootLayout;
