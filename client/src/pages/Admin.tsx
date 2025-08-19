import { Link } from 'react-router-dom';

export default function Admin() {
  return (
    <div>
      <h1>Admin</h1>
      <ul>
        <li><Link to="/admin/dashboard">Dashboard</Link></li>
        <li><Link to="/admin/services">Services Admin</Link></li>
        <li><Link to="/admin/staff">Staff Admin</Link></li>
        <li><Link to="/admin/users">Users Admin</Link></li>
      </ul>
      <p>Protect these routes by checking role === 'admin' and guarding in the router.</p>
    </div>
  );
}
