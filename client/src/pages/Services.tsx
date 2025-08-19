import { Table } from 'react-bootstrap';
import { useServices } from '../api/hooks/useServices';

export default function Services() {
	const { data, isLoading, error } = useServices();
	if (isLoading) return <p>Loading…</p>;
	if (error) return <p>Failed to load services.</p>;
	return (
		<div>
			<h1>Services</h1>
			<Table striped bordered hover size="sm">
				<thead><tr><th>Name</th><th>Price</th><th>Description</th></tr></thead>
				<tbody>
					{(data ?? []).map(s => (
						<tr key={s.id}><td>{s.name}</td><td>${s.price}</td><td>{s.description}</td></tr>
					))}
				</tbody>
			</Table>
		</div>
	);
}
