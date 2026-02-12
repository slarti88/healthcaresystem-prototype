import mongoose, { Schema, Document } from 'mongoose';

export interface IMedicine extends Document {
  name: string;
  quantity: number;
  expiryDate: Date;
}

const MedicineSchema = new Schema<IMedicine>(
  {
    name: { type: String, required: true },
    quantity: { type: Number, required: true },
    expiryDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IMedicine>('Medicine', MedicineSchema);
