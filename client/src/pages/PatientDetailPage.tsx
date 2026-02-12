import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api/axios';
import { User, Vitals, DoctorComment } from '../types';

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<User | null>(null);
  const [vitals, setVitals] = useState<Vitals[]>([]);
  const [comments, setComments] = useState<DoctorComment[]>([]);
  const [staffUsers, setStaffUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Vitals form
  const [heartRate, setHeartRate] = useState('');
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [temperature, setTemperature] = useState('');
  const [oxygenLevel, setOxygenLevel] = useState('');
  const [weight, setWeight] = useState('');

  // Comment form
  const [staffId, setStaffId] = useState('');
  const [comment, setComment] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, vitalsRes, commentsRes] = await Promise.all([
        api.get('/users'),
        api.get(`/vitals?patientId=${id}`),
        api.get(`/doctor-comments?patientId=${id}`),
      ]);
      const allUsers: User[] = usersRes.data;
      setPatient(allUsers.find((u) => u._id === id) || null);
      setStaffUsers(allUsers.filter((u) => u.role === 'staff'));
      setVitals(vitalsRes.data);
      setComments(commentsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleAddVitals = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/vitals', {
        patientId: id,
        heartRate: Number(heartRate),
        bloodPressure: { systolic: Number(systolic), diastolic: Number(diastolic) },
        temperature: Number(temperature),
        oxygenLevel: Number(oxygenLevel),
        weight: Number(weight),
      });
      setHeartRate(''); setSystolic(''); setDiastolic('');
      setTemperature(''); setOxygenLevel(''); setWeight('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteVitals = async (vitalId: string) => {
    try {
      await api.delete(`/vitals/${vitalId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/doctor-comments', { patientId: id, staffId, comment });
      setStaffId(''); setComment('');
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      await api.delete(`/doctor-comments/${commentId}`);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!patient) return <div className="loading">Patient not found</div>;

  const latest = vitals[0];

  return (
    <div>
      <div className="page-header">
        <h1>{patient.name}</h1>
        <span className="badge badge-patient">Patient</span>
      </div>

      {/* Latest Vitals Card */}
      {latest && (
        <div className="card">
          <h3>Latest Vitals ({new Date(latest.recordedAt).toLocaleDateString()})</h3>
          <div className="vitals-grid">
            <div className="vital-item">
              <div className="label">Heart Rate</div>
              <div className="value">{latest.heartRate}</div>
            </div>
            <div className="vital-item">
              <div className="label">Blood Pressure</div>
              <div className="value">{latest.bloodPressure.systolic}/{latest.bloodPressure.diastolic}</div>
            </div>
            <div className="vital-item">
              <div className="label">Temperature</div>
              <div className="value">{latest.temperature}°F</div>
            </div>
            <div className="vital-item">
              <div className="label">O₂ Level</div>
              <div className="value">{latest.oxygenLevel}%</div>
            </div>
            <div className="vital-item">
              <div className="label">Weight</div>
              <div className="value">{latest.weight} lbs</div>
            </div>
          </div>
        </div>
      )}

      {/* Add Vitals Form */}
      <div className="section">
        <h2>Add Vitals</h2>
        <form className="inline-form" onSubmit={handleAddVitals}>
          <div className="form-group">
            <label>Heart Rate</label>
            <input type="number" value={heartRate} onChange={(e) => setHeartRate(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Systolic</label>
            <input type="number" value={systolic} onChange={(e) => setSystolic(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Diastolic</label>
            <input type="number" value={diastolic} onChange={(e) => setDiastolic(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Temperature</label>
            <input type="number" step="0.1" value={temperature} onChange={(e) => setTemperature(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>O₂ Level</label>
            <input type="number" value={oxygenLevel} onChange={(e) => setOxygenLevel(e.target.value)} required />
          </div>
          <div className="form-group">
            <label>Weight</label>
            <input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Add</button>
        </form>
      </div>

      {/* Vitals History Table */}
      <div className="section">
        <h2>Vitals History</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>HR</th>
              <th>BP</th>
              <th>Temp</th>
              <th>O₂</th>
              <th>Weight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {vitals.map((v) => (
              <tr key={v._id}>
                <td>{new Date(v.recordedAt).toLocaleDateString()}</td>
                <td>{v.heartRate}</td>
                <td>{v.bloodPressure.systolic}/{v.bloodPressure.diastolic}</td>
                <td>{v.temperature}°F</td>
                <td>{v.oxygenLevel}%</td>
                <td>{v.weight} lbs</td>
                <td>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDeleteVitals(v._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Doctor Comments */}
      <div className="section">
        <h2>Doctor Comments</h2>
        <form className="inline-form" onSubmit={handleAddComment}>
          <div className="form-group">
            <label>Doctor</label>
            <select value={staffId} onChange={(e) => setStaffId(e.target.value)} required>
              <option value="">Select doctor...</option>
              {staffUsers.map((s) => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label>Comment</label>
            <input value={comment} onChange={(e) => setComment(e.target.value)} required />
          </div>
          <button type="submit" className="btn btn-primary">Add Comment</button>
        </form>

        <div className="card">
          {comments.length === 0 && <p style={{ color: 'var(--text-muted)' }}>No comments yet</p>}
          {comments.map((c) => (
            <div key={c._id} className="comment-item">
              <div className="comment-meta">
                <strong>{c.staffId?.name}</strong> &middot; {new Date(c.createdAt).toLocaleDateString()}
                <button
                  className="btn btn-danger btn-sm"
                  style={{ marginLeft: 8 }}
                  onClick={() => handleDeleteComment(c._id)}
                >
                  Delete
                </button>
              </div>
              <p>{c.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
