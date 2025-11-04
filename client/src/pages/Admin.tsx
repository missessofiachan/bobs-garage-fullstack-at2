import { Link } from "react-router-dom";

export default function Admin() {
	return (
		<div>
			<h1>Admin</h1>
			<div className="list-group">
				<Link className="list-group-item list-group-item-action" to="/admin/dashboard">
					Dashboard overview
				</Link>
				<Link className="list-group-item list-group-item-action" to="/admin/services">
					Manage services (CRUD, images)
				</Link>
				<Link className="list-group-item list-group-item-action" to="/admin/staff">
					Manage staff (CRUD, photos)
				</Link>
				<Link className="list-group-item list-group-item-action" to="/admin/users">
					Manage users
				</Link>
			</div>
		</div>
	);
}
