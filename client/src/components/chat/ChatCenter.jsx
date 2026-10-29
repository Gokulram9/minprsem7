import { useState, useEffect, useRef, useContext, useMemo } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import axios from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { getSocket, joinConversationRoom, leaveConversationRoom } from '../../services/socket';
import {
  MessageSquare, Send, Paperclip, Search, Plus, User,
  FileText, Check, CheckCheck, Clock, Shield, Scale,
  ExternalLink, Download, X, AlertCircle, RefreshCw,
  BookOpen, Folder, UploadCloud, Users, ChevronRight, Copy
} from 'lucide-react';

const PRECEDENT_CATEGORIES = [
  'All',
  'Land & Property',
  'Constitutional',
  'Criminal Defense',
  'Family & Custody',
  'Workplace & Labor',
  'Consumer & Banking',
  'Cyber & Information Tech'
];

const CONTACT_TABS = ['All', 'Advocates', 'Clients', 'Court Staff', 'Admin'];

const ChatCenter = ({ initialConversationId = null, targetUserId = null, caseId = null }) => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const location = useLocation();

  const queryConvId = searchParams.get('conversationId') || searchParams.get('convId') || location.state?.conversationId || initialConversationId;
  const queryUserId = searchParams.get('userId') || searchParams.get('lawyerId') || searchParams.get('clientId') || location.state?.targetUserId || location.state?.lawyerId || targetUserId;
  const queryCaseId = searchParams.get('caseId') || location.state?.caseId || caseId;

  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Contacts picker modal
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [availableContacts, setAvailableContacts] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [activeContactTab, setActiveContactTab] = useState('All');
  const [contactSearchQuery, setContactSearchQuery] = useState('');

  // Precedents Library Modal state
  const [showPrecedentsModal, setShowPrecedentsModal] = useState(false);
  const [precedentsList, setPrecedentsList] = useState([]);
  const [loadingPrecedents, setLoadingPrecedents] = useState(false);
  const [precedentSearch, setPrecedentSearch] = useState('');
  const [precedentCategory, setPrecedentCategory] = useState('All');
  const [selectedPrecedent, setSelectedPrecedent] = useState(null);

  // Case Documents Modal state
  const [showDocumentsModal, setShowDocumentsModal] = useState(false);
  const [caseDocuments, setCaseDocuments] = useState([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [documentSearch, setDocumentSearch] = useState('');

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const modalFileInputRef = useRef(null);
  const messagesEndRef = useRef(null);
  const chatInputRef = useRef(null);

  // ── 1. Load Conversations ──
  const fetchConversations = async (selectConvId = null) => {
    try {
      setLoadingConversations(true);
      const res = await axios.get('/messages/conversations');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setConversations(res.data.data);
        if (selectConvId) {
          const match = res.data.data.find(c => c._id === selectConvId);
          if (match) setActiveConversation(match);
        } else if (!activeConversation && res.data.data.length > 0) {
          setActiveConversation(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to load conversations:', err.message);
    } finally {
      setLoadingConversations(false);
    }
  };

  // ── 2. Load Messages for Active Conversation ──
  const fetchMessages = async (convId) => {
    if (!convId) return;
    try {
      setLoadingMessages(true);
      const res = await axios.get(`/messages/${convId}/messages`);
      if (res.data?.success && Array.isArray(res.data.data)) {
        setMessages(res.data.data);
        // Mark conversation read on server
        await axios.patch(`/messages/${convId}/read`).catch(() => {});
        // Update local unread counter
        setConversations(prev =>
          prev.map(c => {
            if (c._id === convId) {
              const updatedCounts = { ...(c.unreadCounts || {}) };
              if (user?._id) updatedCounts[user._id] = 0;
              return { ...c, unreadCounts: updatedCounts };
            }
            return c;
          })
        );
      }
    } catch (err) {
      console.error('Failed to load messages:', err.message);
    } finally {
      setLoadingMessages(false);
    }
  };

  // ── 3. Fetch Available Contacts for "New Chat" ──
  const fetchContacts = async () => {
    try {
      setLoadingContacts(true);
      const res = await axios.get('/messages/contacts');
      if (res.data?.success && Array.isArray(res.data.data)) {
        setAvailableContacts(res.data.data);
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err.message);
    } finally {
      setLoadingContacts(false);
    }
  };

  // ── 4. Fetch Precedents from Library ──
  const fetchPrecedents = async (query = '', category = 'All') => {
    try {
      setLoadingPrecedents(true);
      const params = {};
      if (query.trim()) params.query = query.trim();
      if (category && category !== 'All') params.specialization = category;
      const res = await axios.get('/judgments', { params });
      if (res.data?.judgments) {
        setPrecedentsList(res.data.judgments);
      }
    } catch (err) {
      console.warn('Failed to load precedents:', err.message);
    } finally {
      setLoadingPrecedents(false);
    }
  };

  // ── 5. Fetch Case Documents ──
  const fetchCaseDocuments = async () => {
    try {
      setLoadingDocuments(true);
      const params = {};
      const activeCaseId = activeConversation?.caseId?._id || activeConversation?.caseId || queryCaseId;
      if (activeCaseId) {
        params.application = activeCaseId;
      }
      const res = await axios.get('/documents', { params });
      if (Array.isArray(res.data)) {
        setCaseDocuments(res.data);
      }
    } catch (err) {
      console.warn('Failed to load case documents:', err.message);
    } finally {
      setLoadingDocuments(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchConversations(queryConvId);
    fetchContacts();
  }, [queryConvId]);

  // Handle target user or case parameter passed directly or via URL
  useEffect(() => {
    if (queryUserId && conversations.length > 0) {
      const existing = conversations.find(c =>
        c.participants?.some(p => {
          const id = p._id ? p._id.toString() : p.toString();
          return id === queryUserId.toString();
        })
      );
      if (existing) {
        setActiveConversation(existing);
      } else {
        // Automatically start conversation with target lawyer/client if not exists
        axios.post('/messages/conversations', {
          recipientId: queryUserId,
          caseId: queryCaseId
        })
          .then(res => {
            if (res.data?.success && res.data.data) {
              fetchConversations(res.data.data._id);
            }
          })
          .catch(err => console.warn('Could not auto-create conversation:', err.message));
      }
    }
  }, [queryUserId, conversations]);

  // Join socket room and load messages when active conversation changes
  useEffect(() => {
    if (activeConversation?._id) {
      joinConversationRoom(activeConversation._id);
      fetchMessages(activeConversation._id);

      return () => {
        leaveConversationRoom(activeConversation._id);
      };
    }
  }, [activeConversation?._id]);

  // Socket listener for real-time messages
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (incomingMsg) => {
      const incomingConvId = incomingMsg.conversationId || incomingMsg.conversation;
      if (activeConversation && activeConversation._id === incomingConvId) {
        setMessages(prev => {
          if (prev.some(m => m._id === incomingMsg._id)) return prev;
          return [...prev, incomingMsg];
        });
        if (incomingMsg.sender?._id !== user?._id && incomingMsg.sender !== user?._id) {
          axios.patch(`/messages/${incomingConvId}/read`).catch(() => {});
        }
      }

      setConversations(prev => {
        const found = prev.find(c => c._id === incomingConvId);
        if (found) {
          return prev.map(c => {
            if (c._id === incomingConvId) {
              const currentUnread = (c.unreadCounts && user?._id ? (c.unreadCounts[user._id] || 0) : 0);
              const isCurrentActive = activeConversation && activeConversation._id === incomingConvId;
              const newUnread = isCurrentActive ? 0 : currentUnread + 1;
              const updatedCounts = { ...(c.unreadCounts || {}) };
              if (user?._id) updatedCounts[user._id] = newUnread;

              return {
                ...c,
                lastMessage: incomingMsg.text || (incomingMsg.precedent ? `[Precedent] ${incomingMsg.precedent.title}` : incomingMsg.attachments?.length ? 'Shared a document' : 'New message'),
                lastMessageAt: incomingMsg.createdAt || new Date().toISOString(),
                unreadCounts: updatedCounts
              };
            }
            return c;
          }).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        } else {
          fetchConversations();
          return prev;
        }
      });
    };

    const handleConversationUpdate = () => {
      fetchConversations();
    };

    socket.on('newMessage', handleNewMessage);
    socket.on('conversationUpdate', handleConversationUpdate);

    return () => {
      socket.off('newMessage', handleNewMessage);
      socket.off('conversationUpdate', handleConversationUpdate);
    };
  }, [activeConversation?._id, user?._id]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Debounced search for precedents modal
  useEffect(() => {
    if (showPrecedentsModal) {
      const timer = setTimeout(() => {
        fetchPrecedents(precedentSearch, precedentCategory);
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [precedentSearch, precedentCategory, showPrecedentsModal]);

  // ── 6. Robust Messager / Recipient Name Resolution ──
  const getRecipientInfo = (conv) => {
    if (!conv) return { name: 'Legal Aid Chat', role: 'Counsel', email: '', id: null, initial: 'L' };

    const myId = (user?._id || user?.id || '').toString();

    // 1. Check conv.contact
    if (conv.contact && typeof conv.contact === 'object') {
      const contactId = (conv.contact._id || conv.contact.id || '').toString();
      if (contactId && contactId !== myId && conv.contact.name) {
        const role = conv.contact.role === 'User' ? 'Applicant' : (conv.contact.role || 'Member');
        return {
          name: conv.contact.name,
          role,
          email: conv.contact.email || '',
          phone: conv.contact.phone || '',
          specialization: conv.contact.specialization || '',
          profileImage: conv.contact.profileImage || null,
          id: conv.contact._id || conv.contact.id,
          initial: conv.contact.name.charAt(0).toUpperCase()
        };
      }
    }

    // 2. Check conv.otherParticipant
    if (conv.otherParticipant && typeof conv.otherParticipant === 'object') {
      const otherId = (conv.otherParticipant._id || conv.otherParticipant.id || '').toString();
      if (otherId && otherId !== myId && conv.otherParticipant.name) {
        const role = conv.otherParticipant.role === 'User' ? 'Applicant' : (conv.otherParticipant.role || 'Member');
        return {
          name: conv.otherParticipant.name,
          role,
          email: conv.otherParticipant.email || '',
          phone: conv.otherParticipant.phone || '',
          specialization: conv.otherParticipant.specialization || '',
          profileImage: conv.otherParticipant.profileImage || null,
          id: conv.otherParticipant._id || conv.otherParticipant.id,
          initial: conv.otherParticipant.name.charAt(0).toUpperCase()
        };
      }
    }

    // 3. Check conv.participants array
    if (Array.isArray(conv.participants) && conv.participants.length > 0) {
      const other = conv.participants.find(p => {
        const pid = (p?._id || p?.id || p || '').toString();
        return pid && pid !== myId;
      });

      if (other && typeof other === 'object' && other.name) {
        const role = other.role === 'User' ? 'Applicant' : (other.role || 'Member');
        return {
          name: other.name,
          role,
          email: other.email || '',
          phone: other.phone || '',
          specialization: other.specialization || '',
          profileImage: other.profileImage || null,
          id: other._id || other.id,
          initial: other.name.charAt(0).toUpperCase()
        };
      }

      // If other is just an ID string, cross-reference availableContacts
      const rawOtherId = (other?._id || other?.id || other || '').toString();
      if (rawOtherId && availableContacts.length > 0) {
        const found = availableContacts.find(ac => (ac._id || ac.user?._id || '').toString() === rawOtherId);
        if (found) {
          const u = found.user || found;
          return {
            name: u.name,
            role: u.role === 'User' ? 'Applicant' : (u.role || 'Member'),
            email: u.email || '',
            phone: u.phone || '',
            specialization: u.specialization || '',
            id: u._id,
            initial: u.name.charAt(0).toUpperCase()
          };
        }
      }
    }

    // 4. Check conversation title
    if (conv.title && !conv.title.toLowerCase().includes('support / registry') && !conv.title.startsWith('Conversation with')) {
      return {
        name: conv.title,
        role: conv.conversationType || 'Legal Aid',
        email: conv.caseTitle || '',
        id: conv._id || conv.id,
        initial: conv.title.charAt(0).toUpperCase()
      };
    }

    // 5. Case-based naming
    if (conv.caseTitle || conv.caseId?.caseTitle) {
      return {
        name: `Counsel - ${conv.caseTitle || conv.caseId?.caseTitle}`,
        role: 'Advocate',
        email: '',
        id: null,
        initial: 'A'
      };
    }

    return {
      name: 'Legal Aid Counsel',
      role: 'Advocate',
      email: '',
      id: null,
      initial: 'L'
    };
  };

  const currentRecipient = getRecipientInfo(activeConversation);
  const activeCase = activeConversation?.caseId;

  // ── 7. Handle Starting New Conversation ──
  const handleSelectContact = async (contact) => {
    try {
      const targetId = contact._id || contact.id || contact.user?._id;
      if (!targetId) {
        alert('Could not determine contact ID');
        return;
      }

      const res = await axios.post('/messages/conversations', {
        recipientId: targetId,
        caseId: contact.caseId || undefined,
        conversationType: contact.category === 'Advocates' ? 'Applicant-Lawyer' : 'Direct'
      });

      if (res.data?.success && res.data.data) {
        const conv = res.data.data;
        setShowNewChatModal(false);
        await fetchConversations(conv._id);
        setActiveConversation(conv);
      }
    } catch (err) {
      alert(`Could not start conversation: ${err.response?.data?.message || err.message}`);
    }
  };

  // ── 8. Direct File Upload ──
  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);
    if (activeConversation?.caseId?._id || activeConversation?.caseId) {
      formData.append('caseId', activeConversation.caseId._id || activeConversation.caseId);
    }
    if (activeConversation?._id) {
      formData.append('conversationId', activeConversation._id);
    }

    try {
      setUploadingFile(true);
      const res = await axios.post('/messages/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const attachment = res.data?.data || res.data?.attachment;
      if (attachment) {
        setSelectedAttachment(attachment);
        setShowDocumentsModal(false);
      }
    } catch (err) {
      alert(`Attachment failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (modalFileInputRef.current) modalFileInputRef.current.value = '';
    }
  };

  // ── 9. Send Message ──
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() && !selectedAttachment && !selectedPrecedent) return;
    if (!activeConversation) return;

    const payload = {
      conversationId: activeConversation._id,
      receiverId: currentRecipient.id,
      message: messageText.trim(),
      caseId: activeConversation.caseId?._id || activeConversation.caseId || null,
      attachments: selectedAttachment ? [selectedAttachment] : [],
      precedent: selectedPrecedent || null,
      messageType: selectedPrecedent ? 'precedent' : (selectedAttachment && !messageText.trim() ? 'document' : 'text')
    };

    setSending(true);
    try {
      const res = await axios.post('/messages', payload);
      if (res.data?.success && res.data.data) {
        const savedMsg = res.data.data;
        setMessages(prev => {
          if (prev.some(m => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
        setMessageText('');
        setSelectedAttachment(null);
        setSelectedPrecedent(null);
      }
    } catch (err) {
      alert(`Message delivery failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSending(false);
    }
  };

  // ── 10. Insert Precedent Citation Into Message Text ──
  const handleInsertPrecedentIntoText = (prec) => {
    const formattedCitation = `📚 [Legal Precedent Citation]\nCase: ${prec.title}\nCitation: ${prec.citation} (${prec.court || 'Supreme Court'})\nRatio Decidendi: ${prec.ratio || prec.summary}\n`;
    setMessageText(prev => (prev ? `${prev.trim()}\n\n${formattedCitation}` : formattedCitation));
    setShowPrecedentsModal(false);
    setTimeout(() => chatInputRef.current?.focus(), 150);
  };

  // ── 11. Attach Precedent as Structured Card ──
  const handleAttachPrecedentCard = (prec) => {
    setSelectedPrecedent(prec);
    setShowPrecedentsModal(false);
    setTimeout(() => chatInputRef.current?.focus(), 150);
  };

  // ── 12. Attach Existing Case Document ──
  const handleAttachCaseDocument = (doc) => {
    setSelectedAttachment({
      name: doc.originalName || doc.filename,
      url: `/uploads/${doc.filename}`,
      fileType: doc.mimeType,
      size: doc.size
    });
    setShowDocumentsModal(false);
  };

  // Filter conversations in left pane
  const filteredConversations = useMemo(() => {
    return conversations.filter(c => {
      const info = getRecipientInfo(c);
      const search = searchQuery.toLowerCase();
      const caseTitle = c.caseId?.caseTitle || c.caseId?.caseNumber || '';
      return (
        info.name.toLowerCase().includes(search) ||
        info.role.toLowerCase().includes(search) ||
        caseTitle.toLowerCase().includes(search) ||
        (c.lastMessage || '').toLowerCase().includes(search)
      );
    });
  }, [conversations, searchQuery, availableContacts]);

  // Filter contacts in New Chat modal
  const filteredContacts = useMemo(() => {
    return availableContacts.filter(contact => {
      const matchesTab = activeContactTab === 'All' || contact.category === activeContactTab;
      if (!matchesTab) return false;

      if (!contactSearchQuery.trim()) return true;
      const q = contactSearchQuery.toLowerCase();
      return (
        (contact.name || '').toLowerCase().includes(q) ||
        (contact.role || '').toLowerCase().includes(q) ||
        (contact.email || '').toLowerCase().includes(q) ||
        (contact.relation || '').toLowerCase().includes(q) ||
        (contact.specialization || '').toLowerCase().includes(q) ||
        (contact.caseTitle || '').toLowerCase().includes(q)
      );
    });
  }, [availableContacts, activeContactTab, contactSearchQuery]);

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row h-[720px]">
      
      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── LEFT PANE: CONVERSATION LIST ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-[#0B111E] shrink-0">
        
        {/* Header & Controls */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communications</h3>
                <p className="text-[10px] text-slate-400">Seven Seas Chamber Portal</p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchContacts();
                setShowNewChatModal(true);
              }}
              className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-sm transition flex items-center gap-1.5 text-xs font-bold cursor-pointer"
              title="Start New Conversation"
            >
              <Plus size={14} /> New Chat
            </button>
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search conversations, cases, counsel..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-blue-500 transition"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-slate-100 dark:divide-slate-900/50">
          {loadingConversations ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-2">
              <RefreshCw size={18} className="animate-spin mx-auto text-blue-500" />
              <p>Loading active legal communications…</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-3">
              <MessageSquare size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No conversations found</p>
              <p className="text-[11px]">Click "+ New Chat" to message your clients, advocate, admin, or court staff.</p>
              <button
                onClick={() => {
                  fetchContacts();
                  setShowNewChatModal(true);
                }}
                className="mt-2 text-xs font-bold text-blue-600 hover:underline"
              >
                Open Contacts Directory
              </button>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const info = getRecipientInfo(conv);
              const isActive = activeConversation?._id === conv._id;
              const unread = conv.unreadCounts && user?._id ? (conv.unreadCounts[user._id] || 0) : 0;

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition cursor-pointer ${
                    isActive
                      ? 'bg-[#FAF9F5] dark:bg-[#1A2230] border border-[#B69B72]/60 shadow-xs'
                      : 'hover:bg-white dark:hover:bg-slate-900/80'
                  }`}
                >
                  {/* Avatar with initial */}
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                    info.role === 'Admin' ? 'bg-purple-900 text-purple-200 border border-purple-500/30' :
                    info.role === 'Lawyer' ? 'bg-[#202A3B] text-[#D9C7A5] border border-[#D9C7A5]/40' :
                    info.role === 'CourtStaff' ? 'bg-amber-900 text-amber-200 border border-amber-500/30' :
                    'bg-blue-900 text-blue-200 border border-blue-500/30'
                  }`}>
                    {info.initial}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {info.name}
                      </p>
                      {conv.lastMessageAt && (
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(conv.lastMessageAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                        info.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' :
                        info.role === 'Lawyer' ? 'bg-[#B69B72]/15 text-[#8A6F46] dark:text-[#D9C7A5]' :
                        info.role === 'CourtStaff' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                        'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                      }`}>
                        {info.role}
                      </span>

                      {conv.caseId?.caseNumber && (
                        <span className="text-[9px] font-mono text-slate-500 dark:text-slate-400 bg-slate-200/70 dark:bg-slate-800 px-1 rounded truncate">
                          {conv.caseId.caseNumber}
                        </span>
                      )}
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-1">
                      {conv.lastMessage || 'Channel established'}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="bg-[#B69B72] text-white text-[10px] font-black rounded-full h-5 min-w-[20px] px-1.5 flex items-center justify-center shrink-0">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── RIGHT PANE: ACTIVE CHAT WINDOW ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111827]">
        {activeConversation ? (
          <>
            {/* ── Chat Header with Messager Profile ── */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm shrink-0 ${
                  currentRecipient.role === 'Admin' ? 'bg-purple-600' :
                  currentRecipient.role === 'Lawyer' ? 'bg-[#202A3B] text-[#D9C7A5] border border-[#B69B72]/40' :
                  currentRecipient.role === 'CourtStaff' ? 'bg-amber-600' :
                  'bg-blue-600'
                }`}>
                  {currentRecipient.initial}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentRecipient.name}
                    </h4>
                    <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      currentRecipient.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' :
                      currentRecipient.role === 'Lawyer' ? 'bg-[#B69B72]/20 text-[#8A6F46] dark:text-[#D9C7A5]' :
                      currentRecipient.role === 'CourtStaff' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                      'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                    }`}>
                      {currentRecipient.role}
                    </span>
                    {currentRecipient.specialization && (
                      <span className="text-[10px] text-slate-400 border border-slate-200 dark:border-slate-800 px-2 py-0.5 rounded-full">
                        {currentRecipient.specialization}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{currentRecipient.email || 'Verified Legal Contact'}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> End-to-End Authenticated
                    </span>
                  </p>
                </div>
              </div>

              {/* Case Context Pill */}
              {activeCase && (
                <div className="p-2.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-900/60 flex items-center gap-3 self-start sm:self-auto text-xs">
                  <Scale size={16} className="text-blue-600 dark:text-blue-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-slate-900 dark:text-white truncate text-[11px]">
                      {activeCase.caseTitle || activeCase.caseNumber}
                    </p>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400">
                      Docket: <span className="font-mono font-semibold">{activeCase.caseNumber || 'CASE-AID'}</span>
                      {activeCase.court ? ` • ${activeCase.court}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* ── Message Thread (Sender Names on Every Message) ── */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50/30 dark:bg-[#0E1524]">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <RefreshCw size={20} className="animate-spin text-blue-500 mr-2" /> Loading authenticated messages…
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Channel Initialized</p>
                  <p className="text-[11px] max-w-sm">
                    Direct communication with <strong>{currentRecipient.name}</strong> ({currentRecipient.role}) established. You can send messages, insert Supreme Court precedents, and attach case filings below.
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const senderId = (msg.sender?._id || msg.sender?.id || msg.sender || '').toString();
                  const myId = (user?._id || user?.id || '').toString();
                  const isSender = senderId === myId;
                  const isSystem = msg.messageType === 'System' || msg.isSystem;

                  if (isSystem) {
                    return (
                      <div key={msg._id} className="flex justify-center my-2">
                        <div className="bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] px-3.5 py-1.5 rounded-full border border-slate-300/50 dark:border-slate-700 flex items-center gap-2 max-w-md text-center">
                          <Shield size={12} className="text-blue-500 shrink-0" />
                          <span>{msg.text || msg.message}</span>
                        </div>
                      </div>
                    );
                  }

                  // Determine sender display name & role badge
                  let senderDisplayName = '';
                  let senderRoleBadge = '';

                  if (isSender) {
                    senderDisplayName = `You (${user?.name || 'Applicant'})`;
                    senderRoleBadge = user?.role === 'User' ? 'Applicant' : (user?.role || 'Applicant');
                  } else {
                    if (msg.sender && typeof msg.sender === 'object' && msg.sender.name) {
                      senderDisplayName = msg.sender.name;
                      senderRoleBadge = msg.sender.role === 'User' ? 'Applicant' : (msg.sender.role || currentRecipient.role);
                    } else {
                      senderDisplayName = currentRecipient.name;
                      senderRoleBadge = currentRecipient.role;
                    }
                  }

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                    >
                      {/* ── Sender Name Header Above Every Message Bubble ── */}
                      <div className={`flex items-center gap-1.5 mb-1 px-1 text-[11px] ${isSender ? 'justify-end' : 'justify-start'}`}>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {senderDisplayName}
                        </span>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded-md ${
                          senderRoleBadge === 'Lawyer' ? 'bg-[#B69B72]/20 text-[#8A6F46] dark:text-[#D9C7A5]' :
                          senderRoleBadge === 'CourtStaff' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                          senderRoleBadge === 'Admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' :
                          'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {senderRoleBadge}
                        </span>
                      </div>

                      <div className="flex items-end gap-1.5 max-w-[82%]">
                        {!isSender && (
                          <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0 mb-1">
                            {senderDisplayName.charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className={`p-3.5 rounded-3xl text-xs leading-relaxed shadow-xs ${
                          isSender
                            ? 'bg-[#202A3B] text-white border border-[#B69B72]/20 rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                        }`}>
                          {/* Message Text Content */}
                          {msg.text || msg.message ? (
                            <p className="whitespace-pre-wrap">{msg.text || msg.message}</p>
                          ) : null}

                          {/* ── RENDER PRECEDENT CARD IF ATTACHED ── */}
                          {msg.precedent && (
                            <div className="mt-2.5 p-3 rounded-2xl bg-[#FAF9F5] dark:bg-[#151D2A] border border-[#B69B72]/50 text-slate-800 dark:text-slate-100 text-left space-y-1.5 shadow-xs">
                              <div className="flex items-center justify-between gap-2">
                                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#8A6F46] dark:text-[#D9C7A5] uppercase tracking-wider">
                                  <Scale size={12} className="text-[#B69B72]" /> Judicial Precedent Brief
                                </span>
                                {msg.precedent.year && (
                                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-bold">
                                    {msg.precedent.year}
                                  </span>
                                )}
                              </div>

                              <h5 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                                {msg.precedent.title}
                              </h5>

                              <p className="text-[10px] font-mono font-semibold text-blue-600 dark:text-blue-400">
                                {msg.precedent.citation}
                              </p>

                              {msg.precedent.bench && (
                                <p className="text-[10px] text-slate-500 dark:text-slate-400 italic">
                                  Bench: {msg.precedent.bench}
                                </p>
                              )}

                              {(msg.precedent.ratio || msg.precedent.summary) && (
                                <div className="p-2 rounded-xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800 text-[11px] leading-relaxed">
                                  <strong className="text-slate-700 dark:text-slate-300">Ratio Decidendi:</strong>{' '}
                                  <span className="text-slate-600 dark:text-slate-300">{msg.precedent.ratio || msg.precedent.summary}</span>
                                </div>
                              )}

                              {msg.precedent.outcome && (
                                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                                  <Check size={11} /> Outcome: {msg.precedent.outcome}
                                </div>
                              )}
                            </div>
                          )}

                          {/* ── RENDER DOCUMENT ATTACHMENTS IF PRESENT ── */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2.5 pt-2 border-t border-white/20 dark:border-slate-700 space-y-1.5">
                              {msg.attachments.map((att, i) => (
                                <a
                                  key={i}
                                  href={att.url || `/uploads/${att.fileName}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-xl text-[11px] font-medium transition ${
                                    isSender
                                      ? 'bg-blue-700/80 hover:bg-blue-800 text-white'
                                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-900 dark:hover:bg-slate-950 text-slate-800 dark:text-slate-200'
                                  }`}
                                >
                                  <FileText size={14} className="shrink-0 text-amber-400" />
                                  <span className="truncate flex-1">{att.name || att.originalName || 'Document.pdf'}</span>
                                  <Download size={12} className="shrink-0" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Time and Read Ticks */}
                      <div className="flex items-center gap-1.5 mt-1 px-1">
                        <span className="text-[9px] text-slate-400">
                          {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        {isSender && (
                          <span className="text-blue-500">
                            {msg.read ? <CheckCheck size={12} /> : <Check size={12} />}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* ── Active Precedent Attachment Drawer Preview ── */}
            {selectedPrecedent && (
              <div className="px-4 py-2.5 bg-[#FAF9F5] dark:bg-[#1A2230] border-t border-[#B69B72]/40 flex items-center justify-between text-xs text-slate-800 dark:text-slate-100">
                <div className="flex items-center gap-2.5 truncate">
                  <Scale size={16} className="text-[#B69B72] shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-[#8A6F46] dark:text-[#D9C7A5] text-[10px] uppercase block">
                      Precedent Attached to Message
                    </span>
                    <span className="font-semibold truncate text-[11px]">
                      {selectedPrecedent.title} ({selectedPrecedent.citation})
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedPrecedent(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/50 cursor-pointer"
                  title="Remove Precedent"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* ── Active Document Attachment Drawer Preview ── */}
            {selectedAttachment && (
              <div className="px-4 py-2.5 bg-blue-50 dark:bg-blue-950/60 border-t border-blue-200/60 dark:border-blue-900 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={16} className="text-blue-600 shrink-0" />
                  <div className="truncate">
                    <span className="font-bold text-blue-600 dark:text-blue-400 text-[10px] uppercase block">
                      Case Document Ready to Send
                    </span>
                    <span className="font-semibold truncate text-[11px]">
                      {selectedAttachment.name || selectedAttachment.originalName}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedAttachment(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-blue-100 dark:hover:bg-blue-900 cursor-pointer"
                  title="Remove Attachment"
                >
                  <X size={15} />
                </button>
              </div>
            )}

            {/* ── Action Form & Composing Controls ── */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />

              {/* 1. Insert Precedent Button */}
              <button
                type="button"
                onClick={() => {
                  fetchPrecedents();
                  setShowPrecedentsModal(true);
                }}
                className="p-2.5 rounded-2xl bg-amber-500/10 hover:bg-amber-500/20 text-[#8A6F46] dark:text-[#D9C7A5] border border-[#B69B72]/30 transition shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Insert Legal Precedents & Judgments"
              >
                <Scale size={16} className="text-[#B69B72]" />
                <span className="hidden sm:inline">Precedents</span>
              </button>

              {/* 2. Insert Case Document Button */}
              <button
                type="button"
                onClick={() => {
                  fetchCaseDocuments();
                  setShowDocumentsModal(true);
                }}
                className="p-2.5 rounded-2xl bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition shrink-0 flex items-center gap-1.5 text-xs font-bold cursor-pointer"
                title="Insert Case Documents & Filings"
              >
                <FileText size={16} />
                <span className="hidden sm:inline">Documents</span>
              </button>

              {/* 3. Direct File Attachment Clip */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0 cursor-pointer"
                title="Upload File from Device"
              >
                {uploadingFile ? <RefreshCw size={18} className="animate-spin text-blue-500" /> : <Paperclip size={18} />}
              </button>

              {/* 4. Text Input */}
              <input
                ref={chatInputRef}
                type="text"
                placeholder="Type your message, query, or formal legal advice..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs outline-none text-slate-800 dark:text-white focus:border-[#B69B72] transition"
              />

              {/* 5. Send Message Button */}
              <button
                type="submit"
                disabled={sending || (!messageText.trim() && !selectedAttachment && !selectedPrecedent)}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#B69B72] to-[#9A7E55] hover:from-[#A88C64] hover:to-[#8C724D] disabled:opacity-50 text-white shadow-md shadow-[#B69B72]/20 transition shrink-0 flex items-center justify-center cursor-pointer"
                title="Send Message"
              >
                {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-inner">
              <MessageSquare size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              Select or Start a Legal Aid Conversation
            </h4>
            <p className="text-xs max-w-sm">
              Connect directly with your clients, assigned or panel advocates, court staff, or legal aid administration desk.
            </p>
            <button
              onClick={() => {
                fetchContacts();
                setShowNewChatModal(true);
              }}
              className="btn-primary text-xs py-2.5 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md shadow-blue-500/20 cursor-pointer"
            >
              <Plus size={14} /> Start New Conversation
            </button>
          </div>
        )}
      </div>

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 1: PRECEDENTS & CASE LAW LIBRARY ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {showPrecedentsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-2xl w-full shadow-2xl space-y-4 animate-fade-in max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-[#8A6F46] dark:text-[#D9C7A5] flex items-center justify-center font-bold">
                  <Scale size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Supreme Court Precedents Library</h4>
                  <p className="text-[10px] text-slate-400">Search and insert verified Indian case law citations into your chat</p>
                </div>
              </div>
              <button
                onClick={() => setShowPrecedentsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search and Category Filters */}
            <div className="space-y-2">
              <div className="relative">
                <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search precedents by case name, citation, bench, ratio..."
                  value={precedentSearch}
                  onChange={e => setPrecedentSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-[#B69B72] transition"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[10px]">
                {PRECEDENT_CATEGORIES.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setPrecedentCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg font-bold shrink-0 transition cursor-pointer ${
                      precedentCategory === cat
                        ? 'bg-[#B69B72] text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Precedents List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {loadingPrecedents ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <RefreshCw size={20} className="animate-spin mx-auto text-[#B69B72] mb-2" />
                  Loading case precedents…
                </div>
              ) : precedentsList.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <BookOpen size={24} className="mx-auto text-slate-400/50" />
                  <p>No matching legal precedents found.</p>
                  <p className="text-[10px]">Try searching by broader terms (e.g., 'bail', 'partition', 'mutation', 'maintenance').</p>
                </div>
              ) : (
                precedentsList.map(prec => (
                  <div
                    key={prec.id || prec.title}
                    className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800 hover:border-[#B69B72]/60 bg-slate-50/50 dark:bg-slate-900/40 transition space-y-2 text-left"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400">
                            {prec.year || 'SC Record'}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">
                            {prec.category || prec.specialization}
                          </span>
                        </div>
                        <h5 className="font-bold text-xs text-slate-900 dark:text-white mt-1">
                          {prec.title}
                        </h5>
                        <p className="text-[10px] font-mono text-[#8A6F46] dark:text-[#D9C7A5]">
                          {prec.citation}
                        </p>
                      </div>

                      {/* Insertion Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => handleInsertPrecedentIntoText(prec)}
                          className="px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-[10px] font-bold transition flex items-center gap-1 cursor-pointer"
                          title="Insert citation text into message draft"
                        >
                          <Copy size={11} /> Text
                        </button>
                        <button
                          onClick={() => handleAttachPrecedentCard(prec)}
                          className="px-2.5 py-1 rounded-xl bg-[#202A3B] hover:bg-[#2A374D] text-[#D9C7A5] text-[10px] font-bold transition flex items-center gap-1 shadow-xs cursor-pointer"
                          title="Attach structured precedent card"
                        >
                          <Scale size={11} /> Attach Card
                        </button>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-relaxed">
                      {prec.ratio || prec.summary}
                    </p>

                    {prec.bench && (
                      <p className="text-[10px] text-slate-400 italic">
                        Bench: {prec.bench}
                      </p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 2: CASE DOCUMENTS & FILINGS ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {showDocumentsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-xl w-full shadow-2xl space-y-4 animate-fade-in max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Folder size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Case Documents & Evidentiary Filings</h4>
                  <p className="text-[10px] text-slate-400">Select verified documents to attach or upload new files</p>
                </div>
              </div>
              <button
                onClick={() => setShowDocumentsModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Quick Upload Button */}
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <UploadCloud size={18} className="text-blue-500 shrink-0" />
                <span className="text-xs text-slate-600 dark:text-slate-300">
                  Upload petition, FIR copy, or legal evidence from device
                </span>
              </div>
              <input
                type="file"
                ref={modalFileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />
              <button
                type="button"
                onClick={() => modalFileInputRef.current?.click()}
                disabled={uploadingFile}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shrink-0 cursor-pointer"
              >
                {uploadingFile ? 'Uploading…' : 'Upload File'}
              </button>
            </div>

            {/* Case Documents List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loadingDocuments ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <RefreshCw size={18} className="animate-spin mx-auto text-blue-500 mb-2" />
                  Loading case documents…
                </div>
              ) : caseDocuments.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <FileText size={24} className="mx-auto text-slate-400/50" />
                  <p>No previous case filings found for this docket.</p>
                  <p className="text-[10px]">Use the button above to upload a new document directly.</p>
                </div>
              ) : (
                caseDocuments.map(doc => (
                  <div
                    key={doc._id}
                    className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 flex items-center justify-between gap-3 transition"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FileText size={16} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {doc.originalName || doc.filename}
                        </p>
                        <p className="text-[10px] text-slate-400 flex items-center gap-2">
                          <span>{doc.category || 'General Filing'}</span>
                          {doc.size && <span>• {(doc.size / 1024).toFixed(1)} KB</span>}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAttachCaseDocument(doc)}
                      className="px-3 py-1.5 rounded-xl bg-[#202A3B] hover:bg-[#2A374D] text-white text-xs font-bold shrink-0 transition cursor-pointer"
                    >
                      Attach
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════ */}
      {/* ── MODAL 3: START NEW CHAT (CLIENTS, ADVOCATE, STAFF, ADMIN) ── */}
      {/* ═════════════════════════════════════════════════════════════════ */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-lg w-full shadow-2xl space-y-4 animate-fade-in max-h-[85vh] flex flex-col">
            
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center font-bold">
                  <Users size={18} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">Start New Communication</h4>
                  <p className="text-[10px] text-slate-400">Message your clients, advocates, court staff, or administration</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Category Tabs: All, Advocates, Clients, Court Staff, Admin */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 p-1 rounded-2xl overflow-x-auto text-[11px]">
              {CONTACT_TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveContactTab(tab)}
                  className={`px-3 py-1.5 rounded-xl font-bold transition shrink-0 cursor-pointer ${
                    activeContactTab === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Contact Search Input */}
            <div className="relative">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search contact by name, role, specialization, case..."
                value={contactSearchQuery}
                onChange={e => setContactSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs outline-none text-slate-800 dark:text-white focus:border-blue-500 transition"
              />
            </div>

            {/* Contacts List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
              {loadingContacts ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <RefreshCw size={18} className="animate-spin mx-auto text-blue-500 mb-2" />
                  Loading authorized contacts…
                </div>
              ) : filteredContacts.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400 space-y-2">
                  <AlertCircle size={20} className="mx-auto text-amber-500" />
                  <p>No eligible contacts found in category '{activeContactTab}'.</p>
                  <p className="text-[10px]">Try switching to 'All' or clearing your search filter.</p>
                </div>
              ) : (
                filteredContacts.map(contact => (
                  <button
                    key={contact._id || contact.id}
                    onClick={() => handleSelectContact(contact)}
                    className="w-full text-left p-3 pt-3.5 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition cursor-pointer"
                  >
                    {/* Avatar */}
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                      contact.role === 'Admin' ? 'bg-purple-900 text-purple-200' :
                      contact.role === 'Lawyer' ? 'bg-[#202A3B] text-[#D9C7A5] border border-[#B69B72]/40' :
                      contact.role === 'CourtStaff' ? 'bg-amber-900 text-amber-200' :
                      'bg-blue-900 text-blue-200'
                    }`}>
                      {contact.name.charAt(0).toUpperCase()}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {contact.name}
                        </p>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${
                          contact.role === 'Admin' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300' :
                          contact.role === 'Lawyer' ? 'bg-[#B69B72]/20 text-[#8A6F46] dark:text-[#D9C7A5]' :
                          contact.role === 'CourtStaff' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300' :
                          'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300'
                        }`}>
                          {contact.role}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-[10px] text-slate-500 dark:text-slate-400">
                          {contact.relation}
                        </span>
                        {contact.specialization && (
                          <span className="text-[9px] text-[#8A6F46] dark:text-[#D9C7A5]">
                            • {contact.specialization}
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 truncate">{contact.email}</p>

                      {contact.caseTitle && (
                        <p className="text-[9px] text-blue-600 dark:text-blue-400 truncate font-mono mt-0.5">
                          Linked Case: {contact.caseTitle}
                        </p>
                      )}
                    </div>

                    <div className="text-blue-600 dark:text-blue-400 p-1.5 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-950/50">
                      <ChevronRight size={16} />
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default ChatCenter;
