import { Router } from 'express';
import Member from '../models/Member.js';
import GroundRent from '../models/GroundRent.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.use(adminAuth);

router.get('/', async (req, res, next) => {
  try {
    const q = String(req.query.q || '').trim();
    const sort = String(req.query.sort || 'name');
    const filter = q
      ? { name: { $regex: q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), $options: 'i' } }
      : {};
    const members = await Member.find(filter).sort({
      name: sort === 'name_desc' ? -1 : 1,
    });
    res.json({ members });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    const member = await Member.create({ name, phone });
    res.status(201).json({ member });
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    const phone = String(req.body.phone || '').trim();
    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }
    const member = await Member.findByIdAndUpdate(
      req.params.id,
      { name, phone },
      { new: true, runValidators: true }
    );
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    res.json({ member });
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const member = await Member.findByIdAndDelete(req.params.id);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }
    await GroundRent.deleteMany({ member: member._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
