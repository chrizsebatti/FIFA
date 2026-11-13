import { Router } from 'express';
import Member from '../models/Member.js';
import GroundRent from '../models/GroundRent.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.use(adminAuth);

router.get('/overview', async (req, res, next) => {
  try {
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const [totalMembers, totalAgg, monthAgg] = await Promise.all([
      Member.countDocuments(),
      GroundRent.aggregate([{ $group: { _id: null, total: { $sum: '$amount' } } }]),
      GroundRent.aggregate([
        { $match: { month: currentMonth, year: currentYear } },
        { $group: { _id: null, total: { $sum: '$amount' } } },
      ]),
    ]);

    res.json({
      totalMembers,
      totalCollected: totalAgg[0]?.total || 0,
      currentMonthCollected: monthAgg[0]?.total || 0,
      currentMonth,
      currentYear,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/', async (req, res, next) => {
  try {
    const month = req.query.month ? Number(req.query.month) : null;
    const year = req.query.year ? Number(req.query.year) : null;
    const q = String(req.query.q || '').trim();
    const sort = String(req.query.sort || 'name');

    const filter = {};
    if (month >= 1 && month <= 12) filter.month = month;
    if (year) filter.year = year;

    let rents = await GroundRent.find(filter)
      .populate('member', 'name phone')
      .lean();

    if (q) {
      const re = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      rents = rents.filter((r) => r.member && re.test(r.member.name));
    }

    rents.sort((a, b) => {
      const an = (a.member?.name || '').toLowerCase();
      const bn = (b.member?.name || '').toLowerCase();
      const cmp = an.localeCompare(bn);
      return sort === 'name_desc' ? -cmp : cmp;
    });

    res.json({ rents });
  } catch (err) {
    next(err);
  }
});

router.post('/', async (req, res, next) => {
  try {
    const { memberId, amount, month, year } = req.body;
    const amt = Number(amount);
    const m = Number(month);
    const y = Number(year);

    if (!memberId || !Number.isFinite(amt) || amt < 0) {
      return res.status(400).json({ error: 'Valid member and amount are required' });
    }
    if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y)) {
      return res.status(400).json({ error: 'Valid month and year are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    try {
      const rent = await GroundRent.create({
        member: memberId,
        amount: amt,
        month: m,
        year: y,
      });
      await rent.populate('member', 'name phone');
      res.status(201).json({ rent });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          error: 'Fee already recorded for this member for the selected month/year',
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.put('/:id', async (req, res, next) => {
  try {
    const { memberId, amount, month, year } = req.body;
    const amt = Number(amount);
    const m = Number(month);
    const y = Number(year);

    if (!memberId || !Number.isFinite(amt) || amt < 0) {
      return res.status(400).json({ error: 'Valid member and amount are required' });
    }
    if (!Number.isInteger(m) || m < 1 || m > 12 || !Number.isInteger(y)) {
      return res.status(400).json({ error: 'Valid month and year are required' });
    }

    const member = await Member.findById(memberId);
    if (!member) {
      return res.status(404).json({ error: 'Member not found' });
    }

    try {
      const rent = await GroundRent.findByIdAndUpdate(
        req.params.id,
        { member: memberId, amount: amt, month: m, year: y },
        { new: true, runValidators: true }
      ).populate('member', 'name phone');

      if (!rent) {
        return res.status(404).json({ error: 'Ground rent record not found' });
      }
      res.json({ rent });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({
          error: 'Fee already recorded for this member for the selected month/year',
        });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    const rent = await GroundRent.findByIdAndDelete(req.params.id);
    if (!rent) {
      return res.status(404).json({ error: 'Ground rent record not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
