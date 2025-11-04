import { useState } from "react";
import { Button, Form, Table } from "react-bootstrap";
import Loading from "../../components/ui/Loading";
import { useAdminUsers, useCreateAdminUser, useDeleteAdminUser } from "../../hooks/useAdminUsers";
import usePageTitle from "../../hooks/usePageTitle";

export default function UsersAdmin() {
	const { data, isLoading, error } = useAdminUsers();
	const createUser = useCreateAdminUser();
	const deleteUser = useDeleteAdminUser();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		await createUser.mutateAsync({
			email,
			password,
			role: "user",
			active: true,
		});
		setEmail("");
		setPassword("");
	};

	usePageTitle("Admin — Users");
	if (isLoading) return <Loading message="Loading users…" />;
	if (error) return <p>Failed to load users.</p>;
	return (
		<div>
			<h2>Users</h2>
			<Table striped bordered hover size="sm">
				<thead>
					<tr>
						<th>ID</th>
						<th>Email</th>
						<th>Role</th>
						<th>Active</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{(data ?? []).map((u) => (
						<tr key={u.id}>
							<td>{u.id}</td>
							<td>{u.email}</td>
							<td>{u.role}</td>
							<td>{u.active ? "Yes" : "No"}</td>
							<td>
								<Button variant="danger" size="sm" onClick={() => deleteUser.mutate(u.id)}>
									Delete
								</Button>
							</td>
						</tr>
					))}
				</tbody>
			</Table>

			<h3>Create user</h3>
			<Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Email</Form.Label>
					<Form.Control
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Password</Form.Label>
					<Form.Control
						value={password}
						onChange={(e) => setPassword(e.target.value)}
						type="password"
						required
					/>
				</Form.Group>
				<Button type="submit">Create</Button>
			</Form>
		</div>
	);
}
