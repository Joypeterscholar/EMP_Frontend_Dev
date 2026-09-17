import * as React from "react";

import { cn } from "../../lib/utils";
import { Input } from "./input";
import { Label } from "./label";

const FloatingInput = React.forwardRef(({ className, ...props }, ref) => {
	return (
		<Input
			placeholder=" "
			className={cn("peer", className)}
			ref={ref}
			{...props}
		/>
	);
});
FloatingInput.displayName = "FloatingInput";

const FloatingLabel = React.forwardRef(({ className, ...props }, ref) => {
	return (
		<Label
			className={cn(
				"absolute start-3 top-1/2 -translate-y-1/2 z-10 origin-[0] bg-white px-2 text-sm text-gray-400 duration-200 pointer-events-none peer-placeholder-shown:top-1/2 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:scale-100 peer-focus:top-0 peer-focus:-translate-y-1/2 peer-focus:scale-90 peer-focus:text-gray-600 peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:-translate-y-1/2 peer-[:not(:placeholder-shown)]:scale-90 peer-[:not(:placeholder-shown)]:text-gray-600",
				className
			)}
			ref={ref}
			{...props}
		/>
	);
});
FloatingLabel.displayName = "FloatingLabel";

const FloatingLabelInput = React.forwardRef(({ id, label, ...props }, ref) => {
	return (
		<div className="relative">
			<FloatingInput ref={ref} id={id} {...props} />
			<FloatingLabel htmlFor={id}>{label}</FloatingLabel>
		</div>
	);
});
FloatingLabelInput.displayName = "FloatingLabelInput";

export { FloatingInput, FloatingLabel, FloatingLabelInput };
