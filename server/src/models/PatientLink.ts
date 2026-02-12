import mongoose, { Schema, Document } from 'mongoose';

export interface IPatientLink extends Document {
  patientId: mongoose.Types.ObjectId;
  linkedUserId: mongoose.Types.ObjectId;
  relationship: 'family' | 'staff';
}

const PatientLinkSchema = new Schema<IPatientLink>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    linkedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    relationship: { type: String, enum: ['family', 'staff'], required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IPatientLink>('PatientLink', PatientLinkSchema);
