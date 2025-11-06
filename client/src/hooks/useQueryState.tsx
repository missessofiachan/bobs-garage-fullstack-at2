/**
 * @author Bob's Garage Team
 * @purpose Standardized query state management for loading/error/empty states
 * @version 1.0.0
 */

import { Button } from "react-bootstrap";
import Loading from "../components/ui/Loading";

interface UseQueryStateOptions {
	isLoading: boolean;
	error: Error | null;
	data: unknown;
	isEmpty?: (data: unknown) => boolean;
	emptyMessage?: string;
	loadingMessage?: string;
	onRetry?: () => void;
	showRetry?: boolean;
}

type QueryState = "loading" | "error" | "empty" | "success";

/**
 * Handles standardized query states (loading, error, empty, success)
 */
export function useQueryState(options: UseQueryStateOptions) {
	const { isLoading, error, data, isEmpty, emptyMessage, loadingMessage, onRetry, showRetry } =
		options;

	const state: QueryState = isLoading
		? "loading"
		: error
			? "error"
			: (isEmpty && data && isEmpty(data)) || !data
				? "empty"
				: "success";

	const content =
		state === "loading" ? (
			<Loading message={loadingMessage || "Loading..."} />
		) : state === "error" ? (
			<div className="alert alert-danger d-flex align-items-center justify-content-between">
				<div>Failed to load data</div>
				{showRetry && onRetry && (
					<Button size="sm" variant="outline-light" onClick={onRetry}>
						Retry
					</Button>
				)}
			</div>
		) : state === "empty" ? (
			<div className="text-muted">{emptyMessage || "No data available"}</div>
		) : null;

	return {
		state,
		content,
		isLoading: state === "loading",
		isError: state === "error",
		isEmpty: state === "empty",
		isSuccess: state === "success",
	};
}

export default useQueryState;
