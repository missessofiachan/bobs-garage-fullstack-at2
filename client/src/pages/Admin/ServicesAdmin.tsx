import { useState } from 'react';
import { Button, Form, Image, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/ToastProvider';
import {
  useCreateService,
  useDeleteService,
  useServices,
  useUpdateService,
  useUploadServiceImage,
} from '../../hooks/useServices';
import { getImageBaseUrl } from '../../utils/api';
import { formatErrorMessageWithId } from '../../utils/errorFormatter';
import { getImageSrc } from '../../utils/imagePlaceholder';

export default function ServicesAdmin() {
  const { data, isLoading, error } = useServices();
  const { notify } = useToast();
  const createService = useCreateService({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Service created successfully',
        variant: 'success',
      });
      setName('');
      setPrice(0);
      setDescription('');
    },
    onError: (err: unknown) => {
      const { message, requestId } = formatErrorMessageWithId(err);
      notify({
        title: 'Create Failed',
        body: message,
        variant: 'danger',
        requestId,
      });
    },
  });
  const deleteService = useDeleteService({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Service deleted successfully',
        variant: 'success',
      });
    },
    onError: (err: unknown) => {
      const { message, requestId } = formatErrorMessageWithId(err);
      notify({
        title: 'Delete Failed',
        body: message,
        variant: 'danger',
        requestId,
      });
    },
  });
  const updateService = useUpdateService({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Service updated successfully',
        variant: 'success',
      });
    },
    onError: (err: unknown) => {
      const { message, requestId } = formatErrorMessageWithId(err);
      notify({
        title: 'Update Failed',
        body: message,
        variant: 'danger',
        requestId,
      });
    },
  });
  const uploadImage = useUploadServiceImage({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Image uploaded successfully',
        variant: 'success',
      });
    },
    onError: (err: unknown) => {
      const { message, requestId } = formatErrorMessageWithId(err);
      notify({
        title: 'Upload Failed',
        body: message,
        variant: 'danger',
        requestId,
      });
    },
  });
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [description, setDescription] = useState('');
  const [progress, setProgress] = useState<Record<number, number>>({});
  const [preview, setPreview] = useState<Record<number, string>>({});
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    price: number;
    description: string;
    published: boolean;
  } | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createService.mutateAsync({
      name,
      price,
      description,
      published: true,
    });
  };

  const handleEditClick = (service: (typeof data)[0]) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      price: service.price,
      description: service.description,
      published: service.published,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editForm) return;
    // Close edit mode immediately for instant feedback
    setEditingId(null);
    setEditForm(null);
    // Trigger mutation (optimistic update handles UI)
    updateService.mutate({ id, ...editForm });
  };

  const handleDeleteClick = (id: number, serviceName: string) => {
    setDeleteConfirm({ id, name: serviceName });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteService.mutate(deleteConfirm.id);
      setDeleteConfirm(null);
    }
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
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((s) => {
            const imageSrc = getImageSrc(s.imageUrl, getImageBaseUrl());
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
                      objectFit: 'cover',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
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
                          objectFit: 'cover',
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
                        (e.currentTarget as HTMLInputElement).value = '';
                      }}
                    />
                    {progress[s.id] ? (
                      <div className="small text-muted">{progress[s.id]}%</div>
                    ) : null}
                  </div>
                </td>
                <td>
                  {editingId === s.id && editForm ? (
                    <Form.Control
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      size="sm"
                      required
                      minLength={2}
                    />
                  ) : (
                    <Link
                      to={`/services/${s.id}`}
                      style={{ textDecoration: 'none', color: 'inherit', fontWeight: '500' }}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.name}
                    </Link>
                  )}
                </td>
                <td>
                  {editingId === s.id && editForm ? (
                    <Form.Control
                      type="number"
                      value={editForm.price}
                      onChange={(e) =>
                        setEditForm({ ...editForm, price: Number(e.target.value) || 0 })
                      }
                      size="sm"
                      min={0}
                      step="0.01"
                      required
                    />
                  ) : (
                    `$${s.price}`
                  )}
                </td>
                <td>
                  {editingId === s.id && editForm ? (
                    <Form.Check
                      type="checkbox"
                      checked={editForm.published}
                      onChange={(e) => setEditForm({ ...editForm, published: e.target.checked })}
                    />
                  ) : s.published ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td className="d-flex gap-2">
                  {editingId === s.id && editForm ? (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleSaveEdit(s.id)}
                        disabled={updateService.isPending}
                      >
                        {updateService.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={handleCancelEdit}
                        disabled={updateService.isPending}
                      >
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleEditClick(s)}
                        disabled={editingId !== null}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(s.id, s.name)}
                        disabled={deleteService.isPending || editingId !== null}
                      >
                        {deleteService.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {editingId && editForm && (
        <div className="mt-3 p-3 border rounded">
          <h4>Edit Description</h4>
          <Form.Group className="mb-3" style={{ maxWidth: 600 }}>
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              value={editForm.description}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              required
              minLength={2}
            />
          </Form.Group>
        </div>
      )}

      <h3 className="mt-4">Create Service</h3>
      <Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
        <Form.Group className="mb-2">
          <Form.Label>Name</Form.Label>
          <Form.Control
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            minLength={2}
            disabled={createService.isPending}
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
            disabled={createService.isPending}
          />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Description</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            minLength={2}
            disabled={createService.isPending}
          />
        </Form.Group>
        <Button type="submit" disabled={createService.isPending}>
          {createService.isPending ? 'Creating...' : 'Create Service'}
        </Button>
      </Form>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirm(null);
          }
        }}
        title="Delete Service"
        description={`Are you sure you want to delete "${deleteConfirm?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
