import { useState } from 'react';
import { Button, Form, Table } from 'react-bootstrap';
import type { AdminUserDTO } from '../../api/types';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Loading from '../../components/ui/Loading';
import { useToast } from '../../components/ui/ToastProvider';
import {
  useAdminUsers,
  useCreateAdminUser,
  useDeleteAdminUser,
  useUpdateAdminUser,
} from '../../hooks/useAdminUsers';
import usePageTitle from '../../hooks/usePageTitle';
import { formatErrorMessageWithId } from '../../utils/errorFormatter';

export default function UsersAdmin() {
  const { data, isLoading, error } = useAdminUsers();
  const { notify } = useToast();
  const createUser = useCreateAdminUser({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'User created successfully',
        variant: 'success',
      });
      setEmail('');
      setPassword('');
      setRole('user');
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
  const updateUser = useUpdateAdminUser({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'User updated successfully',
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
      // Reopen edit mode on error so user can try again
      // Note: editForm state is already cleared, so we'd need to restore it
      // For now, user can click Edit again if needed
    },
  });
  const deleteUser = useDeleteAdminUser({
    onSuccess: () => {
      notify({
        title: 'Success',
        body: 'User deleted successfully',
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

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<{
    email: string;
    role: 'user' | 'admin';
    active: boolean;
    password: string;
  } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ id: number; email: string } | null>(null);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await createUser.mutateAsync({
      email,
      password,
      role,
      active: true,
    });
  };

  const handleEditClick = (user: AdminUserDTO) => {
    setEditingId(user.id);
    setEditForm({
      email: user.email,
      role: user.role,
      active: user.active,
      password: '',
    });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditForm(null);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editForm) return;
    const updateData: {
      email?: string;
      role?: 'user' | 'admin';
      active?: boolean;
      password?: string;
    } = {
      email: editForm.email,
      role: editForm.role,
      active: editForm.active,
    };
    // Only include password if it's been changed (not empty)
    if (editForm.password) {
      updateData.password = editForm.password;
    }
    // Close edit mode immediately for instant feedback (optimistic update handles UI)
    setEditingId(null);
    setEditForm(null);
    // Trigger mutation (optimistic update will update UI immediately)
    updateUser.mutate({ id, ...updateData });
  };

  const handleDeleteClick = (id: number, userEmail: string) => {
    setDeleteConfirm({ id, email: userEmail });
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirm) {
      deleteUser.mutate(deleteConfirm.id);
      setDeleteConfirm(null);
    }
  };

  usePageTitle('Admin — Users');

  if (isLoading) return <Loading message="Loading users…" />;
  if (error) return <p>Failed to load users.</p>;

  return (
    <div>
      <h2>Users Admin</h2>
      <Table striped bordered hover size="sm">
        <thead>
          <tr>
            <th>ID</th>
            <th>Email</th>
            <th>Role</th>
            <th>Active</th>
            <th>Created</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {(data ?? []).map((u) => (
            <tr key={u.id}>
              <td>{u.id}</td>
              <td>
                {editingId === u.id && editForm ? (
                  <Form.Control
                    type="email"
                    value={editForm.email}
                    onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                    size="sm"
                    required
                  />
                ) : (
                  u.email
                )}
              </td>
              <td>
                {editingId === u.id && editForm ? (
                  <Form.Select
                    value={editForm.role}
                    onChange={(e) =>
                      setEditForm({
                        ...editForm,
                        role: e.target.value as 'user' | 'admin',
                      })
                    }
                    size="sm"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </Form.Select>
                ) : (
                  u.role
                )}
              </td>
              <td>
                {editingId === u.id && editForm ? (
                  <Form.Check
                    type="switch"
                    id={`active-${u.id}`}
                    checked={editForm.active}
                    onChange={(e) => setEditForm({ ...editForm, active: e.target.checked })}
                    aria-label={`Toggle active for ${u.email}`}
                  />
                ) : u.active ? (
                  'Yes'
                ) : (
                  'No'
                )}
              </td>
              <td>{u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}</td>
              <td>
                {editingId === u.id && editForm ? (
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() => handleSaveEdit(u.id)}
                      disabled={updateUser.isPending}
                    >
                      {updateUser.isPending ? 'Saving...' : 'Save'}
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleCancelEdit}
                      disabled={updateUser.isPending}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="d-flex gap-2">
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => handleEditClick(u)}
                      disabled={editingId !== null}
                    >
                      Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => handleDeleteClick(u.id, u.email)}
                      disabled={deleteUser.isPending || editingId !== null}
                    >
                      {deleteUser.isPending ? 'Deleting...' : 'Delete'}
                    </Button>
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      {editingId && editForm && (
        <div className="mt-3 p-3 border rounded">
          <h4>Change Password (Optional)</h4>
          <Form.Group className="mb-3" style={{ maxWidth: 360 }}>
            <Form.Label>New Password</Form.Label>
            <Form.Control
              type="password"
              value={editForm.password}
              onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
              placeholder="Leave empty to keep current password"
              minLength={8}
            />
            <Form.Text className="text-muted">
              Minimum 8 characters. Leave empty to keep current password.
            </Form.Text>
          </Form.Group>
        </div>
      )}

      <h3 className="mt-4">Create User</h3>
      <Form onSubmit={onCreate} style={{ maxWidth: 360 }}>
        <Form.Group className="mb-2">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
            disabled={createUser.isPending}
          />
        </Form.Group>
        <Form.Group className="mb-2">
          <Form.Label>Password</Form.Label>
          <Form.Control
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            required
            minLength={8}
            disabled={createUser.isPending}
          />
          <Form.Text className="text-muted">Minimum 8 characters</Form.Text>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Role</Form.Label>
          <Form.Select
            value={role}
            onChange={(e) => setRole(e.target.value as 'user' | 'admin')}
            disabled={createUser.isPending}
          >
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </Form.Select>
        </Form.Group>
        <Button type="submit" disabled={createUser.isPending}>
          {createUser.isPending ? 'Creating...' : 'Create User'}
        </Button>
      </Form>

      <ConfirmDialog
        open={deleteConfirm !== null}
        onOpenChange={(open) => {
          if (!open) {
            setDeleteConfirm(null);
          }
        }}
        title="Delete User"
        description={`Are you sure you want to delete user "${deleteConfirm?.email}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        variant="danger"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}
