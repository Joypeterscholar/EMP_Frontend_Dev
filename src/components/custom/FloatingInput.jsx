import React from "react";
import { Input } from "../ui/input";
import { cn } from "../../lib/utils";

const FloatingInput = React.forwardRef(
	({ id, label, type = "text", className = "", ...props }, ref) => {
		return (
			<div className="relative w-full">
				<Input
					ref={ref}
					id={id}
					type={type}
					style={{ backgroundColor: "#ffffff" }}
					className={cn(
						"peer block px-4 pb-2.5 pt-5 w-full text-sm text-gray-900 rounded-2xl border border-gray-200 appearance-none focus:outline-none focus:ring-0 focus:border-gray-300",
						"!bg-white", // Force white background with !important
						className
					)}
					placeholder=" "
					{...props}
				/>
				<label
					htmlFor={id}
					className="absolute text-sm text-gray-400 duration-200 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-white px-2 peer-focus:px-2 peer-focus:text-gray-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 start-3"
				>
					{label}
				</label>
			</div>
		);
	}
);

FloatingInput.displayName = "FloatingInput";

export default FloatingInput;
