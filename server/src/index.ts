import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { verifyToken, allowRoles } from './middleware/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import patientLinkRoutes from './routes/patientLinks';
import vitalsRoutes from './routes/vitals';
import doctorCommentRoutes from './routes/doctorComments';
import medicineRoutes from './routes/medicines';
import inquiryRoutes from './routes/inquiries';
import { startPatientStatusCron } from './cron/patientStatusEmail';

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/healthcare';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, allowRoles('admin', 'staff', 'family'), userRoutes);
app.use('/api/patient-links', verifyToken, allowRoles('admin'), patientLinkRoutes);
app.use('/api/vitals', verifyToken, allowRoles('admin', 'staff', 'family'), vitalsRoutes);
app.use('/api/doctor-comments', verifyToken, allowRoles('admin', 'staff', 'family'), doctorCommentRoutes);
app.use('/api/medicines', verifyToken, allowRoles('admin', 'staff'), medicineRoutes);
app.use('/api/inquiries', verifyToken, allowRoles('admin', 'family'), inquiryRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    startPatientStatusCron();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
