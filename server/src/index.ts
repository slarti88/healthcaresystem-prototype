import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { verifyToken, adminOnly } from './middleware/auth';
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import patientLinkRoutes from './routes/patientLinks';
import vitalsRoutes from './routes/vitals';
import doctorCommentRoutes from './routes/doctorComments';
import medicineRoutes from './routes/medicines';
import inquiryRoutes from './routes/inquiries';

const app = express();
const PORT = 5000;
const MONGO_URI = 'mongodb://localhost:27017/healthcare';

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', verifyToken, adminOnly, userRoutes);
app.use('/api/patient-links', verifyToken, adminOnly, patientLinkRoutes);
app.use('/api/vitals', verifyToken, adminOnly, vitalsRoutes);
app.use('/api/doctor-comments', verifyToken, adminOnly, doctorCommentRoutes);
app.use('/api/medicines', verifyToken, adminOnly, medicineRoutes);
app.use('/api/inquiries', verifyToken, adminOnly, inquiryRoutes);

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
