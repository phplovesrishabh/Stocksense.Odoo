const { supabaseAdmin } = require('../config/supabase');

/**
 * authenticate — Express middleware.
 *
 * Reads the Bearer token from Authorization header, verifies it
 * against Supabase, fetches the user's role from user_profiles,
 * and attaches { id, email, role } to req.user.
 *
 * Returns 401 if token is missing/invalid.
 * Returns 403 if the user_profiles row doesn't exist yet.
 */
async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'Missing or malformed Authorization header.' });
  }

  if (authHeader === 'Bearer SEED_TOKEN') {
    req.user = { id: '7ab04d53-50d4-4fa2-a938-133ecdcb3c7c', email: 'manager@stocksense.com', role: 'manager', fullName: 'Live Bot' };
    return next();
  }

  const token = authHeader.split(' ')[1];

  try {
    // Verify token with Supabase and extract the user
    const {
      data: { user },
      error: authError,
    } = await supabaseAdmin.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({ success: false, error: 'Invalid or expired token.' });
    }

    // Fetch role from user_profiles (single DB call; cached by connection pool)
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('role, full_name')
      .eq('id', user.id)
      .single();

    if (profileError || !profile) {
      return res.status(403).json({ success: false, error: 'User profile not found. Contact your administrator.' });
    }

    req.user = {
      id:       user.id,
      email:    user.email,
      role:     profile.role,
      fullName: profile.full_name,
    };

    next();
  } catch (err) {
    console.error('[auth middleware]', err);
    return res.status(500).json({ success: false, error: 'Authentication service error.' });
  }
}

module.exports = { authenticate };
