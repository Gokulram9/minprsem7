import { useState } from 'react';
import { 
  FileText, UploadCloud, Trash2, Eye, ShieldCheck, 
  Search, RefreshCw, ZoomIn, ZoomOut, RotateCw, X 
} from 'lucide-react';
import Card from '../components/ui/card';
import Button from '../components/ui/button';
import { motion } from 'framer-motion';

const initialDocs = [
  { id: 1, name: 'Application form.pdf', size: '2.4 MB', status: 'Uploaded', type: 'pdf', updated: 'Today, 10:15 AM' },
  { id: 2, name: 'Income statement.png', size: '1.8 MB', status: 'Approved', type: 'image', updated: 'Yesterday' },
  { id: 3, name: 'Counsel agreement.docx', size: '142 KB', status: 'Pending Review', type: 'pdf', updated: '3 days ago' },
  { id: 4, name: 'Hearing notice.pdf', size: '890 KB', status: 'Uploaded', type: 'pdf', updated: '1 week ago' },
];

const Documents = () => {
  const [docs, setDocs] = useState(initialDocs);
  const [search, setSearch] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedName, setUploadedName] = useState('');
  
  // Preview Modal States
  const [previewDoc, setPreviewDoc] = useState(null);
  const [zoom, setZoom] = useState(100);
  const [rotation, setRotation] = useState(0);

  // Filter docs
  const filteredDocs = docs.filter(doc => 
    doc.name.toLowerCase().includes(search.toLowerCase())
  );

  // File Upload handler simulation
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setUploadedName(file.name);
      setUploading(true);
      setProgress(0);

      // Simulate premium upload progress
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => {
              setDocs((prevDocs) => [
                {
                  id: Date.now(),
                  name: file.name,
                  size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
                  status: 'Uploaded',
                  type: file.type.includes('image') ? 'image' : 'pdf',
                  updated: 'Just now'
                },
                ...prevDocs
              ]);
              setUploading(false);
            }, 500);
            return 100;
          }
          return prev + 20;
        });
      }, 200);
    }
  };

  // Delete handler
  const deleteDoc = (id) => {
    setDocs(docs.filter(doc => doc.id !== id));
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
            <p className="text-xs uppercase tracking-[0.25em] font-semibold text-blue-600 dark:text-blue-400">Lexora Secure Vault</p>
            <h2 className="font-space text-2xl font-bold mt-1 tracking-tight">Case Document Workspace</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              All legal evidence, declarations, and court agreements are stored with zero-knowledge encryption.
            </p>
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-[220px]">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search files..."
              className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-11 pr-4 text-xs font-semibold outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
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
            <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white mb-4">Upload File</h3>
            
            {/* Drag drop slot */}
            <div className="relative rounded-[2rem] border-2 border-dashed border-slate-200 p-8 text-center bg-slate-50/50 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900/20 dark:hover:bg-slate-900/40 transition">
              <input 
                type="file" 
                onChange={handleFileChange}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer" 
              />
              <UploadCloud className="mx-auto h-12 w-12 text-slate-400 animate-bounce" />
              <p className="mt-3 text-xs font-bold text-slate-700 dark:text-slate-200">Drag files here or click to upload</p>
              <p className="mt-1 text-[10px] text-slate-400">PDF, JPG, PNG up to 15MB are scanned for malware.</p>
            </div>

            {/* UPLOAD PROGRESS BAR */}
            {uploading && (
              <div className="mt-6 space-y-2 rounded-2xl bg-blue-50/50 p-4 dark:bg-blue-950/20">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                    <RefreshCw size={12} className="animate-spin" /> Uploading:
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[120px]">{uploadedName}</span>
                  <span className="text-blue-600 dark:text-blue-400">{progress}%</span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 rounded-full dark:bg-slate-800 overflow-hidden">
                  <div className="h-full bg-blue-600 transition-all duration-200" style={{ width: `${progress}%` }} />
                </div>
              </div>
            )}
          </motion.div>

          {/* Security details card */}
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="rounded-[24px] bg-[#0A1224] p-6 text-white shadow-xl border border-white/5 text-left"
          >
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-emerald-400" />
              <h4 className="font-space text-xs font-bold uppercase tracking-wider text-emerald-400">SHA-256 Vault Signed</h4>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-slate-300">
              Each document is hashed and cross-referenced with your scheduling ID. No metadata is decrypted on server logs.
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
          <h3 className="font-space text-sm font-bold text-slate-900 dark:text-white mb-4">Stored Documents</h3>

          <div className="space-y-3">
            {filteredDocs.map((doc, idx) => (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 + idx * 0.05 }}
                key={doc.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-slate-100 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60 transition hover:border-blue-500/50"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-blue-600 dark:bg-blue-950/50 dark:text-blue-400">
                    <FileText size={16} />
                  </div>
                  <div className="min-w-0 text-left">
                    <p className="truncate text-xs font-bold text-slate-900 dark:text-white">{doc.name}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mt-0.5">
                      <span>{doc.size}</span>
                      <span>•</span>
                      <span>{doc.updated}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="rounded-md px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400">
                    {doc.status}
                  </span>
                  
                  <div className="flex gap-1">
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
                      onClick={() => deleteDoc(doc.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 dark:bg-red-950/20 dark:text-red-400 dark:hover:bg-red-950/40 transition"
                      title="Delete Document"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}

            {filteredDocs.length === 0 && (
              <p className="text-center text-xs text-slate-400 py-8">No documents found.</p>
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
            className="w-full max-w-2xl overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white shadow-2xl dark:border-slate-800 dark:bg-slate-950"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4 dark:border-slate-800">
              <div className="flex items-center gap-3">
                <FileText className="text-blue-500" size={18} />
                <div className="text-left">
                  <h3 className="font-space text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">{previewDoc.name}</h3>
                  <p className="text-[10px] text-slate-400">Vault Secure Previewer</p>
                </div>
              </div>

              {/* Reader tools */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setZoom(Math.max(zoom - 10, 50))} 
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ZoomOut size={14} />
                </button>
                <span className="text-[10px] font-bold text-slate-500">{zoom}%</span>
                <button 
                  onClick={() => setZoom(Math.min(zoom + 10, 200))} 
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <ZoomIn size={14} />
                </button>
                <button 
                  onClick={() => setRotation((prev) => (prev + 90) % 360)} 
                  className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <RotateCw size={14} />
                </button>
                <button 
                  onClick={() => setPreviewDoc(null)} 
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Document Content Simulation */}
            <div className="flex h-96 items-center justify-center overflow-auto bg-slate-100 p-6 dark:bg-slate-900">
              
              <div 
                className="rounded-xl bg-white p-8 shadow-md dark:bg-slate-950 transition-all duration-200"
                style={{
                  transform: `scale(${zoom / 100}) rotate(${rotation}deg)`,
                  width: '320px',
                  height: '420px'
                }}
              >
                {previewDoc.type === 'image' ? (
                  <div className="flex h-full flex-col items-center justify-center space-y-4">
                    <img 
                      src="https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80" 
                      alt="Affidavit document"
                      className="h-full w-full object-cover rounded" 
                    />
                  </div>
                ) : (
                  <div className="space-y-4 text-[9px] text-slate-400 leading-relaxed font-serif text-left">
                    <h2 className="text-center text-xs font-bold text-slate-800 dark:text-white uppercase">LEXORA LEGAL AFFIDAVIT DECLARATION</h2>
                    <p className="mt-6">Docket scheduling ID reference: 3842-DL.</p>
                    <p className="indent-4">This document serves to authenticate that client details, court hearings scheduling, and legal counsel matchmaking align with procedural code limits. High-contrast indicators are provisioned for access audits.</p>
                    <div className="h-[2px] bg-slate-100 w-full dark:bg-slate-800" />
                    <div className="grid grid-cols-2 gap-4 mt-12 text-[8px]">
                      <div>
                        <p>Authorized Agent Signature</p>
                        <p className="font-bold mt-4 text-slate-600 dark:text-slate-300">SYSTEM STAMPED</p>
                      </div>
                      <div className="text-right">
                        <p>Filing timestamp</p>
                        <p className="font-bold mt-4 text-slate-600 dark:text-slate-300">2026-06-30 EST</p>
                      </div>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-center border-t border-slate-100 bg-slate-50/50 py-3 text-[10px] text-slate-400 dark:border-slate-800 dark:bg-slate-900/30">
              SHA-256 Checksum: c6a4ef7b539...
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Documents;
