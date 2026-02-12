import { Router, Response } from 'express';
import DoctorComment from '../models/DoctorComment';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/doctor-comments
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    const filter: any = {};
    if (req.query.patientId) {
      filter.patientId = req.query.patientId;
    }
    const comments = await DoctorComment.find(filter)
      .populate('staffId', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/doctor-comments
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const comment = await DoctorComment.create(req.body);
    const populated = await comment.populate('staffId', 'name');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/doctor-comments/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const comment = await DoctorComment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }
    res.json({ message: 'Comment deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
