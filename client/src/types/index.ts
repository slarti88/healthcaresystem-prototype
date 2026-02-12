export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'admin' | 'patient' | 'family' | 'staff';
  createdAt?: string;
}

export interface PatientLink {
  _id: string;
  patientId: User;
  linkedUserId: User;
  relationship: 'family' | 'staff';
}

export interface Vitals {
  _id: string;
  patientId: string;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenLevel: number;
  weight: number;
  recordedAt: string;
}

export interface DoctorComment {
  _id: string;
  patientId: string;
  staffId: { _id: string; name: string };
  comment: string;
  createdAt: string;
}

export interface Medicine {
  _id: string;
  name: string;
  quantity: number;
  expiryDate: string;
}

export interface Inquiry {
  _id: string;
  userId: { _id: string; name: string; email: string };
  message: string;
  createdAt: string;
}
