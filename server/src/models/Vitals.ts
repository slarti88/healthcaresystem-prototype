import mongoose, { Schema, Document } from 'mongoose';

export interface IVitals extends Document {
  patientId: mongoose.Types.ObjectId;
  heartRate: number;
  bloodPressure: { systolic: number; diastolic: number };
  temperature: number;
  oxygenLevel: number;
  weight: number;
  recordedAt: Date;
}

const VitalsSchema = new Schema<IVitals>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    heartRate: { type: Number, required: true },
    bloodPressure: {
      systolic: { type: Number, required: true },
      diastolic: { type: Number, required: true },
    },
    temperature: { type: Number, required: true },
    oxygenLevel: { type: Number, required: true },
    weight: { type: Number, required: true },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export default mongoose.model<IVitals>('Vitals', VitalsSchema);
