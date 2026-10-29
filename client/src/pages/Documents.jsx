import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { 
  FileText, UploadCloud, Trash2, Eye, ShieldCheck, 
  Search, RefreshCw, ZoomIn, ZoomOut, RotateCw, X, Download, AlertCircle 
} from 'lucide-react';
import { motion } from 'framer-motion';

const Documents = () => {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedName, setUploadedName] = useState('');
  const [uploadCategory, setUploadCategory] = useState('Evidence');
  const [uploadDocType, setUploadDocType] = useState('Evidence');
  
  // Preview Modal States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const res = await axios.get('/documents');
      const list = Array.isArray(res.data) ? res.data : [];
      setDocs(list.map(d => ({
        id: d._id,
        _id: d._id,
        name: d.originalName || d.filename,
        filename: d.filename,
        size: d.size ? `${(d.size / (1024 * 1024)).toFixed(2)} MB` : '1.2 MB',
        status: d.verificationStatus === 'Verified' ? 'Approved' : (d.verificationStatus === 'Rejected' ? 'Rejected' : 'Pending Review'),
        type: d.mimeType?.includes('image') ? 'image' : 'pdf',
        category: d.category || 'General',
        documentType: d.documentType || 'Other',
        uploader: d.uploader?.name || 'Self',
        application: d.application?.caseTitle || '',
        updated: d.createdAt ? new Date(d.createdAt).toLocaleDateString([], { dateStyle: 'medium' }) : 'Recently'
      })));
    } catch (err) {
      console.error('Failed to load documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  // Filter docs
  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase()) ||
    doc.category.toLowerCase().includes(search.toLowerCase()) ||
    doc.documentType.toLowerCase().includes(search.toLowerCase())
  );

  // Real File Upload handler with FormData
  const handleFileChange = async (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedName(file.name);
      setUploading(true);
      setProgress(10);

      const formData = new FormData();
      formData.append('file', file);
      formData.append('category', uploadCategory);
      formData.append('documentType', uploadDocType);

      try {
        const res = await axios.post('/documents', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round((progressEvent.loaded * 100) / (progressEvent.total || file.size));
            setProgress(Math.min(percent, 95));
          }
        });

        setProgress(100);
        setTimeout(() => {
          setUploading(false);
          setProgress(0);
          fetchDocs();
        }, 500);
      } catch (err) {
        console.error('File upload failed:', err);
        alert('Upload failed: ' + (err.response?.data?.message || err.message));
        setUploading(false);
        setProgress(0);
      }
    }
  };

  // Real Delete handler
  const deleteDoc = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this document?')) return;
    try {
      await axios.delete(`/documents/${id}`);
      setDocs(docs.filter(doc => doc.id !== id && doc._id !== id));
      if (previewDoc && (previewDoc.id === id || previewDoc._id === id)) {
        setPreviewDoc(null);
      }
    } catch (err) {
      alert('Failed to delete document: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="space-y-8 pb-10 text-slate-800 dark:text-slate-100">
      
      {/* HEADER BLOCK */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-[24px] glass-card p-8 shadow-xl"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-left">
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-[#B69B72]">Secure Vault</p>
            <h2 className="font-space text-2xl font-bold mt-1 tracking-tight">Case Document Workspace</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              All legal evidence, declarations, and court agreements are stored with verified judicial encryption.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[240px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search documents..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-semibold outline-none transition focus:border-[#B69B72] focus:ring-2 focus:ring-[#B69B72]/20 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            />
          </div>
        </div>
      </motion.div>

      <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        
        {/* LEFT COMPONENT: DRAG DROP UPLOAD */}
        <div className="space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="rounded-[24px] glass-card p-6 shadow-xl text-left"
          >
            <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white mb-4">Upload Legal Document</h3>
            
            {/* Category / Type Selector */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => setUploadCategory(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white dark:bg-slate-900 dark:border-slate-800 font-semibold"
                >
                  <option value="Evidence">Evidence Document</option>
                  <option value="Identification">Identification (Aadhaar / Voter)</option>
                  <option value="Income Proof">Income Proof / BPL Certificate</option>
                  <option value="Court Order">Court Summons / Order</option>
                  <option value="Affidavit">Signed Affidavit</option>
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Document Type</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full text-xs rounded-xl border border-slate-200 p-2 bg-white dark:bg-slate-900 dark:border-slate-800 font-semibold"
                >
                  <option value="Evidence">Evidentiary Record</option>
                  <option value="Identity">Identity Verification</option>
                  <option value="Income Proof">Income Certificate</option>
                  <option value="Affidavit">Sworn Affidavit</option>
                  <option value="Police Report">Police FIR / Report</option>
                  <option value="Other">Other Legal Paper</option>
                </select>
              </div>
            </div>

            {/* Drag drop slot */}
            <div className="relative rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center bg-[#FAF9F5] hover:border-[#B69B72] dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 transition">
              <input 
                type="file" 
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <UploadCloud className="mx-auto h-12 w-12 text-[#B69B72] animate-bounce" />
              <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Drag files here or click to upload</p>
              <p className="mt-1 text-[10px] text-slate-400">PDF, JPG, PNG, DOCX up to 15MB verified for courtroom dockets.</p>
            </div>

            {/* UPLOAD PROGRESS BAR */}
            {uploading && (
              <div className="mt-6 space-y-2 rounded-2xl bg-[#FAF9F5] p-4 border border-[#B69B72]/30 dark:bg-slate-900/40">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-[#202A3B] dark:text-[#D9C7A5]">
                    <RefreshCw size={12} className="animate-spin text-[#B69B72]" /> Uploading to MongoDB Vault:
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{uploadedName}</span>
                  <span className="text-[#B69B72] font-black">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-[#B69B72] to-[#9A7E55] transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Security details card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-[24px] bg-[#202A3B] p-6 text-white shadow-xl border border-[#B69B72]/25 text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#B69B72]" />
              <h4 className="font-space text-xs font-bold uppercase tracking-wider text-[#D9C7A5]">Authorized Vault Access</h4>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-[#F5F5EF]/80">
              Files are cross-referenced with your verified legal proceedings. Access is strictly limited to authorized advocates, judges, and case participants.
            </p>
          </motion.div>
        </div>

        {/* RIGHT COMPONENT: DOCUMENTS VAULT LIST */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="rounded-[24px] glass-card p-6 shadow-xl text-left"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white">Stored Vault Records ({filteredDocs.length})</h3>
            <button 
              onClick={fetchDocs} 
              className="text-[11px] font-bold text-[#B69B72] hover:underline flex items-center gap-1"
            >
              <RefreshCw size={12} className={loading ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>

          <div className="space-y-3">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2 text-slate-400">
                <div className="h-8 w-8 rounded-full border-2 border-[#B69B72] border-t-transparent animate-spin" />
                <p className="text-xs">Loading vault records...</p>
              </div>
            ) : filteredDocs.map((doc, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + idx * 0.04 }}
                key={doc.id || doc._id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 transition hover:border-[#B69B72]/60 shadow-xs"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#202A3B] text-[#B69B72] border border-[#B69B72]/20">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{doc.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.category}</span>
                      <span>•</span>
                      <span>{doc.updated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                    doc.status === 'Approved'
                      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                      : doc.status === 'Pending Review'
                      ? 'bg-[#B69B72]/15 text-[#8A6F46] dark:text-[#D9C7A5] border border-[#B69B72]/30'
                      : 'bg-rose-50 text-rose-600 border border-rose-200'
                  }`}>
                    {doc.status}
                  </span>
                  
                  <div className="flex gap-1">
                    <a
                      href={`/uploads/${doc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={doc.name}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                      title="Download File"
                    >
                      <Download size={12} />
                    </a>
                    <button
                      type="button"
                      onClick={() => setPreviewDoc(doc)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-50 text-slate-600 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 transition"
                      title="Preview Document"
                    >
                      <Eye size={12} />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteDoc(doc.id || doc._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                      title="Delete Document"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {!loading && filteredDocs.length === 0 && (
              <div className="text-center py-10 space-y-2">
                <FileText size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
                <p className="text-xs font-bold text-slate-500">No documents found.</p>
                <p className="text-[11px] text-slate-400">Upload evidence, affidavits, or case papers using the panel on the left.</p>
              </div>
            )}
          </div>
        </motion.div>

      </div>

      {/* PDF / IMAGE PREVIEW MODAL OVERLAY */}
      {previewDoc && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-md"
          onClick={() => setPreviewDoc(null)}
        >
          <div 
            className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950 flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800 shrink-0">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" size={18} />
                <div className="text-left">
                  <h3 className="font-space text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{previewDoc.name}</h3>
                  <p className="text-[10px] text-slate-400">Vault Secure Previewer ({previewDoc.size})</p>
                </div>
              </div>

              {/* Reader tools */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoom(prev => Math.min(prev + 20, 200))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  title="Zoom In"
                >
                  <ZoomIn size={14} />
                </button>
                <button 
                  onClick={() => setZoom(prev => Math.max(prev - 20, 60))}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  title="Zoom Out"
                >
                  <ZoomOut size={14} />
                </button>
                <button 
                  onClick={() => setRotation(prev => (prev + 90) % 360)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white"
                  title="Rotate"
                >
                  <RotateCw size={14} />
                </button>
                <a
                  href={`/uploads/${previewDoc.filename}`}
                  download={previewDoc.name}
                  className="p-1.5 rounded-lg bg-[#202A3B] text-white hover:bg-[#2c394f]"
                  title="Download File"
                >
                  <Download size={14} />
                </a>
                <button 
                  onClick={() => setPreviewDoc(null)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-white ml-2 text-lg font-bold"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Viewer Content */}
            <div className="p-6 overflow-auto flex items-center justify-center min-h-[350px] bg-slate-50 dark:bg-slate-900/40">
              {previewDoc.type === 'image' ? (
                <div style={{ transform: `scale(${zoom / 100}) rotate(${rotation}deg)`, transition: 'transform 0.2s ease' }}>
                  <img 
                    src={`/uploads/${previewDoc.filename}`} 
                    alt={previewDoc.name} 
                    className="max-h-[400px] rounded-xl object-contain shadow-lg"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'block';
                    }}
                  />
                  <div style={{ display: 'none' }} className="text-center p-6 text-slate-400">
                    <p className="text-xs">Image preview not available directly.</p>
                  </div>
                </div>
              ) : (
                <div className="text-center space-y-4 p-8">
                  <div className="w-16 h-16 rounded-2xl bg-[#202A3B] text-[#B69B72] flex items-center justify-center mx-auto border border-[#B69B72]/30 shadow-md">
                    <FileText size={32} />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{previewDoc.name}</p>
                    <p className="text-xs text-slate-400 mt-1">Legal Document · {previewDoc.category} · {previewDoc.size}</p>
                  </div>
                  <div className="flex justify-center gap-3">
                    <a
                      href={`/uploads/${previewDoc.filename}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-[#202A3B] text-white text-xs font-bold hover:bg-[#2d3a50] transition flex items-center gap-1.5"
                    >
                      <Eye size={14} /> Open in Viewer Tab
                    </a>
                    <a
                      href={`/uploads/${previewDoc.filename}`}
                      download={previewDoc.name}
                      className="px-4 py-2 rounded-xl bg-[#B69B72] text-white text-xs font-bold hover:bg-[#a3875f] transition flex items-center gap-1.5"
                    >
                      <Download size={14} /> Download File
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Documents;
