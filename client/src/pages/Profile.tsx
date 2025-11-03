import { useEffect, useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import api from '../api/axios';
import type { UserMeDTO } from '../api/types';
import Loading from '../components/ui/Loading';
import usePageTitle from '../hooks/usePageTitle';

export default function Profile() {
  const [me, setMe] = useState<UserMeDTO | null>(null);
  const [email, setEmail] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | undefined>();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get<UserMeDTO>('/users/me');
        setMe(data);
        setEmail(data.email);
      } catch {
        setMsg('Failed to load profile');
      }
    })();
  }, []);

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(undefined);
    try {
      await api.put('/users/me', { email });
      setMsg('Saved');
    } catch {
      setMsg('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  usePageTitle('My profile');
  if (!me) return <Loading message="Loading profile…" />;

  return (
    <div>
      <h1>Profile</h1>
      <Form onSubmit={onSave} style={{ maxWidth: 420 }}>
        <Form.Group className="mb-3">
          <Form.Label>Email</Form.Label>
          <Form.Control
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            required
          />
        </Form.Group>
        <Button type="submit" disabled={saving}>
          {saving ? 'Saving…' : 'Save'}
        </Button>
        {msg && <div className="mt-2">{msg}</div>}
      </Form>
    </div>
  );
}
