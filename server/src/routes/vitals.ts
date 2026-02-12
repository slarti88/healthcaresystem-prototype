import { Router, Response } from 'express';
import Vitals from '../models/Vitals';
import { AuthRequest, allowRoles } from '../middleware/auth';

const router = Router();

// GET /api/vitals
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }
    const vitals = await Vitals.find(filter).sort({ recordedAt: -1 });
    res.json(vitals);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/vitals
router.post('/', allowRoles('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const vital = await Vitals.create(req.body);
    res.status(201).json(vital);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/vitals/:id
router.put('/:id', allowRoles('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const vital = await Vitals.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!vital) {
      return res.status(404).json({ message: 'Vitals not found' });
    }
    res.json(vital);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/vitals/:id
router.delete('/:id', allowRoles('admin', 'staff'), async (req: AuthRequest, res: Response) => {
  try {
    const vital = await Vitals.findByIdAndDelete(req.params.id);
    if (!vital) {
      return res.status(404).json({ message: 'Vitals not found' });
    }
    res.json({ message: 'Vitals deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
