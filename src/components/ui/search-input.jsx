import React from "react";
import WebIcon from "../custom/WebIcons";

const SearchInput = ({
	value,
	onChange,
	placeholder = "Search by name, status, class....",
	className = "",
	inputClassName = "",
	style,
}) => {
	return (
		<div className={`relative ${className}`} style={style}>
			<input
				type="text"
				value={value}
				onChange={(e) => onChange?.(e.target.value)}
				placeholder={placeholder}
				className={`w-full px-4 pr-10 border border-gray-300 rounded-[100px] shadow-md focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent h-9 md:h-10 ${inputClassName}`}
			/>
			<div className="absolute right-3 top-1/2 transform -translate-y-1/2">
				<WebIcon icon="search" className="w-8 h-8 text-gray-400" />
			</div>
		</div>
	);
};

export default SearchInput;
