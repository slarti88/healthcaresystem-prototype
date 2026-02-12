import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, logout } = useAuth();

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>Healthcare</h2>
        <p className="sidebar-user">{user?.name}</p>
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/users" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Users
        </NavLink>
        <NavLink to="/medicines" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Medicine Inventory
        </NavLink>
        <NavLink to="/inquiries" className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
          Inquiries
        </NavLink>
      </nav>
      <button className="btn btn-logout" onClick={logout}>
        Logout
      </button>
    </aside>
  );
}
