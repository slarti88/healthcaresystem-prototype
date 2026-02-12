import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User';
import PatientLink from '../models/PatientLink';
import { AuthRequest, allowRoles } from '../middleware/auth';

const router = Router();

// GET /api/users
router.get('/', async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role === 'admin') {
      const users = await User.find().select('-password').sort({ createdAt: -1 });
      return res.json(users);
    }
    // staff/family: only return linked patients
    const links = await PatientLink.find({ linkedUserId: req.user!.id });
    const patientIds = links.map((l) => l.patientId);
    const patients = await User.find({ _id: { $in: patientIds } }).select('-password').sort({ createdAt: -1 });
    res.json(patients);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/users
router.post('/', allowRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ message: 'Email already in use' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashed, role });
    const { password: _, ...userObj } = user.toObject();
    res.status(201).json(userObj);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/users/:id
router.put('/:id', allowRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', allowRoles('admin'), async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;
