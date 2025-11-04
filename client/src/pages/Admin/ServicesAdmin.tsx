import { useState } from "react";
import { Button, Form, Image, Table } from "react-bootstrap";
import {
	useServices,
	useCreateService,
	useDeleteService,
	useUpdateService,
	useUploadServiceImage,
} from "../../hooks/useServices";
import Loading from "../../components/ui/Loading";
import { getImageSrc } from "../../utils/imagePlaceholder";

export default function ServicesAdmin() {
	const { data, isLoading, error } = useServices();
	const createService = useCreateService();
	const deleteService = useDeleteService();
	const updateService = useUpdateService();
	const uploadImage = useUploadServiceImage();
	const [name, setName] = useState("");
	const [price, setPrice] = useState<number>(0);
	const [description, setDescription] = useState("");
	const [progress, setProgress] = useState<Record<number, number>>({});
	const [preview, setPreview] = useState<Record<number, string>>({});

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		await createService.mutateAsync({
			name,
			price,
			description,
			published: true,
		});
		setName("");
		setPrice(0);
		setDescription("");
	};

	if (isLoading) return <Loading message="Loading services…" />;
	if (error) return <p>Failed to load services.</p>;

	return (
		<div>
			<h2>Services Admin</h2>
			<Table striped bordered hover size="sm">
				<thead>
					<tr>
						<th>ID</th>
						<th>Image</th>
						<th>Name</th>
						<th>Price</th>
						<th>Published</th>
						<th></th>
					</tr>
				</thead>
				<tbody>
					{(data ?? []).map((s) => {
						const imageSrc = getImageSrc(s.imageUrl);
						return (
							<tr key={s.id}>
								<td>{s.id}</td>
								<td style={{ width: 160 }}>
									<Image
										src={imageSrc}
										alt={s.name}
										thumbnail
										style={{
											maxWidth: 120,
											maxHeight: 120,
											objectFit: "cover",
										}}
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).src = imageSrc;
										}}
									/>
								{preview[s.id] && (
									<div className="mt-1">
										<Image
											src={preview[s.id]}
											alt="Preview"
											thumbnail
											style={{
												maxWidth: 120,
												maxHeight: 120,
												objectFit: "cover",
											}}
										/>
									</div>
								)}
									<div className="mt-1">
										<input
											className="form-control form-control-sm"
											type="file"
											accept="image/*"
											aria-label={`Upload image for ${s.name}`}
											onChange={async (e) => {
												const file = (e.currentTarget as HTMLInputElement).files?.[0];
												if (file) {
													const url = URL.createObjectURL(file);
													setPreview((p) => ({ ...p, [s.id]: url }));
													setProgress((p) => ({ ...p, [s.id]: 0 }));
													await uploadImage.mutateAsync({
														id: s.id,
														file,
														onProgress: (pct) => setProgress((p) => ({ ...p, [s.id]: pct })),
													});
													setProgress((p) => ({ ...p, [s.id]: 0 }));
													URL.revokeObjectURL(url);
													setPreview(({ [s.id]: _omit, ...rest }) => rest);
												}
												(e.currentTarget as HTMLInputElement).value = "";
											}}
										/>
										{progress[s.id] ? (
											<div className="small text-muted">{progress[s.id]}%</div>
										) : null}
									</div>
								</td>
								<td>{s.name}</td>
								<td>${s.price}</td>
								<td>
									<Form.Check
										type="switch"
										id={`pub-${s.id}`}
										checked={!!s.published}
										onChange={(e) =>
											updateService.mutate({
												id: s.id,
												published: e.target.checked,
											})
										}
										aria-label={`Toggle published for ${s.name}`}
									/>
								</td>
								<td className="d-flex gap-2">
									<Button size="sm" variant="danger" onClick={() => deleteService.mutate(s.id)}>
										Delete
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>

			<h3>Create service</h3>
			<Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Name</Form.Label>
					<Form.Control
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						minLength={2}
					/>
				</Form.Group>
				<Form.Group className="mb-2">
					<Form.Label>Price</Form.Label>
					<Form.Control
						value={price}
						onChange={(e) => setPrice(Number(e.target.value) || 0)}
						type="number"
						min={0}
						step="0.01"
						required
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Description</Form.Label>
					<Form.Control
						value={description}
						onChange={(e) => setDescription(e.target.value)}
						required
						minLength={2}
					/>
				</Form.Group>
				<Button type="submit">Create</Button>
			</Form>
		</div>
	);
}
