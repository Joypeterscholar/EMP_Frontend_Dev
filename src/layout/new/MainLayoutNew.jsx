import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useLocation, Outlet } from "react-router-dom";
import HeaderNew from "./HeaderNew";
import SidebarNew from "./SidebarNew";

const AUTH_ROUTES = [
	"/",
	"/login",
	"/register",
	"/forgot-password",
	"/password-otp",
	"/new-password",
	"/reset-password",
];

const MainLayoutNew = () => {
	const location = useLocation();
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [showShell, setShowShell] = useState(true);

	useEffect(() => {
		const hidden = AUTH_ROUTES.some(
			(p) =>
				location.pathname === p ||
				location.pathname?.includes("password-reset")
		);
		setShowShell(!hidden);
	}, [location.pathname]);

	if (!showShell) return <Outlet />;

	return (
		<div className="min-h-screen bg-grey">
			<SidebarNew onCollapse={(c) => setSidebarCollapsed(c)} />
			<div
				className={`relative transition-all duration-200 ${
					sidebarCollapsed ? "ml-[80px]" : "ml-[200px]"
				}`}
			>
				<HeaderNew />
				<main className="min-h-[calc(100vh-80px)] bg-lighterGrey">
					<div className="w-full">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

MainLayoutNew.propTypes = {};

export default MainLayoutNew;
