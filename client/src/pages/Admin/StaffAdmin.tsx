import { useState } from 'react';
import { Button, Form, Image, Table } from 'react-bootstrap';
import { useStaffList, useCreateStaff, useDeleteStaff, useUploadStaffPhoto } from '../../api/hooks/useStaff';

export default function StaffAdmin() {
	const { data, isLoading, error } = useStaffList();
	const createStaff = useCreateStaff();
	const deleteStaff = useDeleteStaff();
	const uploadPhoto = useUploadStaffPhoto();
	const [name, setName] = useState('');
	const [role, setRole] = useState('Staff');
	const [uploadError, setUploadError] = useState<string | null>(null);

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
				<thead><tr><th>ID</th><th>Photo</th><th>Name</th><th>Role</th><th>Actions</th></tr></thead>
				<tbody>
					{(data ?? []).map(m => (
						<tr key={m.id}>
							<td>{m.id}</td>
							<td style={{ width: 140 }}>
								{m.photoUrl ? (
									<Image src={m.photoUrl} alt={m.name} thumbnail style={{ maxWidth: 120, maxHeight: 120, objectFit: 'cover' }} />
								) : (
									<div className="text-muted small">No photo</div>
								)}
								<div className="mt-1">
									<input
									  className="form-control form-control-sm"
									  type="file"
									  accept="image/*"
									  onChange={async (e) => {
										const file = (e.currentTarget as HTMLInputElement).files?.[0];
										setUploadError(null);
										if (file) {
											try {
												await uploadPhoto.mutateAsync({ id: m.id, file });
											} catch (err: any) {
												setUploadError('Failed to upload photo. Please try again.');
											}
										}
										(e.currentTarget as HTMLInputElement).value = '';
									  }}
									/>
								</div>
								{uploadError && (
									<div className="text-danger small mt-1">{uploadError}</div>
								)}
							</td>
							<td>{m.name}</td>
							<td>{m.role}</td>
							<td className="d-flex gap-2">
								<Button size="sm" variant="danger" onClick={() => deleteStaff.mutate(m.id)}>Delete</Button>
							</td>
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
