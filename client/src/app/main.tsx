/**
 * @author Bob's Garage Team
 * @purpose Application entry point for React client with Redux store and React Query setup
 * @version 1.0.0
 */

//App bootstrap, QueryClientProvider, RouterProvider

import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import "bootstrap/dist/css/bootstrap.min.css";
import "../styles/bootstrap-dark-overrides.css";
import { store } from "../store/store";
import App from "./App";
import ToastProvider from "../components/ui/ToastProvider";

const qc = new QueryClient();
ReactDOM.createRoot(document.getElementById("root")!).render(
	<React.StrictMode>
		<Provider store={store}>
			<QueryClientProvider client={qc}>
				<BrowserRouter>
					<ToastProvider>
						<App />
					</ToastProvider>
				</BrowserRouter>
			</QueryClientProvider>
		</Provider>
	</React.StrictMode>,
);
