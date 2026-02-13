import { Router, Response } from 'express';
import PatientLink from '../models/PatientLink';
import User from '../models/User';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/patient-links
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }
    const docs = await PatientLink.find(filter)
      .populate('patientId', 'name email role')
      .populate('links.linkedUserId', 'name email role');

    // Flatten: each subdocument link becomes a separate item
    const flattened = docs.flatMap((doc) =>
      doc.links.map((link) => ({
        _id: link._id,
        patientId: doc.patientId,
        linkedUserId: link.linkedUserId,
        relationship: link.relationship,
      }))
    );

    res.json(flattened);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patient-links
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, linkedUserId, relationship } = req.body;

    // Validate role matches relationship
    const linkedUser = await User.findById(linkedUserId);
    if (!linkedUser) {
      return res.status(400).json({ message: 'Linked user not found' });
    }
    if (linkedUser.role !== relationship) {
      return res.status(400).json({
        message: `User role '${linkedUser.role}' does not match relationship type '${relationship}'`,
      });
    }

    // Duplicate check
    const existing = await PatientLink.findOne({
      patientId,
      'links.linkedUserId': linkedUserId,
    });
    if (existing) {
      return res.status(409).json({ message: 'This user is already linked to this patient' });
    }

    // Upsert: push new link into the document (create doc if it doesn't exist)
    const doc = await PatientLink.findOneAndUpdate(
      { patientId },
      { $push: { links: { linkedUserId, relationship } } },
      { upsert: true, new: true }
    )
      .populate('patientId', 'name email role')
      .populate('links.linkedUserId', 'name email role');

    // Return the newly added link in flattened format
    const newLink = doc.links[doc.links.length - 1];
    res.status(201).json({
      _id: newLink._id,
      patientId: doc.patientId,
      linkedUserId: newLink.linkedUserId,
      relationship: newLink.relationship,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/patient-links/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const doc = await PatientLink.findOneAndUpdate(
      { 'links._id': req.params.id },
      { $pull: { links: { _id: req.params.id } } },
      { new: true }
    );

    if (!doc) {
      return res.status(404).json({ message: 'Link not found' });
    }

    // If no links remain, delete the parent document
    if (doc.links.length === 0) {
      await PatientLink.findByIdAndDelete(doc._id);
    }

    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
