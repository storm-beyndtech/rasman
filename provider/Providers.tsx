"use client";

import React from "react";
import { ToastProvider } from "./ToastProvider";
import { AudioProvider } from "./AudioProvider";
import QueryProvider from "./QueryProvider";
import AudioPlayer from "@/components/AudioPlayer";

// Main Providers Component - Wraps your entire app
export const Providers: React.FC<{ children: React.ReactNode }> = ({ children }) => {
	return (
		<QueryProvider>
			<ToastProvider>
				<AudioProvider>
					{children}
					<AudioPlayer />
				</AudioProvider>
			</ToastProvider>
		</QueryProvider>
	);
};

export default Providers;
