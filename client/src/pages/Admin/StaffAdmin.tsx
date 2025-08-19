import { useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { useStaffList, useCreateStaff, useDeleteStaff } from '../../api/hooks/useStaff';

export default function StaffAdmin() {
	const { data, isLoading, error } = useStaffList();
	const createStaff = useCreateStaff();
	const deleteStaff = useDeleteStaff();
	const [name, setName] = useState('');
	const [role, setRole] = useState('Staff');

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		await createStaff.mutateAsync({ name, role, active: true });
		setName(''); setRole('Staff');
	};

	if (isLoading) return <p>Loading…</p>;
	if (error) return <p>Failed to load staff.</p>;
	return (
		<div>
			<h2>Staff Admin</h2>
			<Table striped bordered hover size="sm">
				<thead><tr><th>ID</th><th>Name</th><th>Role</th><th></th></tr></thead>
				<tbody>
					{(data ?? []).map(m => (
						<tr key={m.id}>
							<td>{m.id}</td>
							<td>{m.name}</td>
							<td>{m.role}</td>
							<td><Button size="sm" variant="danger" onClick={() => deleteStaff.mutate(m.id)}>Delete</Button></td>
						</tr>
					))}
				</tbody>
			</Table>

			<h3>Create staff member</h3>
			<Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Name</Form.Label>
					<Form.Control value={name} onChange={e=>setName(e.target.value)} required minLength={1} />
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Role</Form.Label>
					<Form.Control value={role} onChange={e=>setRole(e.target.value)} />
				</Form.Group>
				<Button type="submit">Create</Button>
			</Form>
		</div>
	);
}
