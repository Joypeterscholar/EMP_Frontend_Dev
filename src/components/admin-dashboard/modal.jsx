import React from "react";
import WebIcon from "../custom/WebIcons";

// variant: "success" | "error"
const MessageModal = ({
	isOpen,
	onClose,
	variant = "success",
	reportId,
	onRetry,
	onCancel,
}) => {
	if (!isOpen) return null;

	const isSuccess = variant === "success";
	const title = isSuccess ? "Download Successful" : "Download Unsuccessful";
	const successMsg = (
		<>
			You successfully downloaded&nbsp; report{" "}
			<span className="font-semibold">{reportId || "ID I-0125"}</span>
		</>
	);
	const errorMsg = (
		<>Oops! Check device storage and connection and try again.</>
	);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Background overlay */}
			<div
				className="absolute inset-0 bg-[#0B0711]/80 backdrop-blur-[1px]"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div className="relative z-10 w-[90%] max-w-lg rounded-2xl bg-white p-6 text-center shadow-2xl">
				<h3 className="mb-4 text-xl font-semibold text-gray-900">
					{title}
				</h3>

				{/* Icon */}
				<div
					className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2"
					style={{ borderColor: isSuccess ? "#16a34a" : "#ef4444" }}
				>
					<div
						className="flex h-16 w-16 items-center justify-center rounded-full"
						style={{ backgroundColor: isSuccess ? "#16a34a" : "#ef4444" }}
					>
						<WebIcon
							icon={isSuccess ? "check_circle" : "delete"}
							className="h-8 w-8"
						/>
					</div>
				</div>

				{/* Message */}
				<p className="mb-6 text-sm text-gray-700">
					{isSuccess ? successMsg : errorMsg}
				</p>

				{/* Actions */}
				{isSuccess ? (
					<button
						onClick={onClose}
						className="mx-auto rounded-full bg-white px-4 py-2 text-sm font-semibold text-green-600 hover:underline"
					>
						Okay, thank you
					</button>
				) : (
					<div className="flex items-center justify-center gap-6">
						<button
							onClick={onRetry || onClose}
							className="text-sm font-semibold text-green-600 hover:underline"
						>
							Please, try again
						</button>
						<button
							onClick={onCancel || onClose}
							className="text-sm font-semibold text-red-600 hover:underline"
						>
							No, thank you
						</button>
					</div>
				)}
			</div>
		</div>
	);
};

export default MessageModal;
