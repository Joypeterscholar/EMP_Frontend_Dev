import React from "react";
import WebIcon from "../custom/WebIcons";

const RemoveModal = ({
  isOpen,
  onClose,
  variant = "confirm", // "confirm" | "success"
  userDisplayName = "",
  onConfirm,
}) => {
  if (!isOpen) return null;

  const isConfirm = variant === "confirm";
  const title = isConfirm ? "Remove User" : "Successful";
  const message = isConfirm
    ? `Are you sure you want to Remove ${userDisplayName}?`
    : `You successfully Removed  ${userDisplayName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-[#0B0711]/80 backdrop-blur-[1px]" onClick={onClose} />

      <div className="relative z-10 w-[90%] max-w-md rounded-2xl bg-white p-6 text-center shadow-2xl">
        <h3 className="mb-4 text-xl font-semibold text-gray-900">{title}</h3>

        {isConfirm ? (
          <div className="mx-auto mb-4 flex h-24 w-24 items-center justify-center rounded-full border-2 border-[#FF3B30] bg-[#FFE9E9]">
            <WebIcon icon="deletcapMain" className="h-12 w-12" />
          </div>
        ) : (
          <div
            className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ring-4 ring-green-100"
          >
            <WebIcon icon="checkcirclemain" className="h-12 w-12 text-green-500" />
          </div>
        )}

        {isConfirm ? (
          <p className="mb-6 text-sm text-gray-600">{message}</p>
        ) : (
          <p className="mb-6 text-sm text-gray-600">{message}</p>
        )}

        {isConfirm ? (
          <div className="flex justify-center gap-6 text-sm font-medium">
            <button
              onClick={onConfirm}
              className="text-green-600 hover:text-green-700"
            >
              Yes, Remove
            </button>
            <button onClick={onClose} className="text-red-500 hover:text-red-600">
              No, Don't
            </button>
          </div>
        ) : (
          <button
            onClick={onClose}
            className="mx-auto rounded-full bg-green-600 px-6 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity"
          >
            Okay, thank you
          </button>
        )}
      </div>
    </div>
  );
};

export default RemoveModal;


