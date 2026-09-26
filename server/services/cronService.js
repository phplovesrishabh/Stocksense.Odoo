const cron = require('node-cron');
const { supabaseAdmin: supabase } = require('../config/supabase');
const { syncProducts } = require('./odooService');
const AuditLog = require('../models/AuditLog');

// Store active cron tasks
const tasks = [];

/**
 * Initializes all background automated jobs.
 */
function initCronJobs() {
  console.log('[Cron] Initializing automated background jobs...');

  // 1. Odoo Auto-Sync - Runs every 5 minutes
  // This satisfies the requirement: "automate to when I change one thing it consider that change and puts on the right place"
  const odooSyncTask = cron.schedule('*/5 * * * *', async () => {
    console.log('[Cron] Executing Scheduled Odoo Sync...');
    try {
      // Use credentials from Environment variables for background syncing
      const host = process.env.ODOO_HOST;
      const port = process.env.ODOO_PORT || 8069;
      const db = process.env.ODOO_DB;
      const username = process.env.ODOO_USER;
      const password = process.env.ODOO_PASSWORD;

      if (!host || !db || !username || !password) {
        console.log('[Cron] Odoo credentials missing in .env. Skipping automated sync.');
        return;
      }

      const result = await syncProducts(supabase, host, port, db, username, password);
      
      if (result.success) {
        console.log(`[Cron] Odoo Sync successful. Synced ${result.synced_count} products.`);
        
        // Log the background sync to MongoDB Audit Log for visibility
        await AuditLog.create({
          actionType: 'ODOO_SYNC',
          performedBy: {
            userId: 'SYSTEM',
            email: 'system@stocksense.local',
            role: 'system'
          },
          details: {
            syncedCount: result.synced_count,
            trigger: 'automated_cron',
            errors: result.errors
          }
        });
      } else {
        console.error('[Cron] Odoo Sync failed:', result.error);
      }
    } catch (error) {
      console.error('[Cron] Unexpected error during automated Odoo Sync:', error);
    }
  });

  tasks.push(odooSyncTask);
  console.log('[Cron] Odoo Auto-Sync scheduled (every 5 minutes).');
}

module.exports = {
  initCronJobs
};
