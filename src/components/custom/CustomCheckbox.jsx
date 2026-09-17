import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";

import { cn } from "../../lib/utils";

const CustomCheckbox = React.forwardRef(({ className, ...props }, ref) => (
	<CheckboxPrimitive.Root
		ref={ref}
		className={cn(
			"peer h-5 w-5 shrink-0 rounded-full border-2 border-gray-300 bg-secondaryAlt ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-secondaryAlt/20 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-secondaryAlt data-[state=checked]:border-secondaryAlt transition-all",
			className
		)}
		{...props}
	>
		<CheckboxPrimitive.Indicator
			className={cn("flex items-center justify-center text-white")}
		>
			<Check className="h-3 w-3" strokeWidth={3} />
		</CheckboxPrimitive.Indicator>
	</CheckboxPrimitive.Root>
));
CustomCheckbox.displayName = CheckboxPrimitive.Root.displayName;

export { CustomCheckbox };
