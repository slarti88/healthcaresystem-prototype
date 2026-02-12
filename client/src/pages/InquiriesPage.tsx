import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Inquiry, User } from '../types';

export default function InquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState('');
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [inqRes, usersRes] = await Promise.all([
        api.get('/inquiries'),
        api.get('/users'),
      ]);
      setInquiries(inqRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/inquiries', { userId, message });
      setUserId(''); setMessage('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/inquiries/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Inquiries</h1>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)} required>
            <option value="">Select user...</option>
            {users.map((u) => (
              <option key={u._id} value={u._id}>{u.name} ({u.role})</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ flex: 1 }}>
          <label>Message</label>
          <input value={message} onChange={(e) => setMessage(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">Submit Inquiry</button>
      </form>

      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Message</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {inquiries.map((inq) => (
            <tr key={inq._id}>
              <td>{inq.userId?.name}</td>
              <td>{inq.message}</td>
              <td>{new Date(inq.createdAt).toLocaleDateString()}</td>
              <td>
                <button className="btn btn-danger btn-sm" onClick={() => handleDelete(inq._id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
