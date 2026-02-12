import mongoose, { Schema, Document } from 'mongoose';

export interface IInquiry extends Document {
  userId: mongoose.Types.ObjectId;
  message: string;
}

const InquirySchema = new Schema<IInquiry>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model<IInquiry>('Inquiry', InquirySchema);
