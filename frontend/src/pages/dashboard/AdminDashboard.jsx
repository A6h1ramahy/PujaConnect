import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { HiShieldCheck, HiX, HiUsers, HiClipboardList, HiViewGrid, HiBan, HiPlus, HiPencil, HiTrash, HiEye, HiUpload, HiLockClosed, HiFilter, HiSortDescending, HiRefresh, HiChevronDown, HiCalendar } from 'react-icons/hi';
import { MdOutlineTempleHindu } from 'react-icons/md';
import { format } from 'date-fns';
import toast from 'react-hot-toast';
import {
  getAdminStats, getPendingPandits, getAllPanditsAdmin, verifyPandit, rejectPanditAdmin,
  getAllUsers, toggleSuspend, getAllBookingsAdmin, getAllRitualsAdmin,
  createRitual, updateRitual, deleteRitual, uploadRitualImage,
  deleteUserAdmin, deletePanditAdmin,
  getAllAdmins, createAdmin, suspendAdmin, reactivateAdmin, deleteAdmin
} from '../../api';
import StatusBadge from '../../components/common/StatusBadge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PanditAvatar from '../../components/common/PanditAvatar';
import PageTransition from '../../components/common/PageTransition';
import { ScrollReveal, StaggerContainer, StaggerItem } from '../../components/common/ScrollReveal';
import ChangePasswordForm from '../../components/common/ChangePasswordForm';
import { useAuth } from '../../context/AuthContext';

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
  const { user: currentUser } = useAuth();
  const [admins, setAdmins] = useState([]);
  const [adminSearch, setAdminSearch] = useState('');
  const [savingAdmin, setSavingAdmin] = useState(false);
  const [adminForm, setAdminForm] = useState({
    name: '',
    email: '',
    username: '',
    password: '',
    confirmPassword: ''
  });

  const filteredAdmins = admins.filter((a) => {
    const term = adminSearch.toLowerCase();
    return (
      a.name.toLowerCase().includes(term) ||
      a.email.toLowerCase().includes(term) ||
      (a.username && a.username.toLowerCase().includes(term))
    );
  });

  const [stats, setStats] = useState(null);
  const [pendingPandits, setPendingPandits] = useState([]);
  const [allPandits, setAllPandits] = useState([]);
  const [users, setUsers] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [rituals, setRituals] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ── Booking Filter / Sort state ───────────────────────── */
  const [showBookingFilters, setShowBookingFilters] = useState(false);
  const [bkFilterStatus, setBkFilterStatus]   = useState('');
  const [bkFilterDate, setBkFilterDate]       = useState('');
  const [bkFilterBefore, setBkFilterBefore]   = useState('');
  const [bkFilterAfter, setBkFilterAfter]     = useState('');
  const [bkFilterSort, setBkFilterSort]       = useState('newest');
  const [bkQuickFilter, setBkQuickFilter]     = useState('all');
  const [bkFilterLoading, setBkFilterLoading] = useState(false);
  
  // Search and filter states
  const [userSearch, setUserSearch] = useState('');
  const [userStatusFilter, setUserStatusFilter] = useState('all');
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
    
    return searchMatch;
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

  const fetchAdmins = async () => {
    try {
      const { data } = await getAllAdmins();
      setAdmins(data.admins || []);
    } catch {}
  };

  useEffect(() => { fetchAll(); }, []);
  useEffect(() => {
    if (activeTab === 'pandits')  fetchPandits();
    if (activeTab === 'users')    fetchUsers();
    if (activeTab === 'bookings') fetchBookings();
    if (activeTab === 'rituals')  fetchRituals();
    if (activeTab === 'admins')   fetchAdmins();
  }, [activeTab, panditStatusFilter, userStatusFilter]);

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
    try {
      const { data } = await getAllPanditsAdmin({ status: panditStatusFilter === 'all' ? '' : panditStatusFilter });
      setAllPandits(data.pandits || []);
    } catch {}
  };
  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers({ status: userStatusFilter === 'all' ? '' : userStatusFilter });
      setUsers(data.users || []);
    } catch {}
  };
  const fetchBookings = async () => {
    try { const { data } = await getAllBookingsAdmin({ limit: 200 }); setBookings(data.bookings || []); } catch {}
  };
  const fetchRituals = async () => {
    try { const { data } = await getAllRitualsAdmin(); setRituals(data.rituals || []); } catch {}
  };

  const getLocalDateString = () => {
    const now = new Date();
    const offset = now.getTimezoneOffset();
    const local = new Date(now.getTime() - (offset * 60 * 1000));
    return local.toISOString().slice(0, 10);
  };

  const fetchFilteredBookings = useCallback(async () => {
    setBkFilterLoading(true);
    try {
      const params = { limit: 200 };
      if (bkFilterStatus) params.status = bkFilterStatus;
      if (bkFilterSort)   params.sort = bkFilterSort;

      if (bkQuickFilter === 'today') {
        params.date = getLocalDateString();
      } else if (bkQuickFilter === 'upcoming') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const offset = yesterday.getTimezoneOffset();
        const local = new Date(yesterday.getTime() - (offset * 60 * 1000));
        params.after = local.toISOString().slice(0, 10);
      } else if (bkQuickFilter === 'past') {
        params.before = getLocalDateString();
      } else {
        if (bkFilterDate)   params.date   = bkFilterDate;
        if (bkFilterBefore) params.before = bkFilterBefore;
        if (bkFilterAfter)  params.after  = bkFilterAfter;
      }

      const { data } = await getAllBookingsAdmin(params);
      setBookings(data.bookings || []);
    } catch { } finally {
      setBkFilterLoading(false);
    }
  }, [bkFilterStatus, bkFilterDate, bkFilterBefore, bkFilterAfter, bkFilterSort, bkQuickFilter]);

  /* Re-fetch bookings whenever admin filters change */
  useEffect(() => {
    if (!loading && activeTab === 'bookings') fetchFilteredBookings();
  }, [fetchFilteredBookings]);

  const isBkFilterActive = bkFilterStatus || bkFilterDate || bkFilterBefore || bkFilterAfter || bkFilterSort !== 'newest' || bkQuickFilter !== 'all';

  const resetBkFilters = () => {
    setBkFilterStatus('');
    setBkFilterDate('');
    setBkFilterBefore('');
    setBkFilterAfter('');
    setBkFilterSort('newest');
    setBkQuickFilter('all');
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

  const handleDeleteUserClick = (id) => {
    if (window.confirm('This action permanently removes the account and all associated data. All bookings, records, and related information will be deleted permanently. This action cannot be undone. Continue?')) {
      deleteUserAdmin(id)
        .then(() => {
          toast.success('User account deleted');
          fetchUsers();
          fetchAll(); // refresh stats
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || 'Failed to delete user');
        });
    }
  };

  const handleDeletePanditClick = (id) => {
    if (window.confirm('This action permanently removes the account and all associated data. All bookings, records, and related information will be deleted permanently. This action cannot be undone. Continue?')) {
      deletePanditAdmin(id)
        .then(() => {
          toast.success('Pandit account deleted');
          fetchPandits();
          fetchAll(); // refresh stats
        })
        .catch((err) => {
          toast.error(err?.response?.data?.message || 'Failed to delete Pandit');
        });
    }
  };

  const validatePassword = (password) => {
    if (password.length < 8) return 'Password must be at least 8 characters long.';
    if (!/[A-Z]/.test(password)) return 'Password must contain at least one uppercase letter.';
    if (!/[a-z]/.test(password)) return 'Password must contain at least one lowercase letter.';
    if (!/[0-9]/.test(password)) return 'Password must contain at least one number.';
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) return 'Password must contain at least one special character.';
    return null;
  };

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    if (adminForm.password !== adminForm.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    const pwdErr = validatePassword(adminForm.password);
    if (pwdErr) {
      toast.error(pwdErr);
      return;
    }

    setSavingAdmin(true);
    try {
      const payload = {
        name: adminForm.name,
        email: adminForm.email,
        username: adminForm.username || undefined,
        password: adminForm.password
      };
      await createAdmin(payload);
      toast.success('Admin account created successfully');
      setAdminForm({
        name: '',
        email: '',
        username: '',
        password: '',
        confirmPassword: ''
      });
      fetchAdmins();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to create admin');
    } finally {
      setSavingAdmin(false);
    }
  };

  const handleSuspendAdminClick = async (id, currentStatus) => {
    const isSuspended = currentStatus;
    const actionWord = isSuspended ? 'reactivate' : 'suspend';
    const warningMsg = isSuspended 
      ? `Are you sure you want to reactivate this administrator?`
      : `Are you sure you want to suspend this administrator?\n\nThis action will disable dashboard access.`;

    if (!window.confirm(warningMsg)) return;

    const reason = window.prompt(`Provide a reason for administrator ${actionWord} (optional):`) || `${actionWord.toUpperCase()} by administrator`;
    if (reason === null) return;

    try {
      if (isSuspended) {
        await reactivateAdmin(id, reason);
        toast.success('Admin account reactivated');
      } else {
        await suspendAdmin(id, reason);
        toast.success('Admin account suspended');
      }
      fetchAdmins();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || `Failed to ${actionWord} admin`);
    }
  };

  const handleDeleteAdminClick = async (id) => {
    if (!window.confirm('This action permanently removes the account and all associated data. All bookings, records, and related information will be deleted permanently. This action cannot be undone. Continue?')) return;

    try {
      await deleteAdmin(id);
      toast.success('Admin account deleted');
      fetchAdmins();
      fetchAll();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to delete admin');
    }
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
    { id: 'admins',    label: 'Admin Management', icon: HiShieldCheck },
    { id: 'security',  label: 'Security',     icon: HiLockClosed },
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
                                <p className="text-xs text-stone-400 mt-0.5">
                                  📍 {p.location?.city || 'N/A'}, {p.location?.state || p.location?.region || 'N/A'} · 📞 {p.userId?.phone || 'N/A'} · 🎓 {p.yearsOfExperience || 0} yrs exp.
                                </p>
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
                          
                          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                            <StatusBadge status={p.verificationStatus} />
                            <Link to={`/admin/pandits/${p._id}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 text-xs font-semibold transition-colors">
                              Manage Profile
                            </Link>
                            <button
                              onClick={() => handleDeletePanditClick(p._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
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
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100 flex-1">Devotees / Customers ({users.length})</h2>
                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
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
                      <select
                        value={userStatusFilter}
                        onChange={(e) => setUserStatusFilter(e.target.value)}
                        className="input-field py-2 px-3 text-sm rounded-xl w-full sm:w-40"
                      >
                        <option value="all">All Status</option>
                        <option value="active">Active Only</option>
                        <option value="suspended">Suspended Only</option>
                      </select>
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
                          
                          <div className="flex items-center gap-3 shrink-0 flex-wrap sm:flex-nowrap">
                            {u.isSuspended && <span className="badge-rejected">Suspended</span>}
                            <Link
                              to={`/admin/users/${u._id}`}
                              className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-saffron-500 text-saffron-600 dark:text-saffron-400 hover:bg-saffron-55 dark:hover:bg-saffron-950/20 hover:bg-saffron-50 transition-colors"
                            >
                              Manage Profile
                            </Link>
                            <button
                              onClick={() => handleDeleteUserClick(u._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-crimson-600 hover:bg-crimson-700 text-white text-xs font-semibold transition-colors"
                            >
                              Delete
                            </button>
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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                    <h2 className="font-display text-xl font-bold text-stone-900 dark:text-stone-100">All Bookings ({bookings.length})</h2>
                    <button
                      id="toggle-admin-booking-filters"
                      onClick={() => setShowBookingFilters(!showBookingFilters)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 cursor-pointer ${
                        showBookingFilters || isBkFilterActive
                          ? 'bg-saffron-500 text-white shadow-glow-saffron'
                          : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                      }`}
                    >
                      <HiFilter className="text-sm" />
                      Filters
                      <HiChevronDown className={`text-sm transition-transform duration-300 ${showBookingFilters ? 'rotate-180' : ''}`} />
                    </button>
                  </div>

                  {/* Collapsible Filter Panel */}
                  {showBookingFilters && (
                    <div className="card p-5 mb-4 bg-white dark:bg-dark-card border border-light-border dark:border-dark-border rounded-2xl animate-fade-in space-y-4">
                      {/* Quick Filter Pills */}
                      <div>
                        <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-2 block">Quick Filters</label>
                        <div className="flex flex-wrap gap-2">
                          {[
                            { id: 'all', label: 'All Dates' },
                            { id: 'today', label: 'Today' },
                            { id: 'upcoming', label: 'Upcoming' },
                            { id: 'past', label: 'Past' },
                          ].map((qf) => (
                            <button
                              key={qf.id}
                              id={`admin-quick-filter-${qf.id}`}
                              onClick={() => {
                                setBkQuickFilter(qf.id);
                                if (qf.id !== 'all') {
                                  setBkFilterDate('');
                                  setBkFilterBefore('');
                                  setBkFilterAfter('');
                                }
                              }}
                              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold border-2 transition-all duration-200 cursor-pointer ${
                                bkQuickFilter === qf.id
                                  ? 'border-saffron-500 bg-saffron-50 dark:bg-saffron-900/20 text-saffron-700 dark:text-saffron-400'
                                  : 'border-light-border dark:border-dark-border text-stone-500 dark:text-stone-400 hover:border-saffron-300'
                              }`}
                            >
                              {qf.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date / Status / Sort */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                        <div>
                          <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Status</label>
                          <select
                            id="admin-filter-status"
                            value={bkFilterStatus}
                            onChange={(e) => setBkFilterStatus(e.target.value)}
                            className="input-field text-sm py-2 rounded-xl w-full"
                          >
                            <option value="">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="accepted">Accepted</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                            <option value="rejected">Rejected</option>
                            <option value="expired">Expired</option>
                          </select>
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Exact Date</label>
                          <input
                            id="admin-filter-date"
                            type="date"
                            value={bkFilterDate}
                            onChange={(e) => {
                              setBkFilterDate(e.target.value);
                              setBkQuickFilter('all');
                              setBkFilterBefore('');
                              setBkFilterAfter('');
                            }}
                            className="input-field text-sm py-2 rounded-xl w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">After Date</label>
                          <input
                            id="admin-filter-after"
                            type="date"
                            value={bkFilterAfter}
                            onChange={(e) => {
                              setBkFilterAfter(e.target.value);
                              setBkQuickFilter('all');
                              setBkFilterDate('');
                            }}
                            className="input-field text-sm py-2 rounded-xl w-full"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Before Date</label>
                          <input
                            id="admin-filter-before"
                            type="date"
                            value={bkFilterBefore}
                            onChange={(e) => {
                              setBkFilterBefore(e.target.value);
                              setBkQuickFilter('all');
                              setBkFilterDate('');
                            }}
                            className="input-field text-sm py-2 rounded-xl w-full"
                          />
                        </div>
                      </div>

                      {/* Sort + Reset */}
                      <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3">
                        <div className="w-full sm:w-48">
                          <label className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1.5 block">Sort By</label>
                          <div className="relative">
                            <HiSortDescending className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm" />
                            <select
                              id="admin-filter-sort"
                              value={bkFilterSort}
                              onChange={(e) => setBkFilterSort(e.target.value)}
                              className="input-field text-sm py-2 pl-9 rounded-xl w-full"
                            >
                              <option value="newest">Newest First</option>
                              <option value="oldest">Oldest First</option>
                              <option value="nearest">Nearest Date</option>
                              <option value="furthest">Furthest Date</option>
                            </select>
                          </div>
                        </div>

                        {isBkFilterActive && (
                          <button
                            id="admin-reset-filters"
                            onClick={resetBkFilters}
                            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold text-crimson-600 dark:text-crimson-400 bg-crimson-50 dark:bg-crimson-950/20 border border-crimson-200 dark:border-crimson-900/40 hover:bg-crimson-100 dark:hover:bg-crimson-900/30 transition-colors cursor-pointer"
                          >
                            <HiRefresh className="text-sm" /> Reset Filters
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Active filter summary (collapsed) */}
                  {isBkFilterActive && !showBookingFilters && (
                    <div className="flex items-center gap-2 mb-4 p-3 rounded-xl bg-saffron-50/50 dark:bg-saffron-950/10 border border-saffron-200/50 dark:border-saffron-900/30 text-xs text-saffron-700 dark:text-saffron-400 font-medium animate-fade-in">
                      <HiFilter className="text-sm shrink-0" />
                      <span>Filters active</span>
                      <button
                        onClick={resetBkFilters}
                        className="ml-auto text-[10px] font-bold underline hover:no-underline cursor-pointer"
                      >
                        Clear all
                      </button>
                    </div>
                  )}

                  {bkFilterLoading ? (
                    <LoadingSpinner />
                  ) : bookings.length === 0 ? (
                    <div className="card p-10 text-center">
                      <HiCalendar className="text-5xl text-stone-300 dark:text-stone-600 mx-auto mb-3" />
                      <p className="text-stone-500 dark:text-stone-400">
                        {isBkFilterActive
                          ? 'No bookings found for the selected filters.'
                          : 'No bookings yet'}
                      </p>
                      {isBkFilterActive && (
                        <button onClick={resetBkFilters} className="btn-secondary btn-sm mt-4 inline-flex items-center gap-1.5 cursor-pointer">
                          <HiRefresh className="text-sm" /> Reset Filters
                        </button>
                      )}
                    </div>
                  ) : (
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
                        <Link
                          to={`/admin/bookings/${b._id}`}
                          className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 rounded-lg border border-stone-300 dark:border-stone-700 text-stone-600 dark:text-stone-300 hover:bg-stone-50 dark:hover:bg-stone-800 transition-colors shrink-0"
                        >
                          View Details
                        </Link>
                      </div>
                    ))}
                  </div>
                  )}
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

              {/* Admin Management */}
              {activeTab === 'admins' && (
                <div className="animate-fade-in space-y-6">
                  {/* Create Admin Card */}
                  <div className="card p-6">
                    <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100 mb-4">
                      Create New Admin
                    </h3>
                    <form onSubmit={handleAdminSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Full Name <span className="text-saffron-500">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            placeholder="e.g. Admin1"
                            value={adminForm.name}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, name: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Email Address <span className="text-saffron-500">*</span>
                          </label>
                          <input
                            type="email"
                            required
                            placeholder="e.g. admin@pujaconnect.com"
                            value={adminForm.email}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, email: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-sm"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Username <span className="text-stone-400 dark:text-stone-500 font-normal">(Optional)</span>
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. admin_pujaconnect"
                            value={adminForm.username}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, username: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Password <span className="text-saffron-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Minimum 8 characters"
                            value={adminForm.password}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, password: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-sm"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-stone-700 dark:text-stone-300 uppercase tracking-wider mb-1">
                            Confirm Password <span className="text-saffron-500">*</span>
                          </label>
                          <input
                            type="password"
                            required
                            placeholder="Repeat password"
                            value={adminForm.confirmPassword}
                            onChange={(e) => setAdminForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                            className="w-full px-4 py-2.5 rounded-xl border border-light-border dark:border-dark-border bg-white dark:bg-dark-bg text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-saffron-500/20 focus:border-saffron-500 transition-all text-sm"
                          />
                        </div>
                      </div>

                      {/* Password validation indicators */}
                      {adminForm.password && (
                        <div className="bg-stone-50 dark:bg-stone-900/60 p-4 rounded-xl border border-light-border dark:border-dark-border space-y-2">
                          <p className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">Password Strength Rules:</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                            <span className={adminForm.password.length >= 8 ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400'}>
                              ✓ At least 8 characters ({adminForm.password.length}/8)
                            </span>
                            <span className={/[A-Z]/.test(adminForm.password) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400'}>
                              ✓ One uppercase letter
                            </span>
                            <span className={/[a-z]/.test(adminForm.password) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400'}>
                              ✓ One lowercase letter
                            </span>
                            <span className={/[0-9]/.test(adminForm.password) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400'}>
                              ✓ One number
                            </span>
                            <span className={/[!@#$%^&*(),.?":{}|<>]/.test(adminForm.password) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400'}>
                              ✓ One special character
                            </span>
                            <span className={(adminForm.password && adminForm.password === adminForm.confirmPassword) ? 'text-emerald-600 dark:text-emerald-400 font-semibold' : 'text-stone-400'}>
                              ✓ Passwords match
                            </span>
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end">
                        <button
                          type="submit"
                          disabled={savingAdmin}
                          className="px-6 py-2.5 rounded-xl font-semibold text-sm bg-saffron-gradient text-white shadow-glow-saffron hover:opacity-90 transition-all flex items-center gap-2"
                        >
                          {savingAdmin ? 'Creating...' : 'Create Admin Account'}
                        </button>
                      </div>
                    </form>
                  </div>

                  {/* Admins List Card */}
                  <div className="card p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <h3 className="font-display font-semibold text-lg text-stone-900 dark:text-stone-100">
                        Administrators
                      </h3>
                      <input
                        type="text"
                        placeholder="Search by name, email, or username..."
                        value={adminSearch}
                        onChange={(e) => setAdminSearch(e.target.value)}
                        className="px-4 py-2 rounded-xl border border-light-border dark:border-dark-border bg-light-bg dark:bg-dark-bg text-stone-900 dark:text-stone-100 text-sm focus:outline-none focus:ring-2 focus:ring-saffron-500/20 w-full sm:max-w-xs"
                      />
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-light-border dark:border-dark-border text-stone-400 text-xs font-bold uppercase tracking-wider">
                            <th className="py-3 px-4">Name & Email</th>
                            <th className="py-3 px-4">Username</th>
                            <th className="py-3 px-4">Joined / Created By</th>
                            <th className="py-3 px-4">Last Login</th>
                            <th className="py-3 px-4">Status</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-light-border dark:divide-dark-border text-sm">
                          {filteredAdmins.length === 0 ? (
                            <tr>
                              <td colSpan="6" className="py-8 text-center text-stone-400 dark:text-stone-500">
                                No administrators found.
                              </td>
                            </tr>
                          ) : (
                            filteredAdmins.map((admin) => {
                              const isSelf = currentUser?._id === admin._id;
                              const isSystemAdmin = admin.email.toLowerCase() === 'admin@pujaconnect.com';
                              const totalActiveAdmins = admins.filter(a => !a.isSuspended).length;
                              const isLastActive = !admin.isSuspended && totalActiveAdmins <= 1;

                              return (
                                <tr key={admin._id} id={`admin-row-${admin._id}`} className="hover:bg-stone-50/50 dark:hover:bg-stone-800/20 transition-colors">
                                  <td className="py-4 px-4">
                                    <p className="font-semibold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                                      {admin.name} {isSelf && <span className="bg-saffron-50 dark:bg-saffron-950/20 text-saffron-600 dark:text-saffron-400 text-[10px] px-1.5 py-0.5 rounded-full font-bold border border-saffron-100 dark:border-saffron-900/30">You</span>}
                                    </p>
                                    <p className="text-xs text-stone-500 dark:text-stone-400">{admin.email}</p>
                                  </td>
                                  <td className="py-4 px-4 font-mono text-xs text-stone-600 dark:text-stone-400">
                                    {admin.username || '—'}
                                  </td>
                                  <td className="py-4 px-4 text-xs text-stone-500 dark:text-stone-400">
                                    <p className="font-medium">{format(new Date(admin.createdAt), 'dd MMM yyyy')}</p>
                                    {admin.createdBy && (
                                      <p className="text-[10px] text-stone-400 mt-0.5">
                                        by {admin.createdBy.name}
                                      </p>
                                    )}
                                  </td>
                                  <td className="py-4 px-4 text-xs text-stone-500 dark:text-stone-400 font-medium">
                                    {admin.lastLogin ? format(new Date(admin.lastLogin), 'dd MMM yyyy HH:mm') : 'Never'}
                                  </td>
                                  <td className="py-4 px-4">
                                    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                      admin.isSuspended
                                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border-rose-100 dark:border-rose-900/30'
                                        : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/30'
                                    }`}>
                                      {admin.isSuspended ? '● Suspended' : '● Active'}
                                    </span>
                                  </td>
                                  <td className="py-4 px-4 text-right">
                                    <div className="flex justify-end gap-1.5">
                                      <button
                                        id={`suspend-admin-${admin._id}`}
                                        disabled={isSelf || isSystemAdmin || isLastActive}
                                        onClick={() => handleSuspendAdminClick(admin._id, admin.isSuspended)}
                                        className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-saffron-50 hover:text-saffron-600 dark:hover:bg-saffron-950/20 dark:hover:text-saffron-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          isSelf 
                                            ? 'You cannot suspend yourself' 
                                            : isSystemAdmin 
                                              ? 'Cannot suspend system administrator' 
                                              : isLastActive 
                                                ? 'Cannot suspend the last active administrator' 
                                                : admin.isSuspended ? 'Reactivate Admin' : 'Suspend Admin'
                                        }
                                      >
                                        {admin.isSuspended ? 'Reactivate' : 'Suspend'}
                                      </button>
                                      <button
                                        id={`delete-admin-${admin._id}`}
                                        disabled={isSelf || isSystemAdmin || isLastActive}
                                        onClick={() => handleDeleteAdminClick(admin._id)}
                                        className="px-2.5 py-1 text-xs rounded-lg font-semibold bg-rose-50 text-rose-600 hover:bg-rose-100 dark:bg-rose-950/20 dark:text-rose-400 dark:hover:bg-rose-900/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          isSelf 
                                            ? 'You cannot delete yourself' 
                                            : isSystemAdmin 
                                              ? 'Cannot delete system administrator' 
                                              : isLastActive 
                                                ? 'Cannot delete the last active administrator' 
                                                : 'Delete Admin Account'
                                        }
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

              {/* Security */}
              {activeTab === 'security' && (
                <div className="animate-fade-in">
                  <ChangePasswordForm />
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
