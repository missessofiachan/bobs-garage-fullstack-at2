import { useMemo, useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { useServices } from '../hooks/useServices';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store/store';
import { addFavorite, removeFavorite } from '../slices/favorites.slice';
import Loading from '../components/ui/Loading';
import usePageTitle from '../hooks/usePageTitle';
import { formatCurrency } from '../utils/formatters';

export default function Services() {
  const { data, isLoading, error, refetch } = useServices();
  const favorites = useSelector((s: RootState) => s.favorites.items);
  const dispatch = useDispatch();
  usePageTitle('Services');
  const [q, setQ] = useState('');
  const [sort, setSort] = useState<'price-asc' | 'price-desc'>('price-asc');

  const list = useMemo(() => {
    let arr = (data ?? []).filter((s) => s.published !== false);
    if (q)
      arr = arr.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
    arr = arr.sort((a, b) =>
      sort === 'price-asc' ? a.price - b.price : b.price - a.price,
    );
    return arr;
  }, [data, q, sort]);

  if (isLoading) return <Loading message="Loading services…" />;
  if (error)
    return (
      <div className="alert alert-danger d-flex align-items-center justify-content-between">
        <div>Failed to load services.</div>
        <Button size="sm" variant="outline-light" onClick={() => refetch()}>
          Retry
        </Button>
      </div>
    );
  return (
    <div>
      <h1>Services</h1>
      <Row className="g-2 mb-3">
        <Col xs={12} md={6} lg={4}>
          <Form.Control
            placeholder="Search by name"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Filter services by name"
          />
        </Col>
        <Col xs="auto">
          <Form.Select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            aria-label="Sort by price"
          >
            <option value="price-asc">Price: Low → High</option>
            <option value="price-desc">Price: High → Low</option>
          </Form.Select>
        </Col>
      </Row>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>Name</th>
            <th>Price</th>
            <th>Description</th>
            <th>Fav</th>
          </tr>
        </thead>
        <tbody>
          {list.map((s) => {
            const isFav = favorites.includes(s.id);
            return (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>{formatCurrency(s.price)}</td>
                <td>{s.description}</td>
                <td style={{ width: 80 }}>
                  {isFav ? (
                    <Button
                      size="sm"
                      variant="outline-danger"
                      onClick={() => dispatch(removeFavorite(s.id))}
                    >
                      Unfavorite
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline-primary"
                      onClick={() => dispatch(addFavorite(s.id))}
                    >
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
