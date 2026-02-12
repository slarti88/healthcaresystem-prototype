import { Router, Response } from 'express';
import PatientLink from '../models/PatientLink';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/patient-links
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }
    const links = await PatientLink.find(filter)
      .populate('patientId', 'name email role')
      .populate('linkedUserId', 'name email role')
      .sort({ createdAt: -1 });
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/patient-links
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const { patientId, linkedUserId, relationship } = req.body;
    const link = await PatientLink.create({ patientId, linkedUserId, relationship });
    const populated = await link.populate(['patientId', 'linkedUserId']);
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/patient-links/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const link = await PatientLink.findByIdAndDelete(req.params.id);
    if (!link) {
      return res.status(404).json({ message: 'Link not found' });
    }
    res.json({ message: 'Link deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
