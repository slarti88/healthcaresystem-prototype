import { Router, Response } from 'express';
import Inquiry from '../models/Inquiry';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/inquiries
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const inquiries = await Inquiry.find()
      .populate('userId', 'name email')
      .sort({ createdAt: -1 });
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/inquiries
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const inquiry = await Inquiry.create(req.body);
    const populated = await inquiry.populate('userId', 'name email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/inquiries/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const inquiry = await Inquiry.findByIdAndDelete(req.params.id);
    if (!inquiry) {
      return res.status(404).json({ message: 'Inquiry not found' });
    }
    res.json({ message: 'Inquiry deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
