import React from "react";

const GradientHeader = ({
	width = "w-[1129px]",
	height = "h-[177px]",
	radius = "rounded-[32px]",
	className = "",
	children,
}) => {
	return (
		<div className={`w-full flex justify-center ${className}`}>
			<div
				className={`${width} ${height} ${radius} shadow-md mb-6 overflow-hidden relative bg-[linear-gradient(90deg,var(--emp-color-secondary-alt)_0%,var(--emp-color-tertiary)_50%,var(--emp-color-accent)_100%)]`}
				aria-hidden={children ? undefined : true}
			>
				{children && (
					<div className="absolute inset-0 flex items-center justify-center">
						{children}
					</div>
				)}
			</div>
		</div>
	);
};

export default GradientHeader;
