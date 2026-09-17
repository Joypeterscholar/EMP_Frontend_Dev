import React from "react";
import PropTypes from "prop-types";
import WebIcon from "../custom/WebIcons";

const StatsCard = ({
	icon,
	title,
	count,
	iconBgColor = "bg-purple-100",
	iconColor = "text-purple-600",
	onClick,
	isClickable = false,
}) => {
	const CardContent = () => (
		<div className="bg-white rounded-2xl p-2 w-full shadow-md flex flex-col gap-2">
			<div className="flex justify-between items-center">
				<div className="flex items-center gap-3">
					<div className={`${iconBgColor} p-2 rounded-full`}>
						<WebIcon icon={icon} className={`w-5 h-5 ${iconColor}`} />
					</div>
					<h3 className="text-bold text-primary font-normal">{title}</h3>
				</div>
			</div>
			<div className="flex items-end">
				<div className="heading-large-x font-bold text-primary">
					{count}
				</div>
			</div>
		</div>
	);

	if (isClickable && onClick) {
		return (
			<button onClick={onClick} className="text-left">
				<CardContent />
			</button>
		);
	}

	return <CardContent />;
};

StatsCard.propTypes = {
	icon: PropTypes.string.isRequired,
	title: PropTypes.string.isRequired,
	count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
	iconBgColor: PropTypes.string,
	iconColor: PropTypes.string,
	onClick: PropTypes.func,
	isClickable: PropTypes.bool,
};

export default StatsCard;
