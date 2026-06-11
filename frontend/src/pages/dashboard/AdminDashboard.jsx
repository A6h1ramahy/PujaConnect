import React, { useEffect, useState } from 'react';
import { HiShieldCheck, HiX, HiUsers, HiClipboardList, HiViewGrid, HiBan, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getAdminStats, getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPanditAdmin,
  getAllUsers, toggleSuspend, getAllBookingsAdmin, getAllRitualsAdmin,
  createRitual, updateRitual, deleteRitual,
} from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PanditAvatar from '../../components/common/PanditAvatar';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingPandits, setPendingPandits] = useState([]);
  const [allPandits, setAllPandits] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ritualForm, setRitualForm] = useState({ pujaName: '', description: '', duration: '', locationType: 'Both', priceMin: 0, priceMax: 0, requiredMaterials: '' });
  const [editingRitual, setEditingRitual] = useState(null);
  const [savingRitual, setSavingRitual] = useState(false);

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (activeTab === 'pandits')  fetchPandits();
    if (activeTab === 'users')    fetchUsers();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'rituals')  fetchRituals();
  }, [activeTab]);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [statsRes, pendingRes] = await Promise.all([getAdminStats(), getPendingPandits()]);
      setStats(statsRes.data);
      setPendingPandits(pendingRes.data.pandits || []);
    } catch { } finally {
      setLoading(false);
    }
  };

  const fetchPandits = async () => {
    try { const { data } = await getAllPanditsAdmin(); setAllPandits(data.pandits || []); } catch {}
  };
  const fetchUsers = async () => {
    try { const { data } = await getAllUsers(); setUsers(data.users || []); } catch {}
  };
  const fetchBookings = async () => {
    try { const { data } = await getAllBookingsAdmin(); setBookings(data.bookings || []); } catch {}
  };
  const fetchRituals = async () => {
    try { const { data } = await getAllRitualsAdmin(); setRituals(data.rituals || []); } catch {}
  };

  const handleVerify = async (id) => {
    try {
      await verifyPandit(id);
      toast.success('Pandit verified!');
      setPendingPandits((prev) => prev.filter((p) => p._id !== id));
      setStats((s) => s ? { ...s, pandits: { ...s.pandits, pending: s.pandits.pending - 1, verified: s.pandits.verified + 1 } } : s);
    } catch { toast.error('Failed to verify'); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:') || 'Profile rejected';
    try {
      await rejectPanditAdmin(id, reason);
      toast.success('Pandit rejected');
      setPendingPandits((prev) => prev.filter((p) => p._id !== id));
    } catch { toast.error('Failed to reject'); }
  };

  const handleSuspend = async (id) => {
    try {
      const { data } = await toggleSuspend(id);
      toast.success(data.message);
      setUsers((prev) => prev.map((u) => u._id === id ? data.user : u));
    } catch { toast.error('Failed to update user'); }
  };

  const handleRitualSubmit = async (e) => {
    e.preventDefault();
    setSavingRitual(true);
    try {
      const payload = {
        pujaName:         ritualForm.pujaName,
        description:      ritualForm.description,
        duration:         ritualForm.duration,
        locationType:     ritualForm.locationType,
        priceRange:       { min: Number(ritualForm.priceMin), max: Number(ritualForm.priceMax) },
        requiredMaterials: ritualForm.requiredMaterials.split(',').map((m) => m.trim()).filter(Boolean),
      };
      if (editingRitual) {
        await updateRitual(editingRitual, payload);
        toast.success('Ritual updated');
      } else {
        await createRitual(payload);
        toast.success('Ritual created');
      }
      setRitualForm({ pujaName: '', description: '', duration: '', locationType: 'Both', priceMin: 0, priceMax: 0, requiredMaterials: '' });
      setEditingRitual(null);
      fetchRituals();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to save ritual');
    } finally {
      setSavingRitual(false);
    }
  };

  const handleDeleteRitual = async (id) => {
    if (!window.confirm('Delete this ritual?')) return;
    try {
      await deleteRitual(id);
      toast.success('Ritual deleted');
      fetchRituals();
    } catch { toast.error('Failed to delete'); }
  };

  const editRitual = (ritual) => {
    setEditingRitual(ritual._id);
    setRitualForm({
      pujaName:         ritual.pujaName,
      description:      ritual.description,
      duration:         ritual.duration,
      locationType:     ritual.locationType,
      priceMin:         ritual.priceRange?.min || 0,
      priceMax:         ritual.priceRange?.max || 0,
      requiredMaterials: (ritual.requiredMaterials || []).join(', '),
    });
    setActiveTab('rituals');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const tabs = [
    { id: 'overview',  label: 'Overview',     icon: HiViewGrid },
    { id: 'pandits',   label: 'Pandits',      icon: MdOutlineTempleHindu },
    { id: 'users',     label: 'Users',        icon: HiUsers },
    { id: 'bookings',  label: 'Bookings',     icon: HiClipboardList },
    { id: 'rituals',   label: 'Rituals',      icon: MdOutlineTempleHindu },
  ];

  return (
    <div className="min-h-screen bg-light-bg dark:bg-dark-bg animate-fade-in">
      {/* Header */}
      <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-8">
        <div className="page-container">
          <h1 className="section-title mb-1">Admin Dashboard</h1>
          <p className="text-stone-500 dark:text-stone-400">PujaConnect administration panel</p>
        </div>
      </div>

      <div className="page-container py-8">
        {loading ? <LoadingSpinner size="lg" /> : (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  id={`admin-tab-${tab.id}`}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all ${
                    activeTab === tab.id
                      ? 'bg-saffron-gradient text-white shadow-glow-saffron'
                      : 'text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  <tab.icon className="text-base" /> {tab.label}
                  {tab.id === 'overview' && pendingPandits.length > 0 && (
                    <span className="ml-auto bg-crimson-500 text-white text-xs rounded-full px-1.5 py-0.5">{pendingPandits.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Main */}
            <div className="lg:col-span-4">
              {/* Overview */}
              {activeTab === 'overview' && stats && (
                <div className="animate-fade-in">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    {[
                      { label: 'Registered Users',   value: stats.users.total,          color: 'text-blue-600 dark:text-blue-400' },
                      { label: 'Verified Pandits',   value: stats.pandits.verified,     color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Total Bookings',     value: stats.bookings.total,       color: 'text-saffron-600 dark:text-saffron-400' },
                      { label: 'Pending Pandits',    value: stats.pandits.pending,      color: 'text-amber-600 dark:text-amber-400' },
                      { label: 'Active Rituals',     value: stats.rituals.total,        color: 'text-violet-600 dark:text-violet-400' },
                      { label: 'Pending Bookings',   value: stats.bookings.pending,     color: 'text-amber-600 dark:text-amber-400' },
                      { label: 'Accepted Bookings',  value: stats.bookings.accepted,    color: 'text-emerald-600 dark:text-emerald-400' },
                      { label: 'Rejected Bookings',  value: stats.bookings.rejected,    color: 'text-crimson-600 dark:text-crimson-400' },
                    ].map((s) => (
                      <div key={s.label} className="stat-card">
                        <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
                        <p className="text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
                      </div>
                    ))}
                  </div>

                  {/* Pending verifications */}
                  <div>
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">
                      Pending Verifications ({pendingPandits.length})
                    </h3>
                    {pendingPandits.length === 0 ? (
                      <div className="card p-6 text-center text-stone-400">No pending verifications 🎉</div>
                    ) : (
                      <div className="space-y-3">
                        {pendingPandits.map((p) => (
                          <div key={p._id} id={`pending-pandit-${p._id}`} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                            <div className="flex items-center gap-3 flex-1">
                              <PanditAvatar photo={p.photo} name={p.userId?.name} size={40} className="rounded-xl" />
                              <div>
                                <p className="font-semibold text-stone-900 dark:text-stone-100">{p.userId?.name}</p>
                                <p className="text-xs text-stone-500 dark:text-stone-400">{p.userId?.email}</p>
                                <p className="text-xs text-stone-400">{p.location?.city} · {p.yearsOfExperience} yrs exp.</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button id={`admin-verify-${p._id}`} onClick={() => handleVerify(p._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold transition-colors">
                                <HiShieldCheck /> Verify
                              </button>
                              <button id={`admin-reject-${p._id}`} onClick={() => handleReject(p._id)} className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-2 border-crimson-500 text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 text-sm font-semibold transition-colors">
                                <HiX /> Reject
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Pandits */}
              {activeTab === 'pandits' && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">All Pandits</h2>
                  <div className="space-y-2">
                    {allPandits.map((p) => (
                      <div key={p._id} className="card p-4 flex items-center gap-3 flex-wrap">
                        <PanditAvatar photo={p.photo} name={p.userId?.name} size={32} className="rounded-lg" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 dark:text-stone-100 text-sm truncate">{p.userId?.name}</p>
                          <p className="text-xs text-stone-400 truncate">{p.userId?.email} · {p.location?.city}</p>
                        </div>
                        <StatusBadge status={p.verificationStatus} />
                        {p.verificationStatus === 'pending' && (
                          <div className="flex gap-2">
                            <button onClick={() => handleVerify(p._id)} className="btn-sm px-3 py-1.5 rounded-lg bg-emerald-500 text-white text-xs font-semibold hover:bg-emerald-600">Verify</button>
                            <button onClick={() => handleReject(p._id)} className="btn-sm px-3 py-1.5 rounded-lg border border-crimson-500 text-crimson-600 dark:text-crimson-400 text-xs font-semibold">Reject</button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">All Users ({users.length})</h2>
                  <div className="space-y-2">
                    {users.map((u) => (
                      <div key={u._id} id={`admin-user-${u._id}`} className="card p-4 flex items-center gap-3 flex-wrap">
                        <div className="w-8 h-8 rounded-lg bg-stone-100 dark:bg-stone-800 flex items-center justify-center shrink-0">
                          <HiUsers className="text-stone-500" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">{u.name}</p>
                          <p className="text-xs text-stone-400">{u.email} · {u.role} · {u.city || 'N/A'}</p>
                        </div>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'pandit' ? 'bg-saffron-100 dark:bg-saffron-900/30 text-saffron-700 dark:text-saffron-400' : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300'}`}>
                          {u.role}
                        </span>
                        {u.isSuspended && <span className="badge-rejected">Suspended</span>}
                        <button
                          id={`toggle-suspend-${u._id}`}
                          onClick={() => handleSuspend(u._id)}
                          className={`flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border transition-colors ${
                            u.isSuspended
                              ? 'border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                              : 'border-crimson-500 text-crimson-600 dark:text-crimson-400 hover:bg-crimson-50 dark:hover:bg-crimson-900/20'
                          }`}
                        >
                          <HiBan className="text-sm" />
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Bookings */}
              {activeTab === 'bookings' && (
                <div className="animate-fade-in">
                  <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 mb-4">All Bookings ({bookings.length})</h2>
                  <div className="space-y-2">
                    {bookings.map((b) => (
                      <div key={b._id} className="card p-4 flex items-center gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">
                            {b.ritual?.pujaName} — {b.user?.name} → {b.pandit?.userId?.name}
                          </p>
                          <p className="text-xs text-stone-400">
                            {b.date ? format(new Date(b.date), 'MMM dd, yyyy') : ''} · {b.time} · {b.locationType}
                          </p>
                        </div>
                        <StatusBadge status={b.status} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Rituals */}
              {activeTab === 'rituals' && (
                <div className="animate-fade-in space-y-6">
                  {/* Form */}
                  <div className="card p-6">
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-4">
                      {editingRitual ? 'Edit Ritual' : 'Add New Ritual'}
                    </h3>
                    <form id="ritual-form" onSubmit={handleRitualSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label htmlFor="ritual-name" className="label">Puja Name</label>
                          <input id="ritual-name" type="text" value={ritualForm.pujaName} onChange={(e) => setRitualForm({ ...ritualForm, pujaName: e.target.value })} className="input-field" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-duration" className="label">Duration</label>
                          <input id="ritual-duration" type="text" value={ritualForm.duration} onChange={(e) => setRitualForm({ ...ritualForm, duration: e.target.value })} placeholder="2-3 hours" className="input-field" required />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="ritual-desc" className="label">Description</label>
                        <textarea id="ritual-desc" value={ritualForm.description} onChange={(e) => setRitualForm({ ...ritualForm, description: e.target.value })} rows={3} className="input-field resize-none" required />
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="form-group">
                          <label htmlFor="ritual-loc-type" className="label">Location Type</label>
                          <select id="ritual-loc-type" value={ritualForm.locationType} onChange={(e) => setRitualForm({ ...ritualForm, locationType: e.target.value })} className="input-field">
                            <option>Home</option>
                            <option>Temple</option>
                            <option>Both</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-price-min" className="label">Price Min (₹)</label>
                          <input id="ritual-price-min" type="number" min="0" value={ritualForm.priceMin} onChange={(e) => setRitualForm({ ...ritualForm, priceMin: e.target.value })} className="input-field" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-price-max" className="label">Price Max (₹)</label>
                          <input id="ritual-price-max" type="number" min="0" value={ritualForm.priceMax} onChange={(e) => setRitualForm({ ...ritualForm, priceMax: e.target.value })} className="input-field" />
                        </div>
                      </div>
                      <div className="form-group">
                        <label htmlFor="ritual-materials" className="label">Required Materials <span className="text-stone-400 font-normal">(comma-separated)</span></label>
                        <input id="ritual-materials" type="text" value={ritualForm.requiredMaterials} onChange={(e) => setRitualForm({ ...ritualForm, requiredMaterials: e.target.value })} placeholder="Flowers, Ghee, Coconut..." className="input-field" />
                      </div>
                      <div className="flex gap-3">
                        <button type="submit" id="save-ritual" disabled={savingRitual} className="btn-primary">
                          <HiPlus /> {editingRitual ? 'Update Ritual' : 'Create Ritual'}
                        </button>
                        {editingRitual && (
                          <button type="button" onClick={() => { setEditingRitual(null); setRitualForm({ pujaName: '', description: '', duration: '', locationType: 'Both', priceMin: 0, priceMax: 0, requiredMaterials: '' }); }} className="btn-secondary">
                            Cancel
                          </button>
                        )}
                      </div>
                    </form>
                  </div>

                  {/* Ritual list */}
                  <div>
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">Ritual Catalog</h3>
                    <div className="space-y-2">
                      {rituals.map((r) => (
                        <div key={r._id} id={`ritual-item-${r._id}`} className="card p-4 flex items-center gap-3">
                          <div className="flex-1">
                            <p className="font-medium text-stone-900 dark:text-stone-100 text-sm">{r.pujaName}</p>
                            <p className="text-xs text-stone-400">{r.duration} · {r.locationType} · ₹{r.priceRange?.min?.toLocaleString('en-IN')}–₹{r.priceRange?.max?.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="flex gap-2">
                            <button id={`edit-ritual-${r._id}`} onClick={() => editRitual(r)} className="p-2 rounded-lg text-stone-400 hover:text-saffron-500 hover:bg-saffron-50 dark:hover:bg-saffron-900/20 transition-colors" title="Edit"><HiPencil /></button>
                            <button id={`delete-ritual-${r._id}`} onClick={() => handleDeleteRitual(r._id)} className="p-2 rounded-lg text-stone-400 hover:text-crimson-500 hover:bg-crimson-50 dark:hover:bg-crimson-900/20 transition-colors" title="Delete"><HiTrash /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
