import React, { useState } from "react";
import PropTypes from "prop-types";
import { FaTimes, FaBars } from "react-icons/fa";
import NavLinksNew from "./NavLinksNew";
import WebIcon from "../../components/custom/WebIcons";
import SidebarFooter from "./SidebarFooter";
import logo from "../../assets/logo.png";

const SidebarNew = ({ onCollapse }) => {
	const [collapsed, setCollapsed] = useState(false);

	const toggle = () => {
		const c = !collapsed;
		setCollapsed(c);
		onCollapse?.(c);
	};

	return (
		<div className="fixed left-0 top-0 h-screen z-40">
			<div
				className={`relative h-full bg-dark shadow-xl flex flex-col transition-all duration-200 ${
					collapsed ? "w-[80px]" : "w-[200px]"
				}`}
			>
				<div
					className={`h-20 relative flex items-center justify-center px-4`}
				>
					<div className="flex items-center gap-2">
						<img
							src={logo}
							alt="EMP logo"
							className={`${
								collapsed
									? "h-12 w-12"
									: "w-32 max-w-full h-auto object-contain"
							} object-contain`}
						/>
					</div>
					{!collapsed && (
						<button
							onClick={toggle}
							className="absolute right-3 text-white text-sm px-2 py-1 hover:bg-white/20 rounded-md transition-colors"
						>
							<FaTimes />
						</button>
					)}
				</div>

				{collapsed && (
					<div className="flex justify-center py-2">
						<button
							onClick={toggle}
							className="text-white hover:bg-white/20 p-2 rounded transition-colors"
						>
							<FaBars />
						</button>
					</div>
				)}

				<div
					className={`flex-1 overflow-hidden ${
						collapsed ? "px-2" : "px-3"
					}`}
				>
					<NavLinksNew collapsed={collapsed} />
				</div>
				<SidebarFooter collapsed={collapsed} />
			</div>
		</div>
	);
};

SidebarNew.propTypes = { onCollapse: PropTypes.func };

export default SidebarNew;
