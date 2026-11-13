import { Router } from 'express';
import mongoose from 'mongoose';
import FinanceCategory from '../models/FinanceCategory.js';
import FinanceEntry from '../models/FinanceEntry.js';
import { adminAuth } from '../middleware/adminAuth.js';

const router = Router();

router.use(adminAuth);

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

router.get('/overview', async (req, res, next) => {
  try {
    const categoryId = String(req.query.categoryId || '').trim();
    const match = {};
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid categoryId' });
      }
      match.category = new mongoose.Types.ObjectId(categoryId);
    }

    const rows = await FinanceEntry.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
        },
      },
    ]);

    let totalCredit = 0;
    let totalDebit = 0;
    for (const row of rows) {
      if (row._id === 'credit') totalCredit = row.total;
      if (row._id === 'debit') totalDebit = row.total;
    }

    res.json({
      totalCredit,
      totalDebit,
      balance: totalCredit - totalDebit,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (req, res, next) => {
  try {
    const categories = await FinanceCategory.find().sort({ name: 1 });
    res.json({ categories });
  } catch (err) {
    next(err);
  }
});

router.post('/categories', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    try {
      const category = await FinanceCategory.create({ name });
      res.status(201).json({ category });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'Category name already exists' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.put('/categories/:id', async (req, res, next) => {
  try {
    const name = String(req.body.name || '').trim();
    if (!name) {
      return res.status(400).json({ error: 'Category name is required' });
    }
    try {
      const category = await FinanceCategory.findByIdAndUpdate(
        req.params.id,
        { name },
        { new: true, runValidators: true }
      );
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      res.json({ category });
    } catch (err) {
      if (err.code === 11000) {
        return res.status(409).json({ error: 'Category name already exists' });
      }
      throw err;
    }
  } catch (err) {
    next(err);
  }
});

router.delete('/categories/:id', async (req, res, next) => {
  try {
    const category = await FinanceCategory.findByIdAndDelete(req.params.id);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }
    await FinanceEntry.deleteMany({ category: category._id });
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get('/entries', async (req, res, next) => {
  try {
    const categoryId = String(req.query.categoryId || '').trim();
    const q = String(req.query.q || '').trim();
    const type = String(req.query.type || '').trim();
    const sort = String(req.query.sort || 'title');

    const filter = {};
    if (categoryId) {
      if (!mongoose.Types.ObjectId.isValid(categoryId)) {
        return res.status(400).json({ error: 'Invalid categoryId' });
      }
      filter.category = categoryId;
    }
    if (q) {
      const re = escapeRegex(q);
      filter.$or = [
        { title: { $regex: re, $options: 'i' } },
        { description: { $regex: re, $options: 'i' } },
      ];
    }
    if (type === 'credit' || type === 'debit') {
      filter.type = type;
    }

    const entries = await FinanceEntry.find(filter)
      .populate('category', 'name')
      .sort({ title: sort === 'title_desc' ? -1 : 1 })
      .lean();

    res.json({ entries });
  } catch (err) {
    next(err);
  }
});

router.post('/entries', async (req, res, next) => {
  try {
    const categoryId = String(req.body.categoryId || '').trim();
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const type = String(req.body.type || '').trim();
    const amount = Number(req.body.amount);

    if (!categoryId || !title) {
      return res.status(400).json({ error: 'Category and title are required' });
    }
    if (type !== 'credit' && type !== 'debit') {
      return res.status(400).json({ error: 'Type must be credit or debit' });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const category = await FinanceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const entry = await FinanceEntry.create({
      category: categoryId,
      title,
      description,
      type,
      amount,
    });
    res.status(201).json({ entry });
  } catch (err) {
    next(err);
  }
});

router.put('/entries/:id', async (req, res, next) => {
  try {
    const categoryId = String(req.body.categoryId || '').trim();
    const title = String(req.body.title || '').trim();
    const description = String(req.body.description || '').trim();
    const type = String(req.body.type || '').trim();
    const amount = Number(req.body.amount);

    if (!categoryId || !title) {
      return res.status(400).json({ error: 'Category and title are required' });
    }
    if (type !== 'credit' && type !== 'debit') {
      return res.status(400).json({ error: 'Type must be credit or debit' });
    }
    if (!Number.isFinite(amount) || amount < 0) {
      return res.status(400).json({ error: 'Valid amount is required' });
    }

    const category = await FinanceCategory.findById(categoryId);
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const entry = await FinanceEntry.findByIdAndUpdate(
      req.params.id,
      { category: categoryId, title, description, type, amount },
      { new: true, runValidators: true }
    );
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ entry });
  } catch (err) {
    next(err);
  }
});

router.delete('/entries/:id', async (req, res, next) => {
  try {
    const entry = await FinanceEntry.findByIdAndDelete(req.params.id);
    if (!entry) {
      return res.status(404).json({ error: 'Entry not found' });
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
