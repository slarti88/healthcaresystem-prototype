import mongoose, { Schema, Document, Types } from 'mongoose';

export interface ILink {
  _id: Types.ObjectId;
  linkedUserId: Types.ObjectId;
  relationship: 'family' | 'staff';
}

export interface IPatientLink extends Document {
  patientId: Types.ObjectId;
  links: ILink[];
}

const LinkSchema = new Schema<ILink>({
  linkedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  relationship: { type: String, enum: ['family', 'staff'], required: true },
});

const PatientLinkSchema = new Schema<IPatientLink>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    links: [LinkSchema],
  },
  { timestamps: true }
);

PatientLinkSchema.index({ 'links.linkedUserId': 1 });

export default mongoose.model<IPatientLink>('PatientLink', PatientLinkSchema);
