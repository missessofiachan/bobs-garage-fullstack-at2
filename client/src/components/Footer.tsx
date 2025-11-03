import { container, vars } from '../styles/theme.css.ts';

export default function Footer() {
  return (
    <footer
      className={container}
      style={{
        marginTop: 'auto',
        borderTop: `1px solid ${vars.color.border}`,
        color: vars.color.muted,
        paddingTop: vars.space.sm,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <div>
          <strong>Bob's Garage</strong>
          <div>123 Mechanic St, Motortown</div>
          <div>Phone: (555) 123-4567</div>
        </div>
        <div>
          <a href="https://facebook.com" target="_blank" rel="noreferrer">
            Facebook
          </a>
          {' · '}
          <a href="https://instagram.com" target="_blank" rel="noreferrer">
            Instagram
          </a>
          {' · '}
          <a href="mailto:hello@bobsgarage.example">Email</a>
        </div>
      </div>
    </footer>
  );
}
