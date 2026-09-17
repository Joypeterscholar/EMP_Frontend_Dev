import React, { useState } from "react";
import ReactDOM from "react-dom";

const Modal = ({ children, isVisible, onClose, title }) => {
    if (!isVisible) return null;

    return ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg w-11/12 max-w-lg p-6">
                <div className="flex justify-between items-center border-b pb-4 mb-4">
                    <h2 className="text-lg font-bold">{title}</h2>
                    <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={onClose}
                    >
                        &times;
                    </button>
                </div>
                <div className="mb-6">{children}</div>
                <div className="flex justify-end">
                    <button
                        className="px-4 py-2 bg-[rgb(45,27,61)] text-white rounded-2xl hover:bg-red-600"
                        onClick={onClose}
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default Modal;