import { useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import { useServices, useCreateService, useDeleteService } from '../../api/hooks/useServices';
import Loading from '../../components/ui/Loading';

export default function ServicesAdmin() {
	const { data, isLoading, error } = useServices();
	const createService = useCreateService();
	const deleteService = useDeleteService();
	const [name, setName] = useState('');
	const [price, setPrice] = useState<number>(0);
	const [description, setDescription] = useState('');

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		await createService.mutateAsync({ name, price, description, published: true });
		setName(''); setPrice(0); setDescription('');
	};

	if (isLoading) return <Loading message="Loading services…" />;
	if (error) return <p>Failed to load services.</p>;
	return (
		<div>
			<h2>Services Admin</h2>
			<Table striped bordered hover size="sm">
				<thead><tr><th>ID</th><th>Name</th><th>Price</th><th></th></tr></thead>
				<tbody>
					{(data ?? []).map(s => (
						<tr key={s.id}>
							<td>{s.id}</td>
							<td>{s.name}</td>
							<td>${s.price}</td>
							<td><Button size="sm" variant="danger" onClick={() => deleteService.mutate(s.id)}>Delete</Button></td>
						</tr>
					))}
				</tbody>
			</Table>

			<h3>Create service</h3>
			<Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Name</Form.Label>
					<Form.Control value={name} onChange={e=>setName(e.target.value)} required minLength={2} />
				</Form.Group>
				<Form.Group className="mb-2">
					<Form.Label>Price</Form.Label>
					<Form.Control value={price} onChange={e=>setPrice(Number(e.target.value)||0)} type="number" min={0} step="0.01" required />
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Description</Form.Label>
					<Form.Control value={description} onChange={e=>setDescription(e.target.value)} required minLength={2} />
				</Form.Group>
				<Button type="submit">Create</Button>
			</Form>
		</div>
	);
}
