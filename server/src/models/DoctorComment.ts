import mongoose, { Schema, Document } from 'mongoose';

export interface IDoctorComment extends Document {
  patientId: mongoose.Types.ObjectId;
  staffId: mongoose.Types.ObjectId;
  comment: string;
}

const DoctorCommentSchema = new Schema<IDoctorComment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    comment: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IDoctorComment>('DoctorComment', DoctorCommentSchema);
