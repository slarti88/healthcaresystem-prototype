import { Router, Response } from 'express';
import Medicine from '../models/Medicine';
import { AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/medicines
router.get('/', async (_req: AuthRequest, res: Response) => {
  try {
    const medicines = await Medicine.find().sort({ name: 1 });
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/medicines
router.post('/', async (req: AuthRequest, res: Response) => {
  try {
    const medicine = await Medicine.create(req.body);
    res.status(201).json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/medicines/:id
router.put('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const medicine = await Medicine.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json(medicine);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/medicines/:id
router.delete('/:id', async (req: AuthRequest, res: Response) => {
  try {
    const medicine = await Medicine.findByIdAndDelete(req.params.id);
    if (!medicine) {
      return res.status(404).json({ message: 'Medicine not found' });
    }
    res.json({ message: 'Medicine deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
