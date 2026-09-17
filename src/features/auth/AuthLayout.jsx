import React from "react";

// Shared layout for all auth screens (Login, Forgot Password, etc.)
// Uses existing Tailwind theme variables and shadcn-compatible classes.
// Background follows EMP brand dark color with top-left icon and bottom copyright.

const AuthLayout = ({ children }) => {
	return (
		<div className="min-h-screen w-screen bg-dark text-white relative overflow-hidden">
			{/* Top-left brand icon */}
			<div className="absolute top-5 left-5 z-20 flex items-center gap-2 select-none">
				<img
					src="/icons/web_icons/group.svg"
					alt="EMP Icon"
					className="h-10 w-10 object-contain"
				/>
			</div>

			{/* Content container */}
			<div className="min-h-screen w-full flex items-center justify-center p-4">
				{children}
			</div>

			{/* Bottom copyright */}
			<div className="absolute bottom-6 w-full text-center text-xs text-gray-300 select-none">
				EMP Development global all Copyrights Reserved © 2025
			</div>
		</div>
	);
};

export default AuthLayout;
