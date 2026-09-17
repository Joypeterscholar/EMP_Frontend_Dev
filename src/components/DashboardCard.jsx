// components/DashboardCard.jsx
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

export const DashboardCard = ({
	title,
	children,
	className = "",
	bgColor = "bg-white",
	onClick,
	isClickable = false,
}) => {
	return (
		<div className="w-full">
			<Card
				className={`
          ${className} 
          ${bgColor} 
          ${isClickable ? "cursor-pointer" : ""} 
          transition-all 
          duration-300 
          hover:shadow-xl
          hover:scale-[1.01]
          relative
          overflow-hidden
          group
        `}
				onClick={onClick}
			>
				{/* Gradient overlay */}
				<div
					className={`
          absolute 
          inset-0 
          bg-gradient-to-r 
          from-transparent 
          via-white/5 
          to-transparent 
          translate-x-[-100%] 
          group-hover:translate-x-[100%] 
          transition-transform 
          duration-1000
          pointer-events-none
        `}
				/>

				<CardHeader>
					<CardTitle className="text-lg font-medium">{title}</CardTitle>
				</CardHeader>

				<CardContent>
					<div className="opacity-100 relative z-10">{children}</div>
				</CardContent>

				{/* Hover effect border */}
				<div
					className={`
          absolute 
          inset-0 
          border-2 
          border-transparent 
          group-hover:border-white/10 
          rounded-lg 
          transition-all 
          duration-300
          pointer-events-none
        `}
				/>
			</Card>
		</div>
	);
};
