import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Medicine } from '../types';

export default function MedicineInventoryPage() {
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state (shared for add + edit)
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const fetchData = async () => {
    try {
      const res = await api.get('/medicines');
      setMedicines(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const resetForm = () => {
    setName(''); setQuantity(''); setExpiryDate('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { name, quantity: Number(quantity), expiryDate };
    try {
      if (editingId) {
        await api.put(`/medicines/${editingId}`, payload);
      } else {
        await api.post('/medicines', payload);
      }
      resetForm();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleEdit = (med: Medicine) => {
    setEditingId(med._id);
    setName(med.name);
    setQuantity(String(med.quantity));
    setExpiryDate(med.expiryDate.split('T')[0]);
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/medicines/${id}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const isExpired = (date: string) => new Date(date) < new Date();

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Medicine Inventory</h1>
      </div>

      <form className="inline-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Quantity</label>
          <input type="number" value={quantity} onChange={(e) => setQuantity(e.target.value)} required />
        </div>
        <div className="form-group">
          <label>Expiry Date</label>
          <input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} required />
        </div>
        <button type="submit" className="btn btn-primary">
          {editingId ? 'Update' : 'Add Medicine'}
        </button>
        {editingId && (
          <button type="button" className="btn" onClick={resetForm}>Cancel</button>
        )}
      </form>

      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Quantity</th>
            <th>Expiry Date</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {medicines.map((med) => (
            <tr key={med._id} className={isExpired(med.expiryDate) ? 'expired' : ''}>
              <td>{med.name}</td>
              <td>{med.quantity}</td>
              <td>{new Date(med.expiryDate).toLocaleDateString()}</td>
              <td>
                {isExpired(med.expiryDate) ? (
                  <span style={{ color: 'var(--danger)', fontWeight: 600 }}>Expired</span>
                ) : (
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>Active</span>
                )}
              </td>
              <td>
                <div className="actions">
                  <button className="btn btn-primary btn-sm" onClick={() => handleEdit(med)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(med._id)}>Delete</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
