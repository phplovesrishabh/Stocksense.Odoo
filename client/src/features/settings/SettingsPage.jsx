import React, { useState, useEffect } from 'react';
import { Building2, Plus, MapPin, Loader2, Database, Link as LinkIcon, RefreshCw, CheckCircle2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
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
        title="Settings & Facilities" 
        subtitle="Manage warehouses, company settings, and integrations"
      />

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto space-y-6">
          
          {/* Tabs Navigation */}
          <div className="flex border-b border-[#2E3348]">
            <button
              onClick={() => setActiveTab('warehouses')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 ${
                activeTab === 'warehouses' 
                  ? 'border-[#4F6EF7] text-[#4F6EF7]' 
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              Warehouses
            </button>
            <button
              onClick={() => setActiveTab('odoo')}
              className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 flex items-center gap-2 ${
                activeTab === 'odoo' 
                  ? 'border-[#4F6EF7] text-[#4F6EF7]' 
                  : 'border-transparent text-[#94A3B8] hover:text-[#F1F5F9]'
              }`}
            >
              <Database className="w-4 h-4" />
              Odoo Integration
            </button>
          </div>

          {/* Warehouses Tab Content */}
          {activeTab === 'warehouses' && (
            <section className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-[#2E3348]">
                <div className="flex items-center gap-3 mb-1">
                  <div className="p-2 bg-[#4F6EF7]/10 rounded-lg text-[#4F6EF7]">
                    <Building2 className="w-5 h-5" />
                  </div>
                  <h2 className="text-lg font-semibold text-[#F1F5F9]">Warehouses</h2>
                </div>
                <p className="text-sm text-[#94A3B8] ml-11">Manage your physical storage locations and fulfillment centers.</p>
              </div>

              <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Add New Warehouse Form */}
                <div className="md:col-span-1 space-y-4">
                  <h3 className="text-sm font-medium text-[#F1F5F9]">Add New Location</h3>
                  <form onSubmit={handleCreateWarehouse} className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#94A3B8]">Warehouse Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        placeholder="e.g. Main Hub"
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none transition-all"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#94A3B8]">Address / Location</label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={e => setFormData({...formData, location: e.target.value})}
                        placeholder="e.g. New York, NY"
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] focus:ring-1 focus:ring-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 bg-[#4F6EF7] hover:bg-[#5b78fa] text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                      {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                      Add Warehouse
                    </button>
                  </form>
                </div>

                {/* Warehouse List */}
                <div className="md:col-span-2 space-y-4">
                  <h3 className="text-sm font-medium text-[#F1F5F9]">Active Locations ({warehouses.length})</h3>
                  
                  {loading ? (
                    <div className="flex justify-center py-8">
                      <Loader2 className="w-6 h-6 text-[#4F6EF7] animate-spin" />
                    </div>
                  ) : warehouses.length === 0 ? (
                    <div className="text-center py-8 bg-[#0F1117] rounded-lg border border-dashed border-[#2E3348]">
                      <Building2 className="w-8 h-8 text-[#94A3B8] mx-auto mb-2 opacity-50" />
                      <p className="text-sm text-[#94A3B8]">No warehouses defined yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {warehouses.map(wh => (
                        <div key={wh.id} className="bg-[#0F1117] border border-[#2E3348] p-4 rounded-lg flex flex-col gap-2 transition-all hover:border-[#4F6EF7]/50">
                          <div className="font-medium text-[#F1F5F9]">{wh.name}</div>
                          <div className="flex items-center gap-1.5 text-xs text-[#94A3B8]">
                            <MapPin className="w-3.5 h-3.5" />
                            <span>{wh.location}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}

          {/* Odoo Tab Content */}
          {activeTab === 'odoo' && (
            <section className="bg-[#1A1D27] rounded-xl border border-[#2E3348] overflow-hidden animate-in fade-in duration-200">
              <div className="p-6 border-b border-[#2E3348] flex justify-between items-start sm:items-center flex-col sm:flex-row gap-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <div className="p-2 bg-[#7C3AED]/10 rounded-lg text-[#7C3AED]">
                      <Database className="w-5 h-5" />
                    </div>
                    <h2 className="text-lg font-semibold text-[#F1F5F9]">Odoo XML-RPC Integration</h2>
                  </div>
                  <p className="text-sm text-[#94A3B8] ml-11">Sync products directly from your Odoo instance.</p>
                </div>

                <div className="flex items-center gap-2 bg-[#0F1117] border border-[#2E3348] px-3 py-1.5 rounded-lg text-sm">
                  <span className="text-[#94A3B8]">Status:</span>
                  <div className="flex items-center gap-1.5">
                    {odooStatus === 'connected' ? (
                      <><span className="w-2 h-2 rounded-full bg-emerald-400"></span><span className="text-emerald-400 font-medium">Connected</span></>
                    ) : odooStatus === 'failed' ? (
                      <><span className="w-2 h-2 rounded-full bg-red-400"></span><span className="text-red-400 font-medium">Failed</span></>
                    ) : (
                      <><span className="w-2 h-2 rounded-full bg-[#94A3B8]"></span><span className="text-[#94A3B8] font-medium">Not Connected</span></>
                    )}
                  </div>
                </div>
              </div>

              <div className="p-6">
                <div className="max-w-xl mx-auto space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-[#94A3B8]">Host URL</label>
                      <input
                        type="url"
                        placeholder="https://your-odoo-instance.com"
                        value={odooConfig.host}
                        onChange={e => setOdooConfig({...odooConfig, host: e.target.value})}
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none"
                      />
                    </div>
                    
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#94A3B8]">Port</label>
                      <input
                        type="text"
                        placeholder="8069"
                        value={odooConfig.port}
                        onChange={e => setOdooConfig({...odooConfig, port: e.target.value})}
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#94A3B8]">Database Name</label>
                      <input
                        type="text"
                        placeholder="my_company_db"
                        value={odooConfig.db}
                        onChange={e => setOdooConfig({...odooConfig, db: e.target.value})}
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none font-mono"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#94A3B8]">Username / Email</label>
                      <input
                        type="text"
                        placeholder="admin@example.com"
                        value={odooConfig.username}
                        onChange={e => setOdooConfig({...odooConfig, username: e.target.value})}
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#94A3B8]">Password / API Key</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={odooConfig.password}
                        onChange={e => setOdooConfig({...odooConfig, password: e.target.value})}
                        className="w-full bg-[#0F1117] border border-[#2E3348] focus:border-[#4F6EF7] text-[#F1F5F9] rounded-lg px-3 py-2 outline-none font-mono"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#2E3348] flex justify-end gap-3">
                    <button
                      onClick={handleTestOdoo}
                      disabled={odooStatus === 'testing' || isSyncing}
                      className="flex items-center gap-2 bg-[#252836] hover:bg-[#2E3348] text-[#F1F5F9] px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-70"
                    >
                      {odooStatus === 'testing' ? <Loader2 className="w-4 h-4 animate-spin" /> : <LinkIcon className="w-4 h-4" />}
                      Test Connection
                    </button>
                    
                    <button
                      onClick={handleSyncOdoo}
                      disabled={isSyncing || odooStatus !== 'connected'}
                      className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-lg font-medium transition-colors shadow-md shadow-[#7C3AED]/20 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSyncing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                      Save & Sync Products
                    </button>
                  </div>
                </div>
              </div>
            </section>
          )}

        </div>
      </div>
    </div>
  );
}
