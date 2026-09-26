const express = require('express');
const { supabaseAdmin } = require('../config/supabase');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

/**
 * GET /api/v1/auth/me
 * Returns the currently authenticated user's profile.
 */
router.get('/me', authenticate, async (req, res, next) => {
  try {
    const { data: profile, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json({ success: true, data: profile });
  } catch (err) {
    next(err);
  }
});

/**
 * POST /api/v1/auth/update-profile
 * Allows a user to update their own display name.
 * Body: { full_name: string }
 */
router.patch('/update-profile', authenticate, async (req, res, next) => {
  try {
    const { full_name } = req.body;

    if (!full_name || typeof full_name !== 'string' || full_name.trim().length < 2) {
      return res.status(400).json({ success: false, error: 'full_name must be at least 2 characters.' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ full_name: full_name.trim() })
      .eq('id', req.user.id)
      .select('id, full_name, role')
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * GET /api/v1/auth/users
 * Manager-only: list all user profiles.
 */
router.get('/users', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ success: false, error: 'Managers only.' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .select('id, full_name, role, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

/**
 * PATCH /api/v1/auth/users/:id/role
 * Manager-only: change a user's role.
 * Body: { role: 'manager' | 'staff' }
 */
router.patch('/users/:id/role', authenticate, async (req, res, next) => {
  try {
    if (req.user.role !== 'manager') {
      return res.status(403).json({ success: false, error: 'Managers only.' });
    }

    const { role } = req.body;
    if (!['manager', 'staff'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Role must be "manager" or "staff".' });
    }

    // Prevent manager from demoting themselves
    if (req.params.id === req.user.id && role === 'staff') {
      return res.status(400).json({ success: false, error: 'You cannot demote yourself.' });
    }

    const { data, error } = await supabaseAdmin
      .from('user_profiles')
      .update({ role })
      .eq('id', req.params.id)
      .select('id, full_name, role')
      .single();

    if (error) throw error;

    res.json({ success: true, data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
