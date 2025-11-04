import { Link } from "react-router-dom";

export default function NotFound() {
	return (
		<div className="text-center py-5">
			<h1 className="display-5 fw-bold">404</h1>
			<p className="lead">The page you’re looking for doesn’t exist.</p>
			<div className="mt-3">
				<Link to="/" className="btn btn-primary">
					Return Home
				</Link>
			</div>
		</div>
	);
}
