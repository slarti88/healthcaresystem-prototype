import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from './models/User';
import PatientLink from './models/PatientLink';
import Vitals from './models/Vitals';
import DoctorComment from './models/DoctorComment';
import Medicine from './models/Medicine';
import Inquiry from './models/Inquiry';

const MONGO_URI = 'mongodb://localhost:27017/healthcare';

async function seed() {
  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    PatientLink.deleteMany({}),
    Vitals.deleteMany({}),
    DoctorComment.deleteMany({}),
    Medicine.deleteMany({}),
    Inquiry.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Create users
  const admin = await User.create({
    name: 'Admin',
    email: 'admin@healthcare.com',
    password: hash('admin123'),
    role: 'admin',
  });

  const john = await User.create({
    name: 'John Doe',
    email: 'john@example.com',
    password: hash('patient123'),
    role: 'patient',
  });

  const jane = await User.create({
    name: 'Jane Smith',
    email: 'jane@example.com',
    password: hash('patient123'),
    role: 'patient',
  });

  const mary = await User.create({
    name: 'Mary Doe',
    email: 'mary@example.com',
    password: hash('family123'),
    role: 'family',
  });

  const drWilson = await User.create({
    name: 'Dr. Wilson',
    email: 'wilson@example.com',
    password: hash('staff123'),
    role: 'staff',
  });

  console.log('Created users');

  // Patient links
  await PatientLink.create({
    patientId: john._id,
    links: [
      { linkedUserId: mary._id, relationship: 'family' },
      { linkedUserId: drWilson._id, relationship: 'staff' },
    ],
  });
  console.log('Created patient links');

  // Vitals for John
  await Vitals.create([
    {
      patientId: john._id,
      heartRate: 72,
      bloodPressure: { systolic: 120, diastolic: 80 },
      temperature: 98.6,
      oxygenLevel: 98,
      weight: 180,
      recordedAt: new Date('2025-01-15'),
    },
    {
      patientId: john._id,
      heartRate: 75,
      bloodPressure: { systolic: 122, diastolic: 82 },
      temperature: 98.4,
      oxygenLevel: 97,
      weight: 179,
      recordedAt: new Date('2025-02-01'),
    },
  ]);

  // Vitals for Jane
  await Vitals.create({
    patientId: jane._id,
    heartRate: 68,
    bloodPressure: { systolic: 118, diastolic: 76 },
    temperature: 98.2,
    oxygenLevel: 99,
    weight: 140,
    recordedAt: new Date('2025-01-20'),
  });
  console.log('Created vitals');

  // Doctor comment
  await DoctorComment.create({
    patientId: john._id,
    staffId: drWilson._id,
    comment: 'Patient is recovering well. Continue current medication.',
  });
  console.log('Created doctor comments');

  // Medicines
  await Medicine.create([
    { name: 'Aspirin', quantity: 500, expiryDate: new Date('2026-06-15') },
    { name: 'Amoxicillin', quantity: 200, expiryDate: new Date('2025-12-01') },
    { name: 'Ibuprofen', quantity: 0, expiryDate: new Date('2024-03-01') }, // expired
    { name: 'Metformin', quantity: 300, expiryDate: new Date('2026-09-30') },
  ]);
  console.log('Created medicines');

  // Inquiry
  await Inquiry.create({
    userId: mary._id,
    message: 'When is John\'s next appointment scheduled?',
  });
  console.log('Created inquiries');

  console.log('\nSeed completed successfully!');
  console.log('Admin login: admin@healthcare.com / admin123');
  await mongoose.disconnect();
  process.exit(0);
}

seed().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
