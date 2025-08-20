import usePageTitle from '../a/usePageTitle';
import { Form } from 'react-bootstrap';
import DSButton from '../components/ui/ds/Button';
import { useAppDispatch, useAppSelector } from '../a/hooks';
import { setServicesSort, setServicesView, setThemeDefault, type ThemeChoice, type ServicesSort, type ServicesView } from '../slices/preferences.slice';
import { vars } from '../styles/theme.css';

export default function Settings() {
  usePageTitle('Settings');
  const dispatch = useAppDispatch();
  const prefs = useAppSelector(s => s.preferences);

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('theme-default', prefs.theme);
    localStorage.setItem('services-sort', prefs.servicesSort);
    localStorage.setItem('services-view', prefs.servicesView);
  };
  return (
    <div>
      <h1>Settings</h1>
      <Form onSubmit={onSave} style={{ maxWidth: 520 }}>
        <fieldset>
          <legend style={{ color: vars.color.muted }}>Theme</legend>
          <Form.Select
            aria-label="Theme default"
            value={prefs.theme}
            onChange={e => dispatch(setThemeDefault(e.target.value as ThemeChoice))}
            className="mb-3"
          >
            <option value="light">Light</option>
            <option value="dark">Dark</option>
            <option value="system">System</option>
          </Form.Select>
        </fieldset>

        <fieldset>
          <legend style={{ color: vars.color.muted }}>Services preferences</legend>
          <Form.Group className="mb-3">
            <Form.Label>Default sort</Form.Label>
            <Form.Select
              value={prefs.servicesSort}
              onChange={e => dispatch(setServicesSort(e.target.value as ServicesSort))}
            >
              <option value="price-asc">Price: Low → High</option>
              <option value="price-desc">Price: High → Low</option>
            </Form.Select>
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Default view</Form.Label>
            <Form.Select
              value={prefs.servicesView}
              onChange={e => dispatch(setServicesView(e.target.value as ServicesView))}
            >
              <option value="grid">Grid</option>
              <option value="list">List</option>
            </Form.Select>
          </Form.Group>
        </fieldset>

  <DSButton type="submit" tone="primary">Save</DSButton>
      </Form>
    </div>
  );
}
