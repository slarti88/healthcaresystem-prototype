import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { User, PatientLink } from '../types';

export default function UsersPage() {
  const { user: currentUser } = useAuth();
  const isAdmin = currentUser?.role === 'admin';

  const [users, setUsers] = useState<User[]>([]);
  const [links, setLinks] = useState<PatientLink[]>([]);
  const [loading, setLoading] = useState(true);

  // New user form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<User['role']>('patient');

  // Link form
  const [linkPatientId, setLinkPatientId] = useState('');
  const [linkUserId, setLinkUserId] = useState('');
  const [linkRelationship, setLinkRelationship] = useState<'family' | 'staff'>('family');
  const [linkError, setLinkError] = useState('');

  const fetchData = async () => {
    try {
      console.log("Fetching data")
      const usersRes = await api.get('/users');
      setUsers(usersRes.data);
      if (isAdmin) {
        const linksRes = await api.get('/patient-links');
        setLinks(linksRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/users', { name, email, password, role });
      setName(''); setEmail(''); setPassword(''); setRole('patient');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateRole = async (id: string, newRole: string) => {
    try {
      await api.put(`/users/${id}`, { role: newRole });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await api.delete(`/users/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError('');
    try {
      await api.post('/patient-links', {
        patientId: linkPatientId,
        linkedUserId: linkUserId,
        relationship: linkRelationship,
      });
      setLinkPatientId(''); setLinkUserId(''); setLinkRelationship('family');
      fetchData();
    } catch (err: any) {
      const message = err.response?.data?.message;
      if (message) {
        setLinkError(message);
      } else {
        console.error(err);
      }
    }
  };

  const handleDeleteLink = async (id: string) => {
    try {
      await api.delete(`/patient-links/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  const patients = users.filter((u) => u.role === 'patient');
  const nonPatients = users.filter((u) => u.role !== 'patient' && u.role !== 'admin');

  const handleLinkUserChange = (userId: string) => {
    setLinkUserId(userId);
    const selected = nonPatients.find((u) => u._id === userId);
    if (selected && (selected.role === 'family' || selected.role === 'staff')) {
      setLinkRelationship(selected.role);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1>Users</h1>
      </div>

      {/* Create User Form */}
      {isAdmin && (
        <form className="inline-form" onSubmit={handleCreateUser}>
          <div className="form-group">
            <label>Name</label>
            <input value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={(e) => setRole(e.target.value as User['role'])}>
              <option value="patient">Patient</option>
              <option value="family">Family</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary">Add User</button>
        </form>
      )}

      {/* Users Table */}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>
                {user.role === 'patient' ? (
                  <Link to={`/patients/${user._id}`} className="link">{user.name}</Link>
                ) : (
                  user.name
                )}
              </td>
              <td>{user.email}</td>
              <td>
                {isAdmin ? (
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user._id, e.target.value)}
                    style={{ width: 'auto' }}
                  >
                    <option value="patient">Patient</option>
                    <option value="family">Family</option>
                    <option value="staff">Staff</option>
                    <option value="admin">Admin</option>
                  </select>
                ) : (
                  user.role
                )}
              </td>
              <td>
                <div className="actions">
                  {user.role === 'patient' && (
                    <Link to={`/patients/${user._id}`} className="btn btn-primary btn-sm">View</Link>
                  )}
                  {isAdmin && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteUser(user._id)}>
                      Delete
                    </button>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Patient Links */}
      {isAdmin && (
        <div className="section" style={{ marginTop: 32 }}>
          <h2>Patient Links</h2>
          <form className="inline-form" onSubmit={handleCreateLink}>
            <div className="form-group">
              <label>Patient</label>
              <select value={linkPatientId} onChange={(e) => setLinkPatientId(e.target.value)} required>
                <option value="">Select patient...</option>
                {patients.map((p) => (
                  <option key={p._id} value={p._id}>{p.name}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Link To</label>
              <select value={linkUserId} onChange={(e) => handleLinkUserChange(e.target.value)} required>
                <option value="">Select user...</option>
                {nonPatients.map((u) => (
                  <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Relationship</label>
              <select value={linkRelationship} onChange={(e) => setLinkRelationship(e.target.value as 'family' | 'staff')}>
                <option value="family">Family</option>
                <option value="staff">Staff</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Link</button>
          </form>
          {linkError && <p style={{ color: 'red', marginTop: 8 }}>{linkError}</p>}

          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Linked User</th>
                <th>Relationship</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {links.map((link) => (
                <tr key={link._id}>
                  <td>{link.patientId?.name}</td>
                  <td>{link.linkedUserId?.name}</td>
                  <td><span className={`badge badge-${link.relationship}`}>{link.relationship}</span></td>
                  <td>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteLink(link._id)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
