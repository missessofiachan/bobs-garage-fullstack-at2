import { useMemo, useState } from "react";
import { Button, Col, Form, Row, Table, Image } from "react-bootstrap";
import { useServices } from "../hooks/useServices";
import { useFavorites } from "../hooks/useFavorites";
import Loading from "../components/ui/Loading";
import usePageTitle from "../hooks/usePageTitle";
import { formatCurrency } from "../utils/formatters";
import { useToast } from "../components/ui/ToastProvider";
import { getImageBaseUrl } from "../utils/api";

export default function Services() {
	const { data, isLoading, error, refetch } = useServices();
	const { isFavorite, addFavorite, removeFavorite } = useFavorites();
	const { notify } = useToast();
	usePageTitle("Services");
	const [q, setQ] = useState("");
	const [sort, setSort] = useState<"price-asc" | "price-desc">("price-asc");

	const list = useMemo(() => {
		let arr = (data ?? []).filter((s) => s.published !== false);
		if (q) arr = arr.filter((s) => s.name.toLowerCase().includes(q.toLowerCase()));
		arr = arr.sort((a, b) => (sort === "price-asc" ? a.price - b.price : b.price - a.price));
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
						<th style={{ width: 120 }}>Image</th>
						<th>Name</th>
						<th>Price</th>
						<th>Description</th>
						<th>Fav</th>
					</tr>
				</thead>
				<tbody>
					{list.map((s) => {
						const isFav = isFavorite(s.id);
						const imageSrc = s.imageUrl
							? s.imageUrl.startsWith("http")
								? s.imageUrl
								: `${getImageBaseUrl()}${s.imageUrl}`
							: undefined;

						const handleToggleFavorite = async () => {
							try {
								if (isFav) {
									await removeFavorite(s.id);
									notify({ body: "Removed from favorites", variant: "success" });
								} else {
									await addFavorite(s.id);
									notify({ body: "Added to favorites", variant: "success" });
								}
							} catch (err: any) {
								const message =
									err.response?.data?.message || "Failed to update favorite";
								notify({ body: message, variant: "danger" });
							}
						};

						return (
							<tr key={s.id}>
								<td>
									{imageSrc ? (
										<Image
											src={imageSrc}
											alt={s.name}
											thumbnail
											style={{
												maxWidth: 100,
												maxHeight: 100,
												objectFit: "cover",
												width: "100%",
												height: "auto",
											}}
											onError={(e) => {
												(e.currentTarget as HTMLImageElement).style.display = "none";
											}}
										/>
									) : (
										<div className="text-muted small">No image</div>
									)}
								</td>
								<td>{s.name}</td>
								<td>{formatCurrency(s.price)}</td>
								<td>{s.description}</td>
								<td style={{ width: 80 }}>
									{isFav ? (
										<Button
											size="sm"
											variant="outline-danger"
											onClick={handleToggleFavorite}
										>
											Unfavorite
										</Button>
									) : (
										<Button
											size="sm"
											variant="outline-primary"
											onClick={handleToggleFavorite}
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
