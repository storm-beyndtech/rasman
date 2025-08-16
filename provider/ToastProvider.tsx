"use client";

import React, { createContext, useContext, useState } from "react";

// Toast Notification Context
interface ToastState {
	message: string;
	type: "success" | "error" | "warning" | "info";
	isVisible: boolean;
}

interface ToastContextType {
	toast: ToastState;
	showToast: (message: string, type?: "success" | "error" | "warning" | "info") => void;
	hideToast: () => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	const [toast, setToast] = useState<ToastState>({
		message: "",
		type: "info",
		isVisible: false,
	});

	const showToast = (message: string, type: "success" | "error" | "warning" | "info" = "info") => {
		setToast({ message, type, isVisible: true });

		// Auto-hide after 5 seconds
		setTimeout(() => {
			setToast((prev) => ({ ...prev, isVisible: false }));
		}, 5000);
	};

	const hideToast = () => {
		setToast((prev) => ({ ...prev, isVisible: false }));
	};

	return <ToastContext.Provider value={{ toast, showToast, hideToast }}>{children}</ToastContext.Provider>;
};

export const useToast = () => {
	const context = useContext(ToastContext);
	if (context === undefined) {
		throw new Error("useToast must be used within a ToastProvider");
	}
	return context;
};
