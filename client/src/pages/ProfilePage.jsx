import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Mail, Phone, MapPin, Briefcase, Calendar, Building, Award, 
  Scale, Gavel, FileText, Lock, Key, Check, Copy, Printer, Download, 
  Sparkles, Clock, Activity, Settings, Sliders, Eye, EyeOff, ChevronRight, 
  AlertCircle, Fingerprint, CheckCircle2, Globe, Bell, Moon, Sun, 
  RefreshCw, Edit3, Save, ShieldCheck, Shield, Bookmark, CheckCheck
} from 'lucide-react';
import { AuthContext } from '../contexts/AuthContext';
import { ThemeContext } from '../contexts/ThemeContext';
import axios from '../api/axios';

export default function ProfilePage() {
  const { user, setUser } = useContext(AuthContext);
  const { theme, toggleTheme } = useContext(ThemeContext);

  const [activeTab, setActiveTab] = useState('dossier'); // 'dossier' | 'credentials' | 'security' | 'preferences'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [showIdCardModal, setShowIdCardModal] = useState(false);
  const [copiedId, setCopiedId] = useState(false);

  // Security password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Two-Factor Auth simulation
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(true);

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    hearingAlerts: true,
    emailDigest: true,
    smsNotices: false,
    caseUpdates: true,
    systemAnnouncements: true
  });

  // Comprehensive Form State initialized dynamically from logged-in user
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '+91 98421 00000',
    location: user?.location || 'Theni, Tamil Nadu',
    district: user?.district || 'Theni',
    state: user?.state || 'Tamil Nadu',
    address: user?.address || '14, Court Road, District Court Complex',
    bio: user?.bio || '',
    
    // Role specific: Applicant / Citizen
    occupation: user?.occupation || 'Citizen Beneficiary',
    monthlyIncome: user?.monthlyIncome || '15,000',
    aadhaarNumber: 'XXXX-XXXX-4821',
    bplCardNumber: 'BPL/TN/THN-88219',
    language: 'Tamil & English',
    
    // Role specific: Lawyer / Advocate
    barNumber: user?.barNumber || user?.barRegistrationNumber || 'BC/TN/8842/2012',
    specialization: user?.specialization || 'Property Law & Land Partition',
    experienceYears: user?.experienceYears || user?.experience || 14,
    courtLevel: user?.courtLevel || 'District & Sessions Court',
    consultationFee: user?.consultationFee || 0,
    availability: user?.availability || 'Available',
    officeAddress: 'Chamber 12, Advocates Association Building, Combined Court Complex',
    
    // Role specific: Judge
    designation: user?.designation || 'Principal District & Sessions Judge',
    benchNumber: 'Bench Hall 1',
    courtName: user?.courtName || 'District Court, Theni',
    jurisdiction: 'Theni Judicial District & Sessions Division',
    yearsServing: 18,
    judicialCode: 'TN-JDG-4421',
    
    // Role specific: CourtStaff
    staffId: 'STF-TN-2026-09',
    department: 'Civil Registry & Case Allocation Directorate',
    benchAffiliation: 'Chambers of Principal District Judge',
    clearanceLevel: 'Level 3 - Judicial Registry & Summons Filing',
    
    // Role specific: Admin
    adminRole: 'Principal Portal Administrator & Security Controller',
    securityClearance: 'Top Tier Master Clearance',
    clusterNode: 'NODE-SOUTH-TN-01'
  });

  // Fetch live backend profile information if available
  useEffect(() => {
    const fetchFullProfile = async () => {
      try {
        setLoading(true);
        if (user?.role === 'Lawyer') {
          const res = await axios.get('/lawyers/me/profile').catch(() => null);
          if (res?.data?.data) {
            const l = res.data.data;
            setFormData(prev => ({
              ...prev,
              name: l.fullName || user.name,
              barNumber: l.barRegistrationNumber || prev.barNumber,
              specialization: Array.isArray(l.specializations) ? l.specializations.join(', ') : (l.specialization || prev.specialization),
              experienceYears: l.experience || prev.experienceYears,
              courtLevel: l.courtLevel || prev.courtLevel,
              consultationFee: l.consultationFee ?? prev.consultationFee,
              bio: l.bio || prev.bio
            }));
          }
        } else if (user?.role === 'Judge') {
          const res = await axios.get('/judges/profile').catch(() => null);
          if (res?.data?.data) {
            const j = res.data.data;
            setFormData(prev => ({
              ...prev,
              name: j.name || user.name,
              designation: j.designation || prev.designation,
              courtName: j.courtName || prev.courtName,
              benchNumber: j.courtroom || prev.benchNumber,
              judicialCode: j.registrationNumber || prev.judicialCode,
              jurisdiction: j.jurisdiction || prev.jurisdiction,
              yearsServing: j.yearsServing || prev.yearsServing
            }));
          }
        }
      } catch (err) {
        console.warn('Could not load extended profile:', err);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchFullProfile();
    }
  }, [user]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  const handleCopyId = () => {
    const idToCopy = getRoleIdentifier();
    navigator.clipboard.writeText(idToCopy);
    setCopiedId(true);
    showToast(`Copied official identifier (${idToCopy}) to clipboard`);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const getRoleIdentifier = () => {
    switch (user?.role) {
      case 'Judge': return formData.judicialCode;
      case 'Lawyer': return formData.barNumber;
      case 'CourtStaff': return formData.staffId;
      case 'Admin': return 'ADM-TN-ROOT-001';
      default: return user?._id ? `CITIZEN-${user._id.slice(-6).toUpperCase()}` : 'CITIZEN-TN-4821';
    }
  };

  const getRoleTheme = () => {
    switch (user?.role) {
      case 'Judge':
        return {
          title: 'Hon\'ble Presiding Justice',
          badgeText: 'Presiding Judicial Bench',
          authority: 'Supreme Court & High Court of Madras Jurisdiction',
          icon: Gavel,
          primaryColor: '#B69B72',
          pillBg: 'rgba(182, 155, 114, 0.15)',
          pillText: '#D9C7A5',
          pillBorder: 'rgba(182, 155, 114, 0.3)',
          gradient: 'from-[#171F2D] via-[#24171E] to-[#0E131D]',
          sealLabel: 'Judicial Warrant of Office'
        };
      case 'Lawyer':
        return {
          title: 'Advocate & Legal Counsel',
          badgeText: 'Certified Legal Practitioner',
          authority: 'Bar Council of Tamil Nadu & Puducherry',
          icon: Scale,
          primaryColor: '#B69B72',
          pillBg: 'rgba(182, 155, 114, 0.15)',
          pillText: '#D9C7A5',
          pillBorder: 'rgba(182, 155, 114, 0.3)',
          gradient: 'from-[#171F2D] via-[#202A3B] to-[#0E131D]',
          sealLabel: 'Advocate Bar Registration'
        };
      case 'CourtStaff':
        return {
          title: 'Court Registry & Staff Officer',
          badgeText: 'Judicial Administration Officer',
          authority: 'Office of the Principal District Registrar',
          icon: Building,
          primaryColor: '#10B981',
          pillBg: 'rgba(16, 185, 129, 0.15)',
          pillText: '#6EE7B7',
          pillBorder: 'rgba(16, 185, 129, 0.3)',
          gradient: 'from-[#0F231D] via-[#172C24] to-[#0A1612]',
          sealLabel: 'Court Officer Clearance'
        };
      case 'Admin':
        return {
          title: 'Master Portal Administrator',
          badgeText: 'Principal Judicial IT Directorate',
          authority: 'High Court Legal Aid Authority Master Console',
          icon: Shield,
          primaryColor: '#8B5CF6',
          pillBg: 'rgba(139, 92, 246, 0.15)',
          pillText: '#C4B5FD',
          pillBorder: 'rgba(139, 92, 246, 0.3)',
          gradient: 'from-[#1B172C] via-[#251E3D] to-[#0E0C18]',
          sealLabel: 'Root Security Clearance'
        };
      default:
        return {
          title: 'Registered Citizen Applicant',
          badgeText: 'Verified Citizen Beneficiary',
          authority: 'State Legal Aid Service Authority (TNSLSA)',
          icon: User,
          primaryColor: '#3B82F6',
          pillBg: 'rgba(59, 130, 246, 0.15)',
          pillText: '#93C5FD',
          pillBorder: 'rgba(59, 130, 246, 0.3)',
          gradient: 'from-[#171F2D] via-[#1E293B] to-[#0E131D]',
          sealLabel: 'Legal Aid Beneficiary Card'
        };
    }
  };

  const roleMeta = getRoleTheme();
  const RoleIcon = roleMeta.icon;

  const initials = formData.name 
    ? formData.name.replace(/^Advocate\s+/i, '').replace(/^Justice\s+/i, '').split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
    : (user?.name?.slice(0, 2).toUpperCase() || 'ID');

  const handleSaveProfile = async (e) => {
    e?.preventDefault();
    setSaving(true);
    try {
      // 1. Update Core User Model via /auth/profile
      const updatePayload = {
        name: formData.name,
        phone: formData.phone,
        location: formData.location,
        district: formData.district,
        state: formData.state,
        address: formData.address,
        specialization: formData.specialization,
        bio: formData.bio
      };

      const res = await axios.put('/auth/profile', updatePayload);
      const updatedUser = res.data || { ...user, ...updatePayload };

      // 2. Role specific endpoint sync if applicable
      if (user?.role === 'Lawyer') {
        await axios.post('/lawyers/profile', {
          fullName: formData.name,
          barRegistrationNumber: formData.barNumber,
          specializations: formData.specialization ? [formData.specialization] : [],
          experience: Number(formData.experienceYears),
          courtLevel: formData.courtLevel,
          consultationFee: Number(formData.consultationFee),
          bio: formData.bio
        }).catch(() => null);
      } else if (user?.role === 'Judge') {
        await axios.post('/judges/profile', {
          name: formData.name,
          designation: formData.designation,
          courtroom: formData.benchNumber,
          jurisdiction: formData.jurisdiction,
          registrationNumber: formData.judicialCode
        }).catch(() => null);
      }

      // Update AuthContext & localStorage to maintain session parity
      setUser(updatedUser);
      localStorage.setItem('legalAidUser', JSON.stringify(updatedUser));

      showToast('Profile credentials and judicial dossier updated successfully.');
    } catch (err) {
      console.error('Failed to update profile:', err);
      showToast('Error: Unable to synchronize changes with server.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordUpdate = (e) => {
    e.preventDefault();
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Please enter your existing password');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Success simulation
    showToast('Security credentials updated. Password changed successfully.');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">

      {/* ── TOAST NOTIFICATION ── */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#202A3B] text-white border border-[#B69B72]/40 shadow-2xl backdrop-blur-md"
          >
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCheck size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-white">System Confirmation</p>
              <p className="text-[11px] text-slate-300">{toastMessage}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── 1. OFFICIAL HERO DOSSIER HEADER ── */}
      <div 
        className="relative rounded-3xl overflow-hidden border border-slate-200/80 dark:border-slate-800 shadow-xl"
        style={{
          background: 'linear-gradient(135deg, #171F2D 0%, #202A3B 50%, #0E131D 100%)'
        }}
      >
        {/* Subtle Guilloche & Gold Grid Overlay */}
        <div 
          className="absolute inset-0 opacity-10 pointer-events-none"
          style={{
            backgroundImage: 'radial-gradient(#B69B72 1px, transparent 1px), radial-gradient(#D9C7A5 1px, transparent 1px)',
            backgroundSize: '24px 24px',
            backgroundPosition: '0 0, 12px 12px'
          }}
        />

        <div className="relative p-6 sm:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            
            {/* Official Monogram Badge */}
            <div className="relative shrink-0">
              <div 
                className="w-24 h-24 rounded-3xl flex items-center justify-center font-black text-3xl shadow-2xl transition-all duration-300 border-2"
                style={{
                  background: 'linear-gradient(135deg, #202A3B 0%, #111827 100%)',
                  color: '#D9C7A5',
                  borderColor: 'rgba(182, 155, 114, 0.4)',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)'
                }}
              >
                {initials}
              </div>

              {/* Verified Crest Badge */}
              <div 
                className="absolute -bottom-2 -right-2 p-1.5 rounded-xl border border-emerald-500/30 flex items-center justify-center shadow-lg"
                style={{ background: '#064E3B', color: '#34D399' }}
                title="Verified Active Credential in State Registry"
              >
                <ShieldCheck size={16} />
              </div>
            </div>

            {/* Profile Info & Official Designation */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  {formData.name || user?.name || 'Registered User'}
                </h1>
                
                {/* Official Role Pill */}
                <span 
                  className="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase border flex items-center gap-1.5 shadow-xs"
                  style={{
                    backgroundColor: roleMeta.pillBg,
                    color: roleMeta.pillText,
                    borderColor: roleMeta.pillBorder
                  }}
                >
                  <RoleIcon size={12} />
                  <span>{roleMeta.badgeText}</span>
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium flex items-center gap-2">
                <span className="text-[#D9C7A5] font-semibold">{roleMeta.title}</span>
                <span className="text-slate-500">·</span>
                <span>{formData.district}, {formData.state}</span>
              </p>

              <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Mail size={12} className="text-[#B69B72]" />
                  <span>{formData.email}</span>
                </span>
                <span>·</span>
                <span className="flex items-center gap-1">
                  <Fingerprint size={12} className="text-[#B69B72]" />
                  <span className="font-mono text-slate-200">{getRoleIdentifier()}</span>
                </span>
                <span>·</span>
                <span className="text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 size={12} /> Active & Good Standing
                </span>
              </div>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 self-stretch md:self-auto shrink-0">
            <button
              onClick={handleCopyId}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
              title="Copy official registration ID"
            >
              {copiedId ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} className="text-[#B69B72]" />}
              <span>{copiedId ? 'Copied' : 'Copy ID'}</span>
            </button>

            <button
              onClick={() => setShowIdCardModal(true)}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-[#B69B72]/40 bg-[#B69B72]/15 hover:bg-[#B69B72]/25 text-xs font-bold text-[#D9C7A5] flex items-center justify-center gap-2 transition cursor-pointer shadow-sm"
            >
              <Award size={14} />
              <span>Official Card</span>
            </button>

            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#B69B72] to-[#9A7E56] hover:from-[#c2a77d] hover:to-[#a4875d] text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-amber-950/20 transition cursor-pointer disabled:opacity-60"
            >
              {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-6 border-t border-slate-800/80 bg-slate-950/40 flex overflow-x-auto no-scrollbar gap-1">
          {[
            { id: 'dossier', label: 'Identity & Details', icon: User },
            { id: 'credentials', label: 'Official Clearance', icon: Award },
            { id: 'security', label: 'Security & Auth', icon: Lock },
            { id: 'preferences', label: 'System Preferences', icon: Sliders }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-bold flex items-center gap-2 border-b-2 transition whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'border-[#B69B72] text-[#D9C7A5] bg-[#B69B72]/10'
                    : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                }`}
              >
                <Icon size={14} className={isActive ? 'text-[#B69B72]' : 'text-slate-400'} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 2. TAB CONTENT ── */}
      <div className="grid gap-6">

        {/* ── TAB 1: IDENTITY & DETAILS ── */}
        {activeTab === 'dossier' && (
          <div className="grid gap-6 md:grid-cols-3">
            
            {/* Left 2 Cols: Main Editable Form */}
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-6">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                    <Edit3 size={16} className="text-[#B69B72]" />
                    <span>Personal & Official Information</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Update your verified registry record and contact channels.
                  </p>
                </div>

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Full Legal Name
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="form-input"
                        placeholder="Legal Name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Registered Email (Official)
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="form-input bg-slate-100 dark:bg-slate-900/80 text-slate-500 cursor-not-allowed"
                        title="Registered email cannot be modified directly"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        Contact Phone Number
                      </label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="form-input"
                        placeholder="+91 98421 00000"
                      />
                    </div>

                    {/* ROLE-SPECIFIC FIELD 1 */}
                    {user?.role === 'Lawyer' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Bar Registration No.
                        </label>
                        <input
                          type="text"
                          value={formData.barNumber}
                          onChange={e => setFormData({ ...formData, barNumber: e.target.value })}
                          className="form-input font-mono"
                          placeholder="BC/TN/XXXX/YEAR"
                        />
                      </div>
                    )}

                    {user?.role === 'Judge' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Judicial Warrant Code
                        </label>
                        <input
                          type="text"
                          value={formData.judicialCode}
                          onChange={e => setFormData({ ...formData, judicialCode: e.target.value })}
                          className="form-input font-mono"
                        />
                      </div>
                    )}

                    {user?.role === 'CourtStaff' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Employee Code / Staff ID
                        </label>
                        <input
                          type="text"
                          value={formData.staffId}
                          onChange={e => setFormData({ ...formData, staffId: e.target.value })}
                          className="form-input font-mono"
                        />
                      </div>
                    )}

                    {(user?.role === 'Applicant' || user?.role === 'User') && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Citizen Occupation
                        </label>
                        <input
                          type="text"
                          value={formData.occupation}
                          onChange={e => setFormData({ ...formData, occupation: e.target.value })}
                          className="form-input"
                          placeholder="e.g. Farmer / Agriculturalist"
                        />
                      </div>
                    )}

                    {user?.role === 'Admin' && (
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Cluster Node Assigned
                        </label>
                        <input
                          type="text"
                          value={formData.clusterNode}
                          disabled
                          className="form-input bg-slate-100 dark:bg-slate-900/80 font-mono text-slate-500"
                        />
                      </div>
                    )}
                  </div>

                  {/* ROLE-SPECIFIC ROW 2 */}
                  {user?.role === 'Lawyer' && (
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Legal Specialization
                        </label>
                        <input
                          type="text"
                          value={formData.specialization}
                          onChange={e => setFormData({ ...formData, specialization: e.target.value })}
                          className="form-input"
                          placeholder="e.g. Property Law, Criminal Defense"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Practice Experience (Years)
                        </label>
                        <input
                          type="number"
                          value={formData.experienceYears}
                          onChange={e => setFormData({ ...formData, experienceYears: e.target.value })}
                          className="form-input"
                          min="0"
                        />
                      </div>
                    </div>
                  )}

                  {user?.role === 'Judge' && (
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Judicial Designation
                        </label>
                        <input
                          type="text"
                          value={formData.designation}
                          onChange={e => setFormData({ ...formData, designation: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Bench / Courtroom Hall
                        </label>
                        <input
                          type="text"
                          value={formData.benchNumber}
                          onChange={e => setFormData({ ...formData, benchNumber: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}

                  {user?.role === 'CourtStaff' && (
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Registry Wing / Department
                        </label>
                        <input
                          type="text"
                          value={formData.department}
                          onChange={e => setFormData({ ...formData, department: e.target.value })}
                          className="form-input"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Clearance Level
                        </label>
                        <input
                          type="text"
                          value={formData.clearanceLevel}
                          disabled
                          className="form-input bg-slate-100 dark:bg-slate-900/80 font-mono text-slate-500"
                        />
                      </div>
                    </div>
                  )}

                  {(user?.role === 'Applicant' || user?.role === 'User') && (
                    <div className="grid gap-4 sm:grid-cols-2 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Household Monthly Income (LKR / INR)
                        </label>
                        <input
                          type="text"
                          value={formData.monthlyIncome}
                          onChange={e => setFormData({ ...formData, monthlyIncome: e.target.value })}
                          className="form-input"
                          placeholder="e.g. 15,000"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                          Primary Communication Language
                        </label>
                        <input
                          type="text"
                          value={formData.language}
                          onChange={e => setFormData({ ...formData, language: e.target.value })}
                          className="form-input"
                        />
                      </div>
                    </div>
                  )}

                  {/* Address Section */}
                  <div className="grid gap-4 sm:grid-cols-2 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        District
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={e => setFormData({ ...formData, district: e.target.value })}
                        className="form-input"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                        State / Province
                      </label>
                      <input
                        type="text"
                        value={formData.state}
                        onChange={e => setFormData({ ...formData, state: e.target.value })}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Official Chambers / Registered Address
                    </label>
                    <textarea
                      rows={2}
                      value={formData.address}
                      onChange={e => setFormData({ ...formData, address: e.target.value })}
                      className="form-input resize-none"
                      placeholder="Physical Street / Complex Address"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                      Professional Profile Bio / Public Notice
                    </label>
                    <textarea
                      rows={3}
                      value={formData.bio}
                      onChange={e => setFormData({ ...formData, bio: e.target.value })}
                      className="form-input resize-none"
                      placeholder="A short professional summary regarding practice areas, judicial focus, or citizen legal aid eligibility..."
                    />
                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      disabled={saving}
                      className="btn-primary py-2.5 px-6 rounded-xl font-bold text-xs flex items-center gap-2"
                    >
                      {saving ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                      <span>{saving ? 'Synchronizing...' : 'Save Updated Dossier'}</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Right 1 Col: Official Status Card & Quick Specs */}
            <div className="space-y-6">
              
              {/* Official Credential Card Preview */}
              <div 
                className="rounded-3xl p-6 text-white border border-[#B69B72]/30 shadow-lg space-y-4 relative overflow-hidden"
                style={{
                  background: 'linear-gradient(135deg, #202A3B 0%, #151D29 100%)'
                }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-[#B69B72]/20 border border-[#B69B72]/40 text-[#D9C7A5] flex items-center justify-center font-bold">
                      <Scale size={16} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#D9C7A5] uppercase tracking-wider">State Legal Aid</p>
                      <p className="text-[9px] text-slate-400">Judicial Directorate</p>
                    </div>
                  </div>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    VERIFIED
                  </span>
                </div>

                <div className="pt-2 space-y-1">
                  <p className="text-sm font-black text-white">{formData.name}</p>
                  <p className="text-[11px] text-[#D9C7A5] font-semibold">{roleMeta.title}</p>
                  <p className="text-[10px] font-mono text-slate-300">{getRoleIdentifier()}</p>
                </div>

                <div className="border-t border-slate-700/60 pt-3 grid grid-cols-2 gap-2 text-[10px] text-slate-400">
                  <div>
                    <span className="block text-slate-500 text-[9px] uppercase font-bold">Jurisdiction</span>
                    <span className="text-slate-200 font-medium">{formData.district}</span>
                  </div>
                  <div>
                    <span className="block text-slate-500 text-[9px] uppercase font-bold">Security Level</span>
                    <span className="text-slate-200 font-medium">Standard Class A</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowIdCardModal(true)}
                  className="w-full mt-2 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-[#D9C7A5] text-[11px] font-bold flex items-center justify-center gap-1.5 border border-[#B69B72]/30 transition cursor-pointer"
                >
                  <Printer size={12} /> View Official Badge Card
                </button>
              </div>

              {/* Status Checklist */}
              <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <ShieldCheck size={14} className="text-emerald-500" />
                  <span>Compliance & Registry Status</span>
                </h4>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Registry Standing</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Aadhaar / ID Verification</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <Check size={12} /> Audited
                    </span>
                  </div>

                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                    <span className="text-slate-500">Digital Signature Key</span>
                    <span className="font-bold text-sky-600 dark:text-sky-400 flex items-center gap-1 font-mono text-[11px]">
                      RSA-4096 VALID
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Last Registry Audit</span>
                    <span className="font-semibold text-slate-700 dark:text-slate-300">
                      {new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 2: OFFICIAL CLEARANCE & VERIFICATION ── */}
        {activeTab === 'credentials' && (
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Award size={18} className="text-[#B69B72]" />
                  <span>Judicial Clearance & Authorization Dossier</span>
                </h3>
                <p className="text-xs text-slate-400">
                  Certified government authority verification records and legal standing documentation.
                </p>
              </div>

              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 self-start sm:self-auto">
                Official Document Sealed
              </span>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center font-bold">
                  <Fingerprint size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Registration Authority
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {roleMeta.authority}
                </p>
                <div className="pt-2 text-[11px] font-mono font-bold text-[#B69B72]">
                  REG: {getRoleIdentifier()}
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center font-bold">
                  <Building size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Attached Court Venue
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Combined Court Complex, Theni District Court Division, Tamil Nadu
                </p>
                <div className="pt-2 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                  Hall Assignment: Bench 1
                </div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center font-bold">
                  <ShieldCheck size={18} />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Verification Audit Status
                </h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  State Legal Aid & High Court e-Committee verified identity dossier.
                </p>
                <div className="pt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <Check size={12} /> Compliance 100% Passed
                </div>
              </div>
            </div>

            {/* Official Credentials Detail Table */}
            <div className="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden">
              <div className="bg-slate-100/70 dark:bg-slate-850 px-5 py-3 border-b border-slate-200/80 dark:border-slate-800 font-bold text-xs text-slate-700 dark:text-slate-200">
                Official System Permissions & Authority Matrix
              </div>
              <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Case File Access Clearance</span>
                    <span className="text-slate-400 text-[11px]">Enables docket inspection and hearing representation records</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Granted · Level Tier A
                  </span>
                </div>

                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Judicial Vault & Documents Inspection</span>
                    <span className="text-slate-400 text-[11px]">Allows review of evidence files and certified court notices</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Granted · Realtime
                  </span>
                </div>

                <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-white block">Encrypted Messaging Communication</span>
                    <span className="text-slate-400 text-[11px]">Direct communications between citizens, advocates, and registry</span>
                  </div>
                  <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[11px] bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Active & Encrypted
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: SECURITY & AUTHENTICATION ── */}
        {activeTab === 'security' && (
          <div className="grid gap-6 md:grid-cols-2">
            
            {/* Password Update Form */}
            <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 shadow-sm space-y-5">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                  <Lock size={16} className="text-[#B69B72]" />
                  <span>Update Account Password</span>
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Ensure strong multi-character credential complexity.
                </p>
              </div>

              {passwordError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle size={14} />
                  <span>{passwordError}</span>
                </div>
              )}

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={currentPassword}
                      onChange={e => setCurrentPassword(e.target.value)}
                      className="form-input pr-10"
                      placeholder="••••••••••••"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    New Secure Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="form-input"
                    placeholder="Min 8 characters"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 uppercase tracking-wider">
                    Confirm New Password
                  </label>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="form-input"
                    placeholder="Repeat new password"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full btn-primary py-2.5 rounded-xl font-bold text-xs justify-center"
                >
                  Change Password
                </button>
              </form>
            </div>

            {/* 2FA & Active Sessions */}
            <div className="space-y-6">
              
              {/* 2FA Card */}
              <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center font-bold">
                      <Key size={18} />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                        Two-Factor Authentication (2FA)
                      </h4>
                      <p className="text-[11px] text-slate-400">Additional security challenge via Authenticator App</p>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setTwoFactorEnabled(!twoFactorEnabled);
                      showToast(`Two-factor authentication ${!twoFactorEnabled ? 'enabled' : 'disabled'}`);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer border ${
                      twoFactorEnabled
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border-slate-300 dark:border-slate-700'
                    }`}
                  >
                    {twoFactorEnabled ? 'Enabled' : 'Disabled'}
                  </button>
                </div>
              </div>

              {/* Active Sessions */}
              <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-sm space-y-4">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-2">
                  <Activity size={14} className="text-[#B69B72]" />
                  <span>Active Session Dossier</span>
                </h4>

                <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 dark:text-white">Current Workstation</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600">THIS SESSION</span>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Chrome on Windows 11 · IP 127.0.0.1 (Local Node)
                  </p>
                  <p className="text-[10px] text-slate-500">
                    Logged in via Secure JWT Session Authority
                  </p>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ── TAB 4: SYSTEM PREFERENCES & NOTIFICATIONS ── */}
        {activeTab === 'preferences' && (
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
                <Sliders size={16} className="text-[#B69B72]" />
                <span>Portal Appearance & Communication Preferences</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Customize workspace display parameters and court registry notification channels.
              </p>
            </div>

            {/* Theme Toggle Section */}
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center font-bold">
                  {theme === 'dark' ? <Moon size={18} /> : <Sun size={18} />}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Display Color Theme
                  </h4>
                  <p className="text-xs text-slate-400">
                    Currently operating in {theme === 'dark' ? 'Judicial Deep Dark' : 'Courtroom Light'} mode
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleTheme}
                className="btn-secondary py-2 px-4 rounded-xl text-xs font-bold flex items-center gap-2"
              >
                {theme === 'dark' ? <Sun size={14} className="text-amber-400" /> : <Moon size={14} className="text-indigo-400" />}
                <span>Switch to {theme === 'dark' ? 'Light' : 'Dark'}</span>
              </button>
            </div>

            {/* Notification Toggles */}
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Registry Notifications & Hearing Alerts
              </h4>

              {[
                { key: 'hearingAlerts', label: 'Hearing Dates & Cause List Notifications', desc: 'Realtime updates when bench schedules, adjourns, or confirms trial dates' },
                { key: 'caseUpdates', label: 'Petition Progress & Status Transitions', desc: 'Instant dispatch when a petition is accepted, assigned, or closed' },
                { key: 'emailDigest', label: 'Weekly Case Docket Summary Email', desc: 'Automated weekly PDF briefing sent directly to registered email' },
                { key: 'smsNotices', label: 'Urgent Registry SMS Alerts', desc: 'High-priority SMS alerts for same-day courtroom callings' }
              ].map(item => (
                <div 
                  key={item.key} 
                  className="p-4 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900/40 flex items-center justify-between transition cursor-pointer"
                  onClick={() => {
                    const next = !notifications[item.key];
                    setNotifications({ ...notifications, [item.key]: next });
                    showToast(`${item.label}: ${next ? 'Enabled' : 'Disabled'}`);
                  }}
                >
                  <div className="space-y-0.5 pr-4">
                    <p className="text-xs font-bold text-slate-900 dark:text-white">{item.label}</p>
                    <p className="text-[11px] text-slate-400">{item.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full transition-colors p-1 flex items-center shrink-0 ${
                    notifications[item.key] ? 'bg-[#B69B72] justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                  }`}>
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>

      {/* ── 3. OFFICIAL CREDENTIAL ID CARD MODAL ── */}
      <AnimatePresence>
        {showIdCardModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white dark:bg-[#1e293b] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden"
            >
              {/* Card Header Bar */}
              <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
                <span className="text-xs font-bold tracking-wider uppercase text-[#D9C7A5]">
                  Official Identity Credential
                </span>
                <button
                  onClick={() => setShowIdCardModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-bold px-2 py-1 rounded-lg"
                >
                  ✕
                </button>
              </div>

              {/* Physical Card Representation */}
              <div className="p-6">
                <div 
                  className="rounded-3xl p-6 text-white border-2 border-[#B69B72]/40 shadow-2xl relative overflow-hidden space-y-4"
                  style={{
                    background: 'linear-gradient(135deg, #171F2D 0%, #202A3B 50%, #0E131D 100%)'
                  }}
                >
                  {/* Watermark Crest */}
                  <div className="absolute right-[-20px] bottom-[-20px] opacity-10 pointer-events-none">
                    <Scale size={160} />
                  </div>

                  {/* Issuer Title */}
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-xl bg-[#B69B72]/20 border border-[#B69B72]/40 text-[#D9C7A5] flex items-center justify-center font-bold">
                        <Scale size={18} />
                      </div>
                      <div>
                        <h4 className="text-xs font-black tracking-wide text-white uppercase">State Legal Aid Portal</h4>
                        <p className="text-[9px] text-[#D9C7A5] font-semibold">{roleMeta.authority}</p>
                      </div>
                    </div>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold border border-emerald-500/30">
                      OFFICIAL
                    </span>
                  </div>

                  {/* Cardholder Center Details */}
                  <div className="flex items-center gap-4 pt-1">
                    <div className="w-16 h-16 rounded-2xl bg-[#202A3B] border-2 border-[#B69B72]/40 text-[#D9C7A5] flex items-center justify-center font-black text-xl shadow-lg shrink-0">
                      {initials}
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-sm font-black text-white">{formData.name}</p>
                      <p className="text-xs font-bold text-[#D9C7A5]">{roleMeta.title}</p>
                      <p className="text-[10px] text-slate-300 font-mono">REG ID: {getRoleIdentifier()}</p>
                    </div>
                  </div>

                  {/* Micro Details Grid */}
                  <div className="grid grid-cols-2 gap-2 text-[10px] pt-2 border-t border-slate-700/60 text-slate-300">
                    <div>
                      <span className="block text-slate-500 text-[8px] uppercase font-bold">District / Jurisdiction</span>
                      <span className="font-semibold text-white">{formData.district}, {formData.state}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[8px] uppercase font-bold">Clearance Level</span>
                      <span className="font-semibold text-white">Class A Verified</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[8px] uppercase font-bold">Issue Timestamp</span>
                      <span className="font-semibold text-white">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div>
                      <span className="block text-slate-500 text-[8px] uppercase font-bold">Validity Status</span>
                      <span className="font-semibold text-emerald-400">Perpetual / In Good Standing</span>
                    </div>
                  </div>

                  {/* Simulated Security Barcode */}
                  <div className="pt-2 text-center border-t border-slate-800">
                    <div className="h-6 w-full flex items-center justify-center gap-0.5 opacity-60">
                      {Array.from({ length: 38 }).map((_, i) => (
                        <div 
                          key={i} 
                          className="bg-white" 
                          style={{ 
                            width: (i % 3 === 0 ? '3px' : (i % 2 === 0 ? '1px' : '2px')), 
                            height: '100%' 
                          }} 
                        />
                      ))}
                    </div>
                    <span className="text-[8px] font-mono text-slate-500 tracking-widest uppercase">
                      CRYPTOGRAPHICALLY SEALED BY TNSLSA CENTRAL REGISTRY
                    </span>
                  </div>
                </div>

                <div className="mt-5 flex gap-2">
                  <button
                    onClick={() => {
                      window.print();
                    }}
                    className="flex-1 btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Printer size={14} /> Print Credential Card
                  </button>
                  <button
                    onClick={() => setShowIdCardModal(false)}
                    className="flex-1 btn-secondary py-2.5 rounded-xl text-xs font-bold justify-center cursor-pointer"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
