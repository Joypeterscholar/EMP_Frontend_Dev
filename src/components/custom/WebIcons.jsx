import React from "react";
import PropTypes from "prop-types";
import { WebIcons } from "../../config/Icons";
import "../../styles/webIcon.css";

const WebIcon = ({ icon, size = "default", className = "", onClick }) => {
	const sizeClass =
		size === "small"
			? "web-icon-small"
			: size === "large"
			? "web-icon-large"
			: "web-icon";

	// If className contains width/height classes, use those instead of the size class
	const hasCustomSize = className.includes("w-") || className.includes("h-");

	return (
		<img
			src={typeof icon === "string" ? WebIcons[icon] : icon}
			alt={typeof icon === "string" ? icon : "icon"}
			className={`${hasCustomSize ? "" : sizeClass} ${className}`}
			onClick={onClick}
			style={{
				cursor: onClick ? "pointer" : "default",
			}}
		/>
	);
};

WebIcon.propTypes = {
	icon: PropTypes.string.isRequired,
	size: PropTypes.oneOf(["small", "default", "large"]),
	className: PropTypes.string,
	onClick: PropTypes.func,
};

export default WebIcon;
