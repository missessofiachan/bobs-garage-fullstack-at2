import { useState } from 'react';
import { Button, Form, Image, Table } from 'react-bootstrap';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/ToastProvider';
import {
  useCreateStaff,
  useDeleteStaff,
  useStaffList,
  useUpdateStaff,
  useUploadStaffPhoto,
} from '../../hooks/useStaff';
import { getImageBaseUrl } from '../../utils/api';
import { formatErrorMessageWithId } from '../../utils/errorFormatter';
import { getImageSrc } from '../../utils/imagePlaceholder';

export default function StaffAdmin() {
  const { data, isLoading, error } = useStaffList();
  const { notify } = useToast();
  const createStaff = useCreateStaff({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Staff member created successfully',
        variant: 'success',
      });
      setName('');
      setRole('Staff');
      setBio('');
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
  const updateStaff = useUpdateStaff({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Staff member updated successfully',
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
  const deleteStaff = useDeleteStaff({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Staff member deleted successfully',
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
  const uploadPhoto = useUploadStaffPhoto({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'Photo uploaded successfully',
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
  const [role, setRole] = useState('Staff');
  const [bio, setBio] = useState('');
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; name: string } | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    name: string;
    role: string;
    bio: string;
    active: boolean;
  } | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createStaff.mutateAsync({ name, role, bio, active: true });
  };

  const handleEditClick = (staff: (typeof data)[0]) => {
    setEditingId(staff.id);
    setEditForm({
      name: staff.name,
      role: staff.role || 'Staff',
      bio: staff.bio || '',
      active: staff.active,
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editForm) return;
    // Find the current staff member to preserve photoUrl
    const currentStaff = data?.find((s) => s.id === id);
    if (!currentStaff) return;

    // Close edit mode immediately for instant feedback
    setEditingId(null);
    setEditForm(null);

    // Build update payload, preserving photoUrl and filtering out undefined values
    const updatePayload: {
      id: number;
      name: string;
      role: string;
      bio: string;
      active: boolean;
      photoUrl?: string;
    } = {
      id,
      name: editForm.name,
      role: editForm.role,
      bio: editForm.bio,
      active: editForm.active,
    };

    // Only include photoUrl if it exists (preserve it)
    if (currentStaff.photoUrl) {
      updatePayload.photoUrl = currentStaff.photoUrl;
    }

    // Trigger mutation (optimistic update handles UI)
    updateStaff.mutate(updatePayload);
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
            <th>Active</th>
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
                      objectFit: 'cover',
                    }}
                    onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                      (e.currentTarget as HTMLImageElement).src = photoSrc;
                    }}
                  />
                  <div className="mt-1">
                    <input
                      className="form-control form-control-sm"
                      type="file"
                      accept="image/*"
                      aria-label={`Upload photo for ${m.name}`}
                      onChange={async (e) => {
                        const file = (e.currentTarget as HTMLInputElement).files?.[0];
                        setUploadError(null);
                        if (file) {
                          try {
                            await uploadPhoto.mutateAsync({ id: m.id, file });
                          } catch {
                            setUploadError('Failed to upload photo. Please try again.');
                          }
                        }
                        (e.currentTarget as HTMLInputElement).value = '';
                      }}
                    />
                  </div>
                  {uploadError && <div className="text-danger small mt-1">{uploadError}</div>}
                </td>
                <td>
                  {editingId === m.id && editForm ? (
                    <Form.Control
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      size="sm"
                      required
                      minLength={1}
                    />
                  ) : (
                    <span style={{ fontWeight: '500' }}>{m.name}</span>
                  )}
                </td>
                <td>
                  {editingId === m.id && editForm ? (
                    <Form.Control
                      type="text"
                      value={editForm.role}
                      onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                      size="sm"
                    />
                  ) : (
                    m.role || 'Staff'
                  )}
                </td>
                <td>
                  {editingId === m.id && editForm ? (
                    <Form.Check
                      type="checkbox"
                      checked={editForm.active}
                      onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    />
                  ) : m.active ? (
                    'Yes'
                  ) : (
                    'No'
                  )}
                </td>
                <td className="d-flex gap-2">
                  {editingId === m.id && editForm ? (
                    <>
                      <Button
                        size="sm"
                        variant="success"
                        onClick={() => handleSaveEdit(m.id)}
                        disabled={updateStaff.isPending}
                      >
                        {updateStaff.isPending ? 'Saving...' : 'Save'}
                      </Button>
                      <Button size="sm" variant="secondary" onClick={handleCancelEdit}>
                        Cancel
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => handleEditClick(m)}
                        disabled={editingId !== null}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => handleDeleteClick(m.id, m.name)}
                        disabled={deleteStaff.isPending || editingId !== null}
                      >
                        {deleteStaff.isPending ? 'Deleting...' : 'Delete'}
                      </Button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </Table>

      {editingId !== null && editForm && (
        <div className="mt-4 mb-4">
          <h4>Edit Bio</h4>
          <Form.Group className="mb-3">
            <Form.Label>Biography</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Enter staff member biography..."
            />
          </Form.Group>
        </div>
      )}

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
        <Form.Group className="mb-2">
          <Form.Label>Role</Form.Label>
          <Form.Control value={role} onChange={(e) => setRole(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Biography</Form.Label>
          <Form.Control
            as="textarea"
            rows={3}
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Enter staff member biography..."
          />
        </Form.Group>
        <Button type="submit" disabled={createStaff.isPending}>
          {createStaff.isPending ? 'Creating...' : 'Create'}
        </Button>
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
