import { Button, Table } from 'react-bootstrap';
import { useServices } from '../api/hooks/useServices';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../a/store';
import { addFavorite, removeFavorite } from '../slices/favorites.slice';
import Loading from '../components/ui/Loading';
import usePageTitle from '../a/usePageTitle';

export default function Services() {
	const { data, isLoading, error } = useServices();
	const favorites = useSelector((s: RootState) => s.favorites.items);
	const dispatch = useDispatch();
	usePageTitle('Services');
	if (isLoading) return <Loading message="Loading services…" />;
	if (error) return <p>Failed to load services.</p>;
	return (
		<div>
			<h1>Services</h1>
			<Table striped bordered hover size="sm">
				<thead><tr><th>Name</th><th>Price</th><th>Description</th><th>Fav</th></tr></thead>
				<tbody>
					{(data ?? []).map(s => {
						const isFav = favorites.includes(s.id);
						return (
							<tr key={s.id}>
								<td>{s.name}</td>
								<td>${s.price}</td>
								<td>{s.description}</td>
								<td style={{ width: 80 }}>
									{isFav ? (
										<Button size="sm" variant="outline-danger" onClick={() => dispatch(removeFavorite(s.id))}>
											Unfavorite
										</Button>
									) : (
										<Button size="sm" variant="outline-primary" onClick={() => dispatch(addFavorite(s.id))}>
											Favorite
										</Button>
									)}
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>
		</div>
	);
}
