import React, { useEffect, useState } from "react";

const illustrations = [
	"/icons/illustrations/amico.svg",
	"/icons/illustrations/amico_1.svg",
	"/icons/illustrations/amico_2.svg",
];

const AUTO_INTERVAL_MS = 4000;

const IllustrationCarousel = () => {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const id = setInterval(() => {
			setIndex((prev) => (prev + 1) % illustrations.length);
		}, AUTO_INTERVAL_MS);
		return () => clearInterval(id);
	}, []);

	return (
		<div className="relative">
			{/* Background decorative blur elements */}
			<div className="absolute inset-0 opacity-30">
				<div className="absolute top-10 right-10 w-32 h-32 bg-purple-500 rounded-full blur-3xl" />
				<div className="absolute bottom-10 left-10 w-40 h-40 bg-purple-600 rounded-full blur-3xl" />
			</div>

			{/* Glass card container */}
			<div className="relative w-[474px] max-w-full h-[434px] rounded-r-[32px] overflow-hidden">
				{/* Main glassmorphism layers */}
				<div className="absolute inset-0 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl" />

				{/* Light border effect - this creates the "sun hitting the edge" effect */}
				<div className="absolute inset-0 rounded-r-[32px] bg-gradient-to-br from-white/20 via-white/10 to-transparent p-[1px]">
					{/* Inner container with shadow casting inward */}
					<div className="w-full h-full rounded-r-[32px] bg-gradient-to-br from-[#30263b]/80 to-[#30263b]/60 shadow-[inset_0_2px_20px_rgba(0,0,0,0.3),inset_0_-2px_10px_rgba(255,255,255,0.05)]">
						{/* Additional glass effect layer */}
						<div className="absolute inset-0 bg-gradient-to-tr from-purple-500/10 via-transparent to-purple-300/10" />

						{/* Content container */}
						<div className="relative w-full h-full p-6 flex flex-col items-center justify-center">
							{/* Subtle inner glow from light edge */}
							<div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-50" />

							{/* Top edge highlight - simulating light reflection */}
							<div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

							{/* Left edge highlight for rounded corner */}
							<div className="absolute top-0 left-0 bottom-0 w-[1px] bg-gradient-to-b from-white/30 via-white/10 to-transparent" />

							{/* Illustration */}
							<div className="relative z-10 flex-1 flex items-center justify-center">
								<img
									src={illustrations[index]}
									alt="Illustration"
									className="w-full max-w-xs object-contain drop-shadow-2xl"
								/>
							</div>

							{/* Carousel indicators */}
							<div className="relative z-10 flex items-center justify-center gap-2 mt-4">
								{illustrations.map((_, i) => (
									<button
										key={i}
										onClick={() => setIndex(i)}
										className={`h-2.5 w-2.5 rounded-full transition-all duration-300 ${
											i === index
												? "bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]"
												: "bg-white/20 hover:bg-white/40 border border-white/30"
										}`}
										aria-label={`Go to slide ${i + 1}`}
									/>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Optional: Animated shimmer effect on the border */}
				<div
					className="absolute inset-0 rounded-r-[32px] opacity-0 hover:opacity-100 transition-opacity duration-500"
					style={{
						background:
							"linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.1) 50%, transparent 60%)",
						backgroundSize: "200% 200%",
						animation: "shimmer 3s infinite",
						pointerEvents: "none",
					}}
				/>
			</div>

			{/* Add shimmer animation */}
			<style jsx>{`
				@keyframes shimmer {
					0% {
						background-position: -100% 0;
					}
					100% {
						background-position: 200% 0;
					}
				}
			`}</style>
		</div>
	);
};

export default IllustrationCarousel;
