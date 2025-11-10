/**
 * @author Bob's Garage Team
 * @purpose Enhanced settings page with comprehensive user preferences
 * @version 2.0.0
 */

import { useState } from 'react';
import { Accordion, Alert, Button, Card, Col, Form, Modal, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import DSButton from '../components/buttons/Button';
import { useToast } from '../components/ui/ToastProvider';
import { useAppDispatch, useAppSelector } from '../hooks/hooks';
import { useFavorites } from '../hooks/useFavorites';
import usePageTitle from '../hooks/usePageTitle.ts';
import {
  type DateFormat,
  type Density,
  type FontSize,
  type Language,
  resetPreferences,
  type ServicesSort,
  type ServicesView,
  setAccessibilityHighContrast,
  setAccessibilityReducedMotion,
  setAnimationsEnabled,
  setDateFormat,
  setDensity,
  setFontSize,
  setLanguage,
  setNotificationsEmail,
  setNotificationsMarketing,
  setServicesSort,
  setServicesView,
  setThemeDefault,
  type ThemeChoice,
} from '../slices/preferences.slice';
import type { RootState } from '../store/store';

export default function Settings() {
  usePageTitle('Settings');
  const dispatch = useAppDispatch();
  const prefs = useAppSelector((s: RootState) => s.preferences);
  const { notify } = useToast();
  const { favorites } = useFavorites();
  const accessToken = useSelector((s: any) => s.auth.accessToken);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);

  const saveToLocalStorage = () => {
    localStorage.setItem('theme-default', prefs.theme);
    localStorage.setItem('services-sort', prefs.servicesSort);
    localStorage.setItem('services-view', prefs.servicesView);
    localStorage.setItem('font-size', prefs.fontSize);
    localStorage.setItem('date-format', prefs.dateFormat);
    localStorage.setItem('language', prefs.language);
    localStorage.setItem('density', prefs.density);
    localStorage.setItem('animations-enabled', String(prefs.animationsEnabled));
    localStorage.setItem('notifications-email', String(prefs.notificationsEmail));
    localStorage.setItem('notifications-marketing', String(prefs.notificationsMarketing));
    localStorage.setItem('accessibility-high-contrast', String(prefs.accessibilityHighContrast));
    localStorage.setItem('accessibility-reduced-motion', String(prefs.accessibilityReducedMotion));
  };

  const onSave = (e: React.FormEvent) => {
    e.preventDefault();
    saveToLocalStorage();
    notify({ title: 'Success', body: 'Settings saved successfully', variant: 'success' });
  };

  const handleReset = () => {
    dispatch(resetPreferences());
    saveToLocalStorage();
    setShowResetModal(false);
    notify({ title: 'Success', body: 'Settings reset to defaults', variant: 'success' });
  };

  const handleClearCache = () => {
    // Clear localStorage except auth token
    const authToken = localStorage.getItem('accessToken');
    localStorage.clear();
    if (authToken) {
      localStorage.setItem('accessToken', authToken);
    }
    // Clear sessionStorage
    sessionStorage.clear();
    setShowClearCacheModal(false);
    notify({
      title: 'Success',
      body: 'Cache cleared. Please refresh the page.',
      variant: 'success',
    });
    setTimeout(() => window.location.reload(), 1000);
  };

  const handleExportFavorites = () => {
    if (favorites.length === 0) {
      notify({ body: 'No favorites to export', variant: 'warning' });
      return;
    }
    const dataStr = JSON.stringify(favorites, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `bobs-garage-favorites-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    notify({ title: 'Success', body: 'Favorites exported successfully', variant: 'success' });
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>Settings</h1>
        <div className="d-flex gap-2">
          <Button variant="outline-secondary" onClick={() => setShowResetModal(true)}>
            Reset to Defaults
          </Button>
        </div>
      </div>

      <Form onSubmit={onSave}>
        <Accordion defaultActiveKey={['display', 'services']} alwaysOpen>
          {/* Display Preferences */}
          <Accordion.Item eventKey="display">
            <Accordion.Header>
              <span style={{ fontWeight: 600 }}>Display Preferences</span>
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Theme</Form.Label>
                    <Form.Select
                      aria-label="Theme default"
                      value={prefs.theme}
                      onChange={(e) => dispatch(setThemeDefault(e.target.value as ThemeChoice))}
                    >
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                      <option value="system">System</option>
                    </Form.Select>
                    <Form.Text className="text-muted">Choose your preferred color theme</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Font Size</Form.Label>
                    <Form.Select
                      value={prefs.fontSize}
                      onChange={(e) => dispatch(setFontSize(e.target.value as FontSize))}
                    >
                      <option value="small">Small</option>
                      <option value="medium">Medium</option>
                      <option value="large">Large</option>
                    </Form.Select>
                    <Form.Text className="text-muted">Adjust text size for readability</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Interface Density</Form.Label>
                    <Form.Select
                      value={prefs.density}
                      onChange={(e) => dispatch(setDensity(e.target.value as Density))}
                    >
                      <option value="comfortable">Comfortable</option>
                      <option value="compact">Compact</option>
                    </Form.Select>
                    <Form.Text className="text-muted">
                      Control spacing and padding in the interface
                    </Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Animations</Form.Label>
                    <Form.Check
                      type="switch"
                      label="Enable animations and transitions"
                      checked={prefs.animationsEnabled}
                      onChange={(e) => dispatch(setAnimationsEnabled(e.target.checked))}
                    />
                    <Form.Text className="text-muted">
                      Toggle UI animations and transitions
                    </Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Services Preferences */}
          <Accordion.Item eventKey="services">
            <Accordion.Header>
              <span style={{ fontWeight: 600 }}>Services Preferences</span>
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Default Sort</Form.Label>
                    <Form.Select
                      value={prefs.servicesSort}
                      onChange={(e) => dispatch(setServicesSort(e.target.value as ServicesSort))}
                    >
                      <option value="price-asc">Price: Low → High</option>
                      <option value="price-desc">Price: High → Low</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Default View</Form.Label>
                    <Form.Select
                      value={prefs.servicesView}
                      onChange={(e) => dispatch(setServicesView(e.target.value as ServicesView))}
                    >
                      <option value="grid">Grid</option>
                      <option value="list">List</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Localization */}
          <Accordion.Item eventKey="localization">
            <Accordion.Header>
              <span style={{ fontWeight: 600 }}>Localization</span>
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Language</Form.Label>
                    <Form.Select
                      value={prefs.language}
                      onChange={(e) => dispatch(setLanguage(e.target.value as Language))}
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                      <option value="fr">Français</option>
                    </Form.Select>
                    <Form.Text className="text-muted">Change the interface language</Form.Text>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Date Format</Form.Label>
                    <Form.Select
                      value={prefs.dateFormat}
                      onChange={(e) => dispatch(setDateFormat(e.target.value as DateFormat))}
                    >
                      <option value="MM/DD/YYYY">MM/DD/YYYY (US)</option>
                      <option value="DD/MM/YYYY">DD/MM/YYYY (EU)</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD (ISO)</option>
                    </Form.Select>
                    <Form.Text className="text-muted">Preferred date format for display</Form.Text>
                  </Form.Group>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>

          {/* Notifications */}
          <Accordion.Item eventKey="notifications">
            <Accordion.Header>
              <span style={{ fontWeight: 600 }}>Notifications</span>
            </Accordion.Header>
            <Accordion.Body>
              <Alert variant="info">
                Email notifications will be sent to your registered email address.
              </Alert>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Email Notifications"
                  checked={prefs.notificationsEmail}
                  onChange={(e) => dispatch(setNotificationsEmail(e.target.checked))}
                />
                <Form.Text className="text-muted">
                  Get notified about important account updates and service bookings
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Marketing Emails"
                  checked={prefs.notificationsMarketing}
                  onChange={(e) => dispatch(setNotificationsMarketing(e.target.checked))}
                />
                <Form.Text className="text-muted">
                  Receive promotional emails about new services and special offers
                </Form.Text>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          {/* Accessibility */}
          <Accordion.Item eventKey="accessibility">
            <Accordion.Header>
              <span style={{ fontWeight: 600 }}>Accessibility</span>
            </Accordion.Header>
            <Accordion.Body>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="High Contrast Mode"
                  checked={prefs.accessibilityHighContrast}
                  onChange={(e) => dispatch(setAccessibilityHighContrast(e.target.checked))}
                />
                <Form.Text className="text-muted">
                  Increase contrast for better visibility
                </Form.Text>
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Check
                  type="switch"
                  label="Reduce Motion"
                  checked={prefs.accessibilityReducedMotion}
                  onChange={(e) => dispatch(setAccessibilityReducedMotion(e.target.checked))}
                />
                <Form.Text className="text-muted">
                  Minimize animations and transitions for reduced motion preference
                </Form.Text>
              </Form.Group>
            </Accordion.Body>
          </Accordion.Item>

          {/* Data Management */}
          <Accordion.Item eventKey="data">
            <Accordion.Header>
              <span style={{ fontWeight: 600 }}>Data Management</span>
            </Accordion.Header>
            <Accordion.Body>
              <Row>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title as="h6">Export Favorites</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        Download your favorited services as a JSON file
                      </Card.Text>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={handleExportFavorites}
                        disabled={!accessToken || favorites.length === 0}
                      >
                        Export Favorites
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
                <Col md={6}>
                  <Card className="mb-3">
                    <Card.Body>
                      <Card.Title as="h6">Clear Cache</Card.Title>
                      <Card.Text className="text-muted small mb-3">
                        Clear all cached data and local storage (will reload the page)
                      </Card.Text>
                      <Button
                        variant="outline-warning"
                        size="sm"
                        onClick={() => setShowClearCacheModal(true)}
                      >
                        Clear Cache
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Accordion.Body>
          </Accordion.Item>
        </Accordion>

        <div className="mt-4">
          <DSButton type="submit" tone="primary" className="me-2">
            Save Settings
          </DSButton>
          <Button variant="outline-secondary" type="button" onClick={() => window.history.back()}>
            Cancel
          </Button>
        </div>
      </Form>

      {/* Reset Confirmation Modal */}
      <Modal show={showResetModal} onHide={() => setShowResetModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Reset Settings</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to reset all settings to their default values? This action cannot be
          undone.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowResetModal(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleReset}>
            Reset Settings
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Clear Cache Confirmation Modal */}
      <Modal show={showClearCacheModal} onHide={() => setShowClearCacheModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Clear Cache</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          Are you sure you want to clear all cached data? This will remove your local preferences
          and cached data. The page will reload after clearing. Your account data will not be
          affected.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowClearCacheModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleClearCache}>
            Clear Cache
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
