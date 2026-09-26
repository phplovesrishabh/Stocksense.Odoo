import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Loader2, Database, Link as LinkIcon, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import PageHeader from '../../components/layout/PageHeader';
import api from '../../lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('warehouses');
  const [warehouses, setWarehouses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    location: ''
  });

  const [odooConfig, setOdooConfig] = useState({
    host: '',
    port: '8069',
    db: '',
    username: '',
    password: ''
  });
  
  const [odooStatus, setOdooStatus] = useState('disconnected'); // disconnected, testing, connected, failed
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    fetchWarehouses();
  }, []);

  const fetchWarehouses = async () => {
    setLoading(true);
    try {
      const res = await api.get('/warehouses');
      setWarehouses(res.data.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load warehouses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateWarehouse = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.location) {
      return toast.error('Name and location are required');
    }

    setIsSubmitting(true);
    try {
      await api.post('/warehouses', formData);
      toast.success('Warehouse created successfully');
      setFormData({ name: '', location: '' });
      fetchWarehouses();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.error || 'Failed to create warehouse');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleTestOdoo = async () => {
    if (!odooConfig.host || !odooConfig.db || !odooConfig.username || !odooConfig.password) {
      return toast.error('Please fill all Odoo configuration fields');
    }
    
    setOdooStatus('testing');
    try {
      await api.post('/odoo/test', odooConfig);
      setOdooStatus('connected');
      toast.success('Successfully connected to Odoo');
    } catch (err) {
      setOdooStatus('failed');
      toast.error(err.response?.data?.error || 'Failed to connect to Odoo');
    }
  };

  const handleSyncOdoo = async () => {
    if (odooStatus !== 'connected') {
      return toast.error('Please test connection successfully first');
    }
    
    setIsSyncing(true);
    try {
      const res = await api.post('/odoo/sync', odooConfig);
      toast.success(`Successfully synced ${res.data.synced_count} products from Odoo`);
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to sync products from Odoo');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <PageHeader 
        title={<span className="text-gradient">Settings & Facilities</span>}
        subtitle="Manage warehouses, company settings, and integrations"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex gap-2 p-1 bg-white/5 backdrop-blur-md rounded-xl w-fit border border-white/10">
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`px-6 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'warehouses' 
                  ? 'bg-gradient-to-r from-brand-primary to-brand-secondary text-white shadow-lg shadow-brand-primary/25' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Building2 className="w-4 h-4" />
              Warehouses
            </button>
            <button
              onClick={() => setActiveTab('odoo')}
              className={`px-6 py-2.5 font-medium text-sm rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'odoo' 
                  ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/25' 
                  : 'text-text-muted hover:text-white hover:bg-white/5'
              }`}
            >
              <Database className="w-4 h-4" />
              Odoo Integration
            </button>
          </div>

          <AnimatePresence mode="wait">
            {/* Warehouses Tab Content */}
            {activeTab === 'warehouses' && (
              <motion.section 
                key="warehouses"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 bg-white/5">
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2.5 bg-brand-primary/20 rounded-xl text-brand-primary shadow-inner shadow-brand-primary/20">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-semibold text-white">Warehouses</h2>
                      <p className="text-sm text-text-secondary mt-0.5">Manage your physical storage locations and fulfillment centers.</p>
                    </div>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {/* Add New Warehouse Form */}
                  <div className="md:col-span-1 space-y-5">
                    <h3 className="text-sm font-heading font-semibold text-white tracking-wide uppercase text-brand-secondary">Add New Location</h3>
                    <form onSubmit={handleCreateWarehouse} className="space-y-5">
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Warehouse Name</label>
                        <input
                          type="text"
                          value={formData.name}
                          onChange={e => setFormData({...formData, name: e.target.value})}
                          placeholder="e.g. Main Hub"
                          className="w-full glass-input px-4 py-3 outline-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Address / Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={e => setFormData({...formData, location: e.target.value})}
                          placeholder="e.g. New York, NY"
                          className="w-full glass-input px-4 py-3 outline-none"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-brand-primary to-brand-secondary hover:from-brand-primary/90 hover:to-brand-secondary/90 text-white px-5 py-3 rounded-xl font-medium transition-all shadow-lg shadow-brand-primary/25 hover:shadow-brand-primary/40 disabled:opacity-70 mt-4"
                      >
                        {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Plus className="w-5 h-5" />}
                        Add Warehouse
                      </button>
                    </form>
                  </div>

                  {/* Warehouse List */}
                  <div className="md:col-span-2 space-y-5">
                    <h3 className="text-sm font-heading font-semibold text-white tracking-wide uppercase text-brand-primary">Active Locations ({warehouses.length})</h3>
                    
                    {loading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-8 h-8 text-brand-primary animate-spin" />
                      </div>
                    ) : warehouses.length === 0 ? (
                      <div className="text-center py-12 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <Building2 className="w-10 h-10 text-brand-primary/30 mx-auto mb-3" />
                        <p className="text-sm text-text-muted">No warehouses defined yet.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {warehouses.map(wh => (
                          <div key={wh.id} className="bg-white/5 border border-white/10 p-5 rounded-xl flex flex-col gap-2 transition-all hover:bg-white/10 hover:border-brand-primary/30 group">
                            <div className="font-medium text-white text-lg group-hover:text-brand-primary transition-colors">{wh.name}</div>
                            <div className="flex items-center gap-2 text-sm text-text-secondary">
                              <MapPin className="w-4 h-4 text-brand-secondary/70" />
                              <span>{wh.location}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </motion.section>
            )}

            {/* Odoo Tab Content */}
            {activeTab === 'odoo' && (
              <motion.section 
                key="odoo"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="glass-card overflow-hidden"
              >
                <div className="p-6 border-b border-white/10 bg-white/5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-violet-500/20 rounded-xl text-violet-400 shadow-inner shadow-violet-500/20">
                      <Database className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-heading font-semibold text-white">Odoo XML-RPC Integration</h2>
                      <p className="text-sm text-text-secondary mt-0.5">Sync products directly from your Odoo instance.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-background-dark/80 backdrop-blur-md border border-white/10 px-4 py-2 rounded-xl text-sm shadow-inner">
                    <span className="text-text-muted font-medium">Status</span>
                    <div className="h-4 w-px bg-white/10"></div>
                    <div className="flex items-center gap-2">
                      {odooStatus === 'connected' ? (
                        <><span className="relative flex h-3 w-3"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span><span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span></span><span className="text-emerald-400 font-medium">Connected</span></>
                      ) : odooStatus === 'failed' ? (
                        <><span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]"></span><span className="text-rose-400 font-medium">Failed</span></>
                      ) : (
                        <><span className="w-2.5 h-2.5 rounded-full bg-slate-500"></span><span className="text-text-muted font-medium">Not Connected</span></>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-8">
                  <div className="max-w-xl mx-auto space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2 sm:col-span-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Host URL</label>
                        <input
                          type="url"
                          placeholder="https://your-odoo-instance.com"
                          value={odooConfig.host}
                          onChange={e => setOdooConfig({...odooConfig, host: e.target.value})}
                          className="w-full glass-input px-4 py-3 outline-none"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Port</label>
                        <input
                          type="text"
                          placeholder="8069"
                          value={odooConfig.port}
                          onChange={e => setOdooConfig({...odooConfig, port: e.target.value})}
                          className="w-full glass-input px-4 py-3 outline-none font-mono text-brand-secondary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Database Name</label>
                        <input
                          type="text"
                          placeholder="my_company_db"
                          value={odooConfig.db}
                          onChange={e => setOdooConfig({...odooConfig, db: e.target.value})}
                          className="w-full glass-input px-4 py-3 outline-none font-mono text-brand-primary"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Username / Email</label>
                        <input
                          type="text"
                          placeholder="admin@example.com"
                          value={odooConfig.username}
                          onChange={e => setOdooConfig({...odooConfig, username: e.target.value})}
                          className="w-full glass-input px-4 py-3 outline-none"
                        />
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs font-medium text-text-muted uppercase tracking-wider ml-1">Password / API Key</label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={odooConfig.password}
                          onChange={e => setOdooConfig({...odooConfig, password: e.target.value})}
                          className="w-full glass-input px-4 py-3 outline-none font-mono tracking-widest"
                        />
                      </div>
                    </div>

                    <div className="pt-8 mt-4 border-t border-white/10 flex flex-col sm:flex-row justify-end gap-4">
                      <button
                        onClick={handleTestOdoo}
                        disabled={odooStatus === 'testing' || isSyncing}
                        className="flex items-center justify-center gap-2 glass-button px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-70 w-full sm:w-auto"
                      >
                        {odooStatus === 'testing' ? <Loader2 className="w-5 h-5 animate-spin text-brand-primary" /> : <LinkIcon className="w-5 h-5 text-brand-secondary" />}
                        Test Connection
                      </button>
                      
                      <button
                        onClick={handleSyncOdoo}
                        disabled={isSyncing || odooStatus !== 'connected'}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                      >
                        {isSyncing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw className="w-5 h-5" />}
                        Save & Sync Products
                      </button>
                    </div>
                  </div>
                </div>
              </motion.section>
            )}
          </AnimatePresence>

        </div>
      </div>
    </div>
  );
}
