import React from "react";
import ReactDOM from "react-dom";
import WebIcon from "../../custom/WebIcons";

const DeleteAlert = ({
	isOpen,
	onClose,
	onConfirm,
	title = "Delete",
	message = "Are you sure you want to delete this item?",
}) => {
	if (!isOpen) return null;

	return ReactDOM.createPortal(
		<div className="fixed inset-0 z-50 flex items-center justify-center">
			{/* Background overlay */}
			<div
				className="absolute inset-0 bg-[#0B0711]/80 backdrop-blur-[1px]"
				onClick={onClose}
			/>

			{/* Modal content */}
			<div className="relative z-10 w-[665px] h-[449px] rounded-[20px] bg-white p-6 shadow-2xl flex flex-col items-center justify-center text-center gap-2">
				{/* Title */}
				<h3 className="heading-regular font-semibold text-gray-900">
					{title}
				</h3>

				{/* Delete Icon */}
				<div>
					<WebIcon icon="delete_circle_red" className="h-36 w-36" />
				</div>

				{/* Message */}
				<p className="text-bold font-normal text-gray-700 max-w-md">
					{message}
				</p>

				{/* Actions */}
				<div className="flex items-center justify-center gap-6 mt-4 gap-x-12">
					<button
						onClick={() => {
							if (onConfirm) onConfirm();
							onClose();
						}}
						className="text-bold font-semibold text-green-600 hover:underline"
					>
						Yes Delete
					</button>
					<button
						onClick={onClose}
						className="text-bold font-semibold text-red-600 hover:underline"
					>
						No, Don't
					</button>
				</div>
			</div>
		</div>,
		document.body
	);
};

export default DeleteAlert;
