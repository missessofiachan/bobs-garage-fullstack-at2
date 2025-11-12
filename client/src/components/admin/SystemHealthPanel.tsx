/**
 * @file SystemHealthPanel.tsx
 * @author Bob's Garage Team
 * @description System health panel component for admin dashboard
 * @version 1.0.0
 * @since 1.0.0
 */

import { Card, Col, ProgressBar, Row } from 'react-bootstrap';
import { useSystemHealth } from '../../hooks/useSystemHealth';

/**
 * Format uptime in seconds to human-readable string
 *
 * @param seconds - Uptime in seconds
 * @returns Formatted uptime (e.g., "2d 5h", "3h 45m", "30m")
 */
function formatUptime(seconds: number): string {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Format bytes to human-readable string with appropriate unit
 *
 * @param bytes - Number of bytes
 * @returns Formatted string (e.g., "1.5 KB", "2.3 MB", "1.2 GB")
 */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}

/**
 * Get Bootstrap variant color for system status
 *
 * @param status - System status string
 * @returns Bootstrap variant color
 */
function getStatusColor(status: string): 'success' | 'warning' | 'danger' {
  if (status === 'healthy') return 'success';
  if (status === 'degraded') return 'warning';
  return 'danger';
}

/**
 * Get Bootstrap variant color for memory usage percentage
 *
 * @param percentage - Memory usage percentage (0-100)
 * @returns Bootstrap variant color
 */
function getMemoryVariant(percentage: number): 'success' | 'warning' | 'danger' {
  if (percentage < 70) return 'success';
  if (percentage < 85) return 'warning';
  return 'danger';
}

/**
 * Get Bootstrap variant color for cache status
 *
 * @param status - Cache status string
 * @returns Bootstrap variant color
 */
function getCacheStatusColor(status: string): 'success' | 'warning' | 'danger' | 'muted' {
  if (status === 'connected' || status === 'enabled') return 'success';
  if (status === 'disabled') return 'muted';
  return 'danger';
}

/**
 * Get human-readable text for cache status
 *
 * @param status - Cache status string
 * @returns Formatted status text with icon
 */
function getCacheStatusText(status: string): string {
  if (status === 'connected') return '✓ Connected';
  if (status === 'enabled') return '✓ Enabled';
  if (status === 'disabled') return '○ Disabled';
  return '✗ Disconnected';
}

export default function SystemHealthPanel() {
  const { data: health, isLoading, error } = useSystemHealth();

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <Card.Title className="mb-0">System Health</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="text-muted">Loading system health...</div>
        </Card.Body>
      </Card>
    );
  }

  if (error || !health) {
    return (
      <Card className="shadow-sm">
        <Card.Header>
          <Card.Title className="mb-0">System Health</Card.Title>
        </Card.Header>
        <Card.Body>
          <div className="text-danger">Unable to load system health</div>
        </Card.Body>
      </Card>
    );
  }

  const statusColor = getStatusColor(health.status);

  return (
    <Card className="shadow-sm">
      <Card.Header>
        <Card.Title className="mb-0">
          System Health{' '}
          <span className={`badge bg-${statusColor} ms-2`}>{health.status.toUpperCase()}</span>
        </Card.Title>
      </Card.Header>
      <Card.Body>
        <Row className="g-3">
          {/* Database Status */}
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <strong>Database</strong>
                <span
                  className={
                    health.services.database.status === 'connected' ? 'text-success' : 'text-danger'
                  }
                >
                  {health.services.database.status === 'connected'
                    ? '✓ Connected'
                    : '✗ Disconnected'}
                </span>
              </div>
              {health.services.database.responseTime !== undefined && (
                <small className="text-muted">
                  Response time: {health.services.database.responseTime}ms
                </small>
              )}
            </div>
          </Col>

          {/* Cache Status */}
          <Col md={6}>
            <div className="mb-3">
              <div className="d-flex justify-content-between mb-1">
                <strong>Cache</strong>
                <span className={`text-${getCacheStatusColor(health.services.cache.status)}`}>
                  {getCacheStatusText(health.services.cache.status)}
                </span>
              </div>
              {health.services.cache.type && (
                <small className="text-muted">Type: {health.services.cache.type}</small>
              )}
              {health.services.cache.responseTime !== undefined && (
                <small className="text-muted d-block">
                  Response time: {health.services.cache.responseTime}ms
                </small>
              )}
            </div>
          </Col>

          {/* Memory Usage */}
          <Col xs={12}>
            <div className="mb-2">
              <div className="d-flex justify-content-between mb-1">
                <strong>Memory Usage</strong>
                <span>{health.system.memory.percentage}%</span>
              </div>
              <ProgressBar
                variant={getMemoryVariant(health.system.memory.percentage)}
                now={health.system.memory.percentage}
                className="mb-1"
              />
              <small className="text-muted">
                {formatBytes(health.system.memory.used)} / {formatBytes(health.system.memory.total)}
              </small>
            </div>
          </Col>

          {/* System Info */}
          <Col xs={12}>
            <Row className="g-3">
              <Col xs={6}>
                <div>
                  <strong>Uptime</strong>
                  <br />
                  <small className="text-muted">{formatUptime(health.uptime)}</small>
                </div>
              </Col>
              <Col xs={6}>
                <div>
                  <strong>Version</strong>
                  <br />
                  <small className="text-muted">{health.version}</small>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card.Body>
    </Card>
  );
}
