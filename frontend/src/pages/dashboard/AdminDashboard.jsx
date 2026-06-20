import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { HiShieldCheck, HiX, HiUsers, HiClipboardList, HiViewGrid, HiBan, HiPlus, HiPencil, HiTrash, HiEye, HiUpload } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getAdminStats, getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPanditAdmin,
  getAllUsers, toggleSuspend, getAllBookingsAdmin, getAllRitualsAdmin,
  createRitual, updateRitual, deleteRitual, uploadRitualImage
} from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PanditAvatar from '../../components/common/PanditAvatar';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';

const getCategoryColor = (category) => {
  switch (category) {
    case 'Shiva Pujas':
      return 'bg-purple-50 text-purple-700 dark:bg-purple-950/30 dark:text-purple-400 border-purple-100 dark:border-purple-900/50';
    case 'Vishnu Pujas':
      return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 border-blue-100 dark:border-blue-900/50';
    case 'Devi Pujas':
      return 'bg-pink-50 text-pink-700 dark:bg-pink-950/30 dark:text-pink-400 border-pink-100 dark:border-pink-900/50';
    case 'Griha & Property Pujas':
      return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border-amber-100 dark:border-amber-900/50';
    case 'Marriage & Family Rituals':
      return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 border-rose-100 dark:border-rose-900/50';
    case 'Child & Sanskar Ceremonies':
      return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50';
    case 'Festival Pujas':
      return 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/30 dark:text-yellow-400 border-yellow-100 dark:border-yellow-900/50';
    case 'Business & Career Pujas':
      return 'bg-teal-50 text-teal-700 dark:bg-teal-950/30 dark:text-teal-400 border-teal-100 dark:border-teal-900/50';
    case 'Health & Protection Pujas':
      return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/30 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50';
    case 'Homa & Havan Rituals':
      return 'bg-orange-50 text-orange-700 dark:bg-orange-950/30 dark:text-orange-400 border-orange-100 dark:border-orange-900/50';
    default:
      return 'bg-stone-50 text-stone-700 dark:bg-stone-900/30 dark:text-stone-400 border-stone-100 dark:border-stone-850';
  }
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [pendingPandits, setPendingPandits] = useState([]);
  const [allPandits, setAllPandits] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('');
  const [panditSearch, setPanditSearch] = useState('');
  const [panditStatusFilter, setPanditStatusFilter] = useState('all');

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const term = userSearch.toLowerCase();
    return (
      u.name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      (u.phone && u.phone.toLowerCase().includes(term))
    );
  });

  const filteredPandits = allPandits.filter((p) => {
    const term = panditSearch.toLowerCase();
    const nameMatch = p.userId?.name?.toLowerCase().includes(term) || false;
    const emailMatch = p.userId?.email?.toLowerCase().includes(term) || false;
    const cityMatch = p.location?.city?.toLowerCase().includes(term) || false;
    const ritualMatch = p.supportedRituals?.some((r) => r.pujaName.toLowerCase().includes(term)) || false;
    const searchMatch = nameMatch || emailMatch || cityMatch || ritualMatch;
    
    if (panditStatusFilter === 'all') return searchMatch;
    return searchMatch && p.verificationStatus === panditStatusFilter;
  });

  const [ritualForm, setRitualForm] = useState({
    pujaName: '',
    slug: '',
    category: 'Griha & Property Pujas',
    description: '',
    shortDescription: '',
    duration: '',
    durationMinutes: 120,
    estimatedMaterialCost: 0,
    priceMin: 0,
    priceMax: 0,
    locationType: 'Both',
    isActive: true,
    featured: false,
    popular: false,
    requiredMaterials: '',
    searchKeywords: '',
    occasionTags: '',
    supportedRegions: '',
    imageUrl: '',
    bookingCount: 0
  });
  const [editingRitual, setEditingRitual] = useState(null);
  const [selectedRitual, setSelectedRitual] = useState(null);
  const [savingRitual, setSavingRitual] = useState(false);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadError, setUploadError] = useState('');

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
    if (!window.confirm('Are you sure you want to verify and approve this Pandit?')) return;
    try {
      await verifyPandit(id);
      toast.success('Pandit verified!');
      setPendingPandits((prev) => prev.filter((p) => p._id !== id));
      setStats((s) => s ? { ...s, pandits: { ...s.pandits, pending: s.pandits.pending - 1, verified: s.pandits.verified + 1 } } : s);
    } catch { toast.error('Failed to verify'); }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Reason for rejection:');
    if (reason === null) return;
    if (!window.confirm(`Are you sure you want to reject this Pandit profile? Reason: "${reason || 'Profile rejected'}"`)) return;
    try {
      await rejectPanditAdmin(id, reason || 'Profile rejected');
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

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      setUploadError('Only image files (jpg, png, webp) are allowed');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be under 5MB');
      return;
    }

    setUploadError('');
    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      const { data } = await uploadRitualImage(formData, (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(percentCompleted);
      });

      setRitualForm((prev) => ({ ...prev, imageUrl: data.imageUrl }));
      toast.success('Image uploaded successfully!');
    } catch (err) {
      console.error(err);
      setUploadError(err?.response?.data?.message || 'Failed to upload image');
      toast.error('Image upload failed');
    } finally {
      setUploadingImage(false);
    }
  };

  const resetRitualForm = () => {
    setEditingRitual(null);
    setRitualForm({
      pujaName: '',
      slug: '',
      category: 'Griha & Property Pujas',
      description: '',
      shortDescription: '',
      duration: '',
      durationMinutes: 120,
      estimatedMaterialCost: 0,
      priceMin: 0,
      priceMax: 0,
      locationType: 'Both',
      isActive: true,
      featured: false,
      popular: false,
      requiredMaterials: '',
      searchKeywords: '',
      occasionTags: '',
      supportedRegions: '',
      imageUrl: '',
      bookingCount: 0
    });
    setUploadError('');
    setUploadProgress(0);
  };

  const handleRitualSubmit = async (e) => {
    e.preventDefault();
    setSavingRitual(true);
    try {
      const payload = {
        pujaName:              ritualForm.pujaName,
        slug:                  ritualForm.slug,
        category:              ritualForm.category,
        description:           ritualForm.description,
        shortDescription:      ritualForm.shortDescription,
        duration:              ritualForm.duration,
        durationMinutes:       Number(ritualForm.durationMinutes) || 120,
        estimatedMaterialCost: Number(ritualForm.estimatedMaterialCost) || 0,
        priceRange:            { min: Number(ritualForm.priceMin), max: Number(ritualForm.priceMax) },
        locationType:          ritualForm.locationType,
        isActive:              ritualForm.isActive,
        featured:              ritualForm.featured,
        popular:               ritualForm.popular,
        requiredMaterials:     ritualForm.requiredMaterials.split(',').map((m) => m.trim()).filter(Boolean),
        searchKeywords:        ritualForm.searchKeywords.split(',').map((k) => k.trim()).filter(Boolean),
        occasionTags:          ritualForm.occasionTags.split(',').map((t) => t.trim()).filter(Boolean),
        supportedRegions:      ritualForm.supportedRegions.split(',').map((r) => r.trim()).filter(Boolean),
        imageUrl:              ritualForm.imageUrl,
      };

      if (editingRitual) {
        await updateRitual(editingRitual, payload);
        toast.success('Ritual updated');
      } else {
        await createRitual(payload);
        toast.success('Ritual created');
      }
      resetRitualForm();
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
      pujaName:              ritual.pujaName,
      slug:                  ritual.slug || '',
      category:              ritual.category || 'Griha & Property Pujas',
      description:           ritual.description || '',
      shortDescription:      ritual.shortDescription || '',
      duration:              ritual.duration || '',
      durationMinutes:       ritual.durationMinutes || 120,
      estimatedMaterialCost: ritual.estimatedMaterialCost || 0,
      priceMin:              ritual.priceRange?.min || 0,
      priceMax:              ritual.priceRange?.max || 0,
      locationType:          ritual.locationType || 'Both',
      isActive:              ritual.isActive !== undefined ? ritual.isActive : true,
      featured:              ritual.featured || false,
      popular:               ritual.popular || false,
      requiredMaterials:     (ritual.requiredMaterials || []).join(', '),
      searchKeywords:        (ritual.searchKeywords || []).join(', '),
      occasionTags:          (ritual.occasionTags || []).join(', '),
      supportedRegions:      (ritual.supportedRegions || []).join(', '),
      imageUrl:              ritual.imageUrl || '',
      bookingCount:          ritual.bookingCount || 0,
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
    <PageTransition>
      <div className="min-h-screen bg-light-bg dark:bg-dark-bg transition-colors duration-300">
        {/* Header */}
        <div className="bg-light-surface dark:bg-dark-surface border-b border-light-border dark:border-dark-border py-8 transition-colors duration-300">
          <div className="page-container">
            <h1 className="section-title mb-1 text-gradient">Admin Dashboard</h1>
            <p className="text-stone-500 dark:text-stone-400">PujaConnect administration panel</p>
          </div>
        </div>

        <div className="page-container py-8">
          {loading ? <LoadingSpinner size="lg" /> : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              {/* Sidebar */}
              <ScrollReveal className="lg:col-span-1">
                <div className="space-y-2">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      id={`admin-tab-${tab.id}`}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-300 ${
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
              </ScrollReveal>

              {/* Main */}
              <div className="lg:col-span-4">
                {/* Overview */}
                {activeTab === 'overview' && stats && (
                  <div className="animate-fade-in">
                    {/* Stats grid */}
                    <StaggerContainer className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: 'Total Users',        value: stats.users.total,          color: 'text-blue-600 dark:text-blue-400' },
                        { label: 'Total Pandits',      value: stats.pandits.total,        color: 'text-purple-600 dark:text-purple-400' },
                        { label: 'Verified Pandits',   value: stats.pandits.verified,     color: 'text-emerald-600 dark:text-emerald-400' },
                        { label: 'Total Admins',       value: stats.admins?.total || 0,   color: 'text-rose-600 dark:text-rose-400' },
                        { label: 'Total Bookings',     value: stats.bookings.total,       color: 'text-saffron-600 dark:text-saffron-400' },
                        { label: 'Active Rituals',     value: stats.rituals.total,        color: 'text-violet-600 dark:text-violet-400' },
                        { label: 'Pending Pandits',    value: stats.pandits.pending,      color: 'text-amber-600 dark:text-amber-400' },
                        { label: 'Pending Bookings',   value: stats.bookings.pending,     color: 'text-amber-600 dark:text-amber-400' },
                      ].map((s) => (
                        <StaggerItem key={s.label}>
                          <div className="stat-card">
                            <p className={`text-3xl font-display font-bold ${s.color}`}>{s.value}</p>
                            <p className="text-xs text-stone-500 dark:text-stone-400">{s.label}</p>
                          </div>
                        </StaggerItem>
                      ))}
                    </StaggerContainer>

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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Service Providers / Pandits ({allPandits.length})</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                      <div className="relative w-full sm:w-64">
                        <input
                          type="text"
                          placeholder="Search pandits by name, email, city, ritual..."
                          value={panditSearch}
                          onChange={(e) => setPanditSearch(e.target.value)}
                          className="input-field py-2 pl-9 pr-4 text-sm rounded-xl w-full"
                        />
                        <MdOutlineTempleHindu className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                      </div>
                      <select
                        value={panditStatusFilter}
                        onChange={(e) => setPanditStatusFilter(e.target.value)}
                        className="input-field py-2 px-3 text-sm rounded-xl w-full sm:w-40"
                      >
                        <option value="all">All Verification</option>
                        <option value="pending">Pending Only</option>
                        <option value="verified">Verified Only</option>
                        <option value="rejected">Rejected Only</option>
                        <option value="suspended">Suspended Only</option>
                      </select>
                    </div>
                  </div>

                  {filteredPandits.length === 0 ? (
                    <div className="card p-8 text-center text-stone-400">No pandits found matching the search criteria.</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredPandits.map((p) => (
                        <div key={p._id} className="card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-205">
                          <div className="flex items-start gap-4 flex-1 min-w-0">
                            <PanditAvatar photo={p.photo} name={p.userId?.name} size={44} className="rounded-xl shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{p.userId?.name || 'N/A'}</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                ✉️ {p.userId?.email || 'N/A'} {p.userId?.phone && ` · 📞 ${p.userId?.phone}`} {p.location?.city && ` · 📍 ${p.location.city}, ${p.location.state || p.location.region || ''}`}
                              </p>
                              <div className="flex flex-wrap gap-2 items-center mt-2.5">
                                <span className="text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-0.5 rounded-lg border border-stone-200/40 dark:border-stone-700/45">
                                  🎓 {p.yearsOfExperience || 0} Yrs Exp
                                </span>
                                {p.languagesSpoken && p.languagesSpoken.length > 0 && (
                                  <span className="text-[11px] font-semibold bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 px-2.5 py-0.5 rounded-lg border border-stone-200/40 dark:border-stone-700/45">
                                    🗣️ {p.languagesSpoken.join(', ')}
                                  </span>
                                )}
                                <span className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-lg border ${p.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-450 border-emerald-100 dark:border-emerald-900/30' : 'bg-stone-50 dark:bg-stone-950/20 text-stone-400 border-stone-200/40'}`}>
                                  {p.isActive ? '● Available' : '○ Unavailable'}
                                </span>
                              </div>
                              {p.supportedRituals && p.supportedRituals.length > 0 && (
                                <div className="flex flex-wrap gap-1 mt-2.5">
                                  {p.supportedRituals.map((r) => (
                                    <span key={r._id} className="text-[10px] font-medium bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-450 border border-saffron-100/45 dark:border-saffron-900/30 px-2 py-0.5 rounded-md">
                                      {r.pujaName}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            <StatusBadge status={p.verificationStatus} />
                            <Link to={`/admin/pandits/${p._id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors">
                              Manage Profile
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Users */}
              {activeTab === 'users' && (
                <div className="animate-fade-in">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">Devotees / Customers ({users.length})</h2>
                    <div className="relative w-full sm:w-72">
                      <input
                        type="text"
                        placeholder="Search users by name, email, phone..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="input-field py-2 pl-9 pr-4 text-sm rounded-xl w-full"
                      />
                      <HiUsers className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                    </div>
                  </div>

                  {filteredUsers.length === 0 ? (
                    <div className="card p-8 text-center text-stone-400">No devotees found matching the search criteria.</div>
                  ) : (
                    <div className="space-y-3">
                      {filteredUsers.map((u) => (
                        <div key={u._id} id={`admin-user-${u._id}`} className="card p-5 flex items-center justify-between gap-4 flex-wrap hover:border-stone-300 dark:hover:border-stone-700 transition-all duration-200">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center shrink-0 border border-blue-100 dark:border-blue-900/50">
                              <HiUsers className="text-blue-500 dark:text-blue-400 text-lg" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm">{u.name}</p>
                              <p className="text-xs text-stone-500 dark:text-stone-400 mt-0.5">
                                ✉️ {u.email} {u.phone && ` · 📞 ${u.phone}`} {u.city && ` · 📍 ${u.city}`}
                              </p>
                              <p className="text-[11px] text-stone-450 dark:text-stone-400 mt-1.5 font-medium">
                                Registered: {u.createdAt ? format(new Date(u.createdAt), 'dd MMM yyyy') : 'N/A'} · 📊 {u.bookingCount || 0} Bookings
                              </p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 shrink-0">
                            {u.isSuspended && <span className="badge-rejected">Suspended</span>}
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-saffron-500 text-saffron-600 dark:text-saffron-400 hover:bg-saffron-55 dark:hover:bg-saffron-950/20 hover:bg-saffron-50 transition-colors"
                            >
                              Manage Profile
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
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
                  <div className="card p-6 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border shadow-sm">
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-4">
                      {editingRitual ? 'Edit Ritual' : 'Add New Ritual'}
                    </h3>
                    <form id="ritual-form" onSubmit={handleRitualSubmit} className="space-y-4">
                      
                      {/* Row 1: Basic Info */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="form-group md:col-span-2">
                          <label htmlFor="ritual-name" className="label">Puja Name</label>
                          <input id="ritual-name" type="text" value={ritualForm.pujaName} onChange={(e) => setRitualForm({ ...ritualForm, pujaName: e.target.value })} className="input-field" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-slug" className="label">Slug</label>
                          <input id="ritual-slug" type="text" value={ritualForm.slug} onChange={(e) => setRitualForm({ ...ritualForm, slug: e.target.value })} placeholder="leave empty to auto-generate" className="input-field" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-category" className="label">Category</label>
                          <select id="ritual-category" value={ritualForm.category} onChange={(e) => setRitualForm({ ...ritualForm, category: e.target.value })} className="input-field" required>
                            <option value="Griha & Property Pujas">Griha & Property Pujas</option>
                            <option value="Marriage & Family Rituals">Marriage & Family Rituals</option>
                            <option value="Child & Sanskar Ceremonies">Child & Sanskar Ceremonies</option>
                            <option value="Business & Career Pujas">Business & Career Pujas</option>
                            <option value="Health & Protection Pujas">Health & Protection Pujas</option>
                            <option value="Festival Pujas">Festival Pujas</option>
                            <option value="Shiva Pujas">Shiva Pujas</option>
                            <option value="Vishnu Pujas">Vishnu Pujas</option>
                            <option value="Devi Pujas">Devi Pujas</option>
                            <option value="Navagraha Pujas">Navagraha Pujas</option>
                            <option value="Homa & Havan Rituals">Homa & Havan Rituals</option>
                            <option value="Special Vedic Ceremonies">Special Vedic Ceremonies</option>
                          </select>
                        </div>
                      </div>

                      {/* Row 2: Short Description */}
                      <div className="form-group">
                        <label htmlFor="ritual-short-desc" className="label">Short Description</label>
                        <input id="ritual-short-desc" type="text" value={ritualForm.shortDescription} onChange={(e) => setRitualForm({ ...ritualForm, shortDescription: e.target.value })} placeholder="One sentence summary of the ritual..." className="input-field" required />
                      </div>

                      {/* Row 3: Full Description */}
                      <div className="form-group">
                        <label htmlFor="ritual-desc" className="label">Full Description</label>
                        <textarea id="ritual-desc" value={ritualForm.description} onChange={(e) => setRitualForm({ ...ritualForm, description: e.target.value })} rows={4} className="input-field resize-none" required />
                      </div>

                      {/* Row 4: Specifications */}
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div className="form-group">
                          <label htmlFor="ritual-duration" className="label">Duration (Display)</label>
                          <input id="ritual-duration" type="text" value={ritualForm.duration} onChange={(e) => setRitualForm({ ...ritualForm, duration: e.target.value })} placeholder="2-3 hours" className="input-field" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-duration-mins" className="label">Duration (Minutes)</label>
                          <input id="ritual-duration-mins" type="number" min="0" value={ritualForm.durationMinutes} onChange={(e) => setRitualForm({ ...ritualForm, durationMinutes: e.target.value })} className="input-field" required />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-loc-type" className="label">Location Type</label>
                          <select id="ritual-loc-type" value={ritualForm.locationType} onChange={(e) => setRitualForm({ ...ritualForm, locationType: e.target.value })} className="input-field">
                            <option value="Home">Home</option>
                            <option value="Temple">Temple</option>
                            <option value="Both">Both</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-materials-cost" className="label">Est. Material Cost (₹)</label>
                          <input id="ritual-materials-cost" type="number" min="0" value={ritualForm.estimatedMaterialCost} onChange={(e) => setRitualForm({ ...ritualForm, estimatedMaterialCost: e.target.value })} className="input-field" />
                        </div>
                        <div className="form-group col-span-2 md:col-span-1">
                          <label className="label">Price Range (₹)</label>
                          <div className="flex gap-2">
                            <input id="ritual-price-min" type="number" min="0" placeholder="Min" value={ritualForm.priceMin} onChange={(e) => setRitualForm({ ...ritualForm, priceMin: e.target.value })} className="input-field w-1/2" />
                            <input id="ritual-price-max" type="number" min="0" placeholder="Max" value={ritualForm.priceMax} onChange={(e) => setRitualForm({ ...ritualForm, priceMax: e.target.value })} className="input-field w-1/2" />
                          </div>
                        </div>
                      </div>

                      {/* Row 5: Comma separated arrays */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label htmlFor="ritual-materials" className="label">Required Materials <span className="text-stone-400 font-normal">(comma-separated)</span></label>
                          <input id="ritual-materials" type="text" value={ritualForm.requiredMaterials} onChange={(e) => setRitualForm({ ...ritualForm, requiredMaterials: e.target.value })} placeholder="Flowers, Ghee, Coconut..." className="input-field" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-keywords" className="label">Search Keywords <span className="text-stone-400 font-normal">(comma-separated)</span></label>
                          <input id="ritual-keywords" type="text" value={ritualForm.searchKeywords} onChange={(e) => setRitualForm({ ...ritualForm, searchKeywords: e.target.value })} placeholder="diwali, laxmi, wealth..." className="input-field" />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="form-group">
                          <label htmlFor="ritual-occasions" className="label">Occasion Tags <span className="text-stone-400 font-normal">(comma-separated)</span></label>
                          <input id="ritual-occasions" type="text" value={ritualForm.occasionTags} onChange={(e) => setRitualForm({ ...ritualForm, occasionTags: e.target.value })} placeholder="New Home, Marriage, Festival..." className="input-field" />
                        </div>
                        <div className="form-group">
                          <label htmlFor="ritual-regions" className="label">Supported Regions <span className="text-stone-400 font-normal">(comma-separated)</span></label>
                          <input id="ritual-regions" type="text" value={ritualForm.supportedRegions} onChange={(e) => setRitualForm({ ...ritualForm, supportedRegions: e.target.value })} placeholder="Enter state or region" className="input-field" />
                        </div>
                      </div>

                      {/* Row 6: Image Upload with Progress & Preview */}
                      <div className="border border-dashed border-light-border dark:border-dark-border p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center bg-stone-50 dark:bg-stone-900/30">
                        <div className="relative w-28 h-20 rounded-xl overflow-hidden border border-light-border dark:border-dark-border shadow-sm shrink-0 bg-white dark:bg-dark-card flex items-center justify-center">
                          <img 
                            src={ritualForm.imageUrl || '/default-om.png'} 
                            alt="Preview" 
                            className="w-full h-full object-cover" 
                          />
                        </div>
                        <div className="flex-1 space-y-2 w-full">
                          <span className="text-xs font-bold text-stone-600 dark:text-stone-400 uppercase tracking-wider block">Ritual Photograph</span>
                          
                          <div className="flex flex-wrap gap-2 items-center">
                            <label className="flex items-center gap-1.5 px-4 py-2 bg-white dark:bg-dark-surface border border-light-border dark:border-dark-border text-stone-700 dark:text-stone-300 rounded-xl text-xs font-semibold cursor-pointer hover:bg-stone-50 dark:hover:bg-stone-850 transition-colors shadow-sm">
                              <HiUpload /> Upload Image File
                              <input 
                                type="file" 
                                accept="image/jpeg,image/png,image/webp,image/jpg" 
                                onChange={handleImageUpload} 
                                className="hidden" 
                              />
                            </label>

                            {ritualForm.imageUrl && (
                              <button 
                                type="button" 
                                onClick={() => setRitualForm((prev) => ({ ...prev, imageUrl: '' }))}
                                className="px-3 py-2 border border-crimson-100 dark:border-crimson-900/30 text-crimson-600 dark:text-crimson-400 rounded-xl text-xs font-semibold hover:bg-crimson-50 dark:hover:bg-crimson-950/20 transition-colors"
                              >
                                Revert to Default
                              </button>
                            )}
                          </div>

                          {uploadingImage && (
                            <div className="w-full space-y-1">
                              <div className="flex justify-between text-[10px] text-stone-400 font-bold uppercase">
                                <span>Uploading to Cloudinary...</span>
                                <span>{uploadProgress}%</span>
                              </div>
                              <div className="w-full bg-stone-200 dark:bg-stone-800 h-1.5 rounded-full overflow-hidden">
                                <div className="bg-saffron-500 h-full transition-all duration-150" style={{ width: `${uploadProgress}%` }} />
                              </div>
                            </div>
                          )}

                          {uploadError && (
                            <p className="text-xs text-crimson-500 font-medium">{uploadError}</p>
                          )}
                        </div>
                      </div>

                      {/* Row 7: Checkbox Switches */}
                      <div className="flex flex-wrap gap-6 py-2 border-t border-b border-light-border dark:border-dark-border">
                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={ritualForm.isActive} 
                            onChange={(e) => setRitualForm({ ...ritualForm, isActive: e.target.checked })} 
                            className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 border-stone-300 rounded" 
                          />
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-350">Active Status (Visible to users)</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={ritualForm.featured} 
                            onChange={(e) => setRitualForm({ ...ritualForm, featured: e.target.checked })} 
                            className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 border-stone-300 rounded" 
                          />
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-350">Featured Ritual</span>
                        </label>

                        <label className="flex items-center gap-2 cursor-pointer select-none">
                          <input 
                            type="checkbox" 
                            checked={ritualForm.popular} 
                            onChange={(e) => setRitualForm({ ...ritualForm, popular: e.target.checked })} 
                            className="w-4 h-4 text-saffron-600 focus:ring-saffron-500 border-stone-300 rounded" 
                          />
                          <span className="text-xs font-semibold text-stone-700 dark:text-stone-350">Popular Status</span>
                        </label>

                        {editingRitual && (
                          <div className="ml-auto flex items-center text-xs font-bold text-stone-400 dark:text-stone-500 bg-stone-50 dark:bg-stone-900/50 px-3 py-1 rounded-lg border border-light-border dark:border-dark-border/40">
                            📊 Bookings: {ritualForm.bookingCount || 0}
                          </div>
                        )}
                      </div>

                      {/* Submit Buttons */}
                      <div className="flex gap-3 pt-2">
                        <button type="submit" id="save-ritual" disabled={savingRitual || uploadingImage} className="btn-primary flex items-center gap-1">
                          <HiPlus /> {editingRitual ? 'Update Ritual' : 'Create Ritual'}
                        </button>
                        <button type="button" onClick={resetRitualForm} className="btn-secondary">
                          {editingRitual ? 'Cancel' : 'Reset Form'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Ritual list */}
                  <div>
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-3">Ritual Catalog ({rituals.length})</h3>
                    <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                      {rituals.map((r) => (
                        <div key={r._id} id={`ritual-item-${r._id}`} className="card p-4 flex items-center gap-3 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border hover:border-saffron-200 dark:hover:border-saffron-800 transition-colors">
                          <img 
                            src={r.imageUrl || '/default-om.png'} 
                            alt={r.pujaName} 
                            className="w-12 h-12 rounded-xl object-cover border border-light-border dark:border-dark-border shadow-sm shrink-0" 
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="font-semibold text-stone-900 dark:text-stone-100 text-sm truncate">{r.pujaName}</p>
                              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${getCategoryColor(r.category)}`}>
                                {r.category}
                              </span>
                              {!r.isActive && <span className="bg-stone-100 dark:bg-stone-850 text-stone-400 border border-stone-200 text-[9px] font-bold px-1.5 py-0.5 rounded-full">Inactive</span>}
                              {r.featured && <span className="bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 border border-saffron-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">★ Featured</span>}
                              {r.popular && <span className="bg-amber-50 dark:bg-amber-950/20 text-amber-700 border border-amber-100 text-[9px] font-bold px-1.5 py-0.5 rounded-full">🔥 Popular</span>}
                            </div>
                            <p className="text-xs text-stone-400 mt-0.5">{r.duration} · {r.locationType} · ₹{r.priceRange?.min?.toLocaleString('en-IN')}–₹{r.priceRange?.max?.toLocaleString('en-IN')}</p>
                          </div>
                          <div className="flex gap-2 shrink-0">
                            <button id={`view-ritual-${r._id}`} onClick={() => setSelectedRitual(r)} className="p-2 rounded-lg text-stone-400 hover:text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors" title="View Details"><HiEye /></button>
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

      {/* Detail inspect modal */}
      {selectedRitual && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl relative">
            <button 
              onClick={() => setSelectedRitual(null)}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-stone-100 dark:hover:bg-stone-850 text-stone-500 transition-colors"
            >
              <HiX className="text-xl" />
            </button>

            <div className="flex gap-4 items-start mb-6">
              <img 
                src={selectedRitual.imageUrl || '/default-om.png'} 
                alt={selectedRitual.pujaName} 
                className="w-20 h-20 rounded-2xl object-cover border border-light-border dark:border-dark-border shadow-md shrink-0 bg-white"
              />
              <div>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryColor(selectedRitual.category)}`}>
                  {selectedRitual.category}
                </span>
                <h3 className="font-display font-bold text-xl text-stone-900 dark:text-stone-100 mt-1">{selectedRitual.pujaName}</h3>
              </div>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Short Description</h4>
                <p className="text-stone-700 dark:text-stone-300 mt-0.5 font-medium">{selectedRitual.shortDescription || 'N/A'}</p>
              </div>

              <div>
                <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Full Description</h4>
                <p className="text-stone-600 dark:text-stone-400 mt-0.5 whitespace-pre-line leading-relaxed">{selectedRitual.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-3 border-t border-b border-light-border dark:border-dark-border">
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase">Duration</h4>
                  <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{selectedRitual.duration}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase">Min Duration</h4>
                  <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{selectedRitual.durationMinutes}m</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase">Location</h4>
                  <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">{selectedRitual.locationType}</p>
                </div>
                <div>
                  <h4 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase">Material Cost</h4>
                  <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">₹{selectedRitual.estimatedMaterialCost || 0}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Price Range</h4>
                  <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">
                    ₹{selectedRitual.priceRange?.min?.toLocaleString('en-IN')} – ₹{selectedRitual.priceRange?.max?.toLocaleString('en-IN')}
                  </p>
                </div>
                <div>
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider">Booking Count</h4>
                  <p className="font-bold text-stone-800 dark:text-stone-200 mt-0.5">📊 {selectedRitual.bookingCount || 0} bookings</p>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2">
                <span className={`text-xs px-2.5 py-1 rounded-lg text-center font-semibold border ${selectedRitual.isActive ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30' : 'bg-stone-50 dark:bg-stone-850 text-stone-500 border-stone-200'}`}>
                  {selectedRitual.isActive ? '● Active' : '○ Inactive'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg text-center font-semibold border ${selectedRitual.featured ? 'bg-saffron-50 dark:bg-saffron-950/20 text-saffron-700 dark:text-saffron-400 border-saffron-100 dark:border-saffron-900/30' : 'bg-stone-50 dark:bg-stone-850 text-stone-500 border-stone-200'}`}>
                  {selectedRitual.featured ? '★ Featured' : '☆ Not Featured'}
                </span>
                <span className={`text-xs px-2.5 py-1 rounded-lg text-center font-semibold border ${selectedRitual.popular ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border-amber-100 dark:border-amber-900/30' : 'bg-stone-50 dark:bg-stone-850 text-stone-500 border-stone-200'}`}>
                  {selectedRitual.popular ? '🔥 Popular' : '♢ Not Popular'}
                </span>
              </div>

              {selectedRitual.requiredMaterials?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Required Materials</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRitual.requiredMaterials.map(m => (
                      <span key={m} className="text-xs bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 px-2.5 py-1 rounded-lg font-medium">{m}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRitual.occasionTags?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Occasion Tags</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedRitual.occasionTags.map(t => (
                      <span key={t} className="text-xs font-bold bg-[#2D0B12] text-[#FBBF24] border border-[#F59E0B]/40 px-2.5 py-1 rounded-lg hover:bg-[#3d121c] hover:border-[#FBBF24]/60 transition-all duration-300">🏷️ {t}</span>
                    ))}
                  </div>
                </div>
              )}

              {selectedRitual.supportedRegions?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Supported Regions</h4>
                  <p className="text-stone-700 dark:text-stone-300 font-medium">{selectedRitual.supportedRegions.join(', ')}</p>
                </div>
              )}

              {selectedRitual.searchKeywords?.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-wider mb-1">Search Keywords</h4>
                  <p className="text-xs text-stone-500 dark:text-stone-400 font-mono bg-stone-50 dark:bg-stone-900/60 p-2 rounded-xl border border-light-border dark:border-dark-border">{selectedRitual.searchKeywords.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  </PageTransition>
  );
};

export default AdminDashboard;
