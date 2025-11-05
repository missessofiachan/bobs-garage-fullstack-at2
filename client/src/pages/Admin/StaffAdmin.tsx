import { useState } from "react";
import { Button, Form, Image, Table } from "react-bootstrap";
import Loading from "../../components/ui/Loading";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { useToast } from "../../components/ui/ToastProvider";
import {
	useCreateStaff,
	useDeleteStaff,
	useStaffList,
	useUploadStaffPhoto,
} from "../../hooks/useStaff";
import { getImageSrc } from "../../utils/imagePlaceholder";
import { getImageBaseUrl } from "../../utils/api";
import { formatErrorMessageWithId } from "../../utils/errorFormatter";

export default function StaffAdmin() {
	const { data, isLoading, error } = useStaffList();
	const { notify } = useToast();
	const createStaff = useCreateStaff();
	const deleteStaff = useDeleteStaff({
		onSuccess: () => {
			notify({
				title: "Success",
				body: "Staff member deleted successfully",
				variant: "success",
			});
		},
		onError: (err) => {
			const { message, requestId } = formatErrorMessageWithId(err);
			notify({
				title: "Delete Failed",
				body: message,
				variant: "danger",
				requestId,
			});
		},
	});
	const uploadPhoto = useUploadStaffPhoto();
	const [name, setName] = useState("");
	const [role, setRole] = useState("Staff");
	const [uploadError, setUploadError] = useState<string | null>(null);
	const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);

	const onCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		await createStaff.mutateAsync({ name, role, active: true });
		setName("");
		setRole("Staff");
	};

	const handleDeleteClick = (id: number, staffName: string) => {
		setDeleteConfirm({ id, name: staffName });
	};

	const handleDeleteConfirm = () => {
		if (deleteConfirm) {
			deleteStaff.mutate(deleteConfirm.id);
			setDeleteConfirm(null);
		}
	};

	if (isLoading) return <Loading message="Loading staff…" />;
	if (error) return <p>Failed to load staff.</p>;
	return (
		<div>
			<h2>Staff Admin</h2>
			<Table striped bordered hover size="sm">
				<thead>
					<tr>
						<th>ID</th>
						<th>Photo</th>
						<th>Name</th>
						<th>Role</th>
						<th>Actions</th>
					</tr>
				</thead>
				<tbody>
					{(data ?? []).map((m) => {
						const photoSrc = getImageSrc(m.photoUrl, getImageBaseUrl());
						return (
							<tr key={m.id}>
								<td>{m.id}</td>
								<td style={{ width: 140 }}>
									<Image
										src={photoSrc}
										alt={m.name}
										thumbnail
										style={{
											maxWidth: 120,
											maxHeight: 120,
											objectFit: "cover",
										}}
										onError={(e) => {
											(e.currentTarget as HTMLImageElement).src = photoSrc;
										}}
									/>
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
													} catch {
														setUploadError("Failed to upload photo. Please try again.");
													}
												}
												(e.currentTarget as HTMLInputElement).value = "";
											}}
										/>
									</div>
									{uploadError && <div className="text-danger small mt-1">{uploadError}</div>}
								</td>
								<td>{m.name}</td>
								<td>{m.role}</td>
								<td className="d-flex gap-2">
									<Button
										size="sm"
										variant="danger"
										onClick={() => handleDeleteClick(m.id, m.name)}
										disabled={deleteStaff.isPending}
									>
										{deleteStaff.isPending ? "Deleting..." : "Delete"}
									</Button>
								</td>
							</tr>
						);
					})}
				</tbody>
			</Table>

			<h3>Create staff member</h3>
			<Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
				<Form.Group className="mb-2">
					<Form.Label>Name</Form.Label>
					<Form.Control
						value={name}
						onChange={(e) => setName(e.target.value)}
						required
						minLength={1}
					/>
				</Form.Group>
				<Form.Group className="mb-3">
					<Form.Label>Role</Form.Label>
					<Form.Control value={role} onChange={(e) => setRole(e.target.value)} />
				</Form.Group>
				<Button type="submit">Create</Button>
			</Form>

			<ConfirmDialog
				open={deleteConfirm !== null}
				onOpenChange={(open) => {
					if (!open) {
						setDeleteConfirm(null);
					}
				}}
				title="Delete Staff Member"
				description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
				confirmLabel="Delete"
				cancelLabel="Cancel"
				variant="danger"
				onConfirm={handleDeleteConfirm}
			/>
		</div>
	);
}
