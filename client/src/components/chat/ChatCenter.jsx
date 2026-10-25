import { useState, useEffect, useRef, useContext } from 'react';
import axios from '../../api/axios';
import { AuthContext } from '../../contexts/AuthContext';
import { getSocket, joinConversationRoom, leaveConversationRoom } from '../../services/socket';
import {
  MessageSquare, Send, Paperclip, Search, Plus, User,
  FileText, Check, CheckCheck, Clock, Shield, Scale,
  ExternalLink, Download, X, AlertCircle, RefreshCw
} from 'lucide-react';

const ChatCenter = ({ initialConversationId = null, targetUserId = null, caseId = null }) => {
  const { user } = useContext(AuthContext);
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

  // File upload state
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Fetch conversations
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

  // Fetch messages for active conversation
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

  // Fetch available contacts for "New Chat" modal
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

  // Initial load
  useEffect(() => {
    fetchConversations(initialConversationId);
  }, [initialConversationId]);

  // Handle target user or case parameter passed directly
  useEffect(() => {
    if (targetUserId && conversations.length > 0) {
      const existing = conversations.find(c =>
        c.participants?.some(p => (p._id || p) === targetUserId)
      );
      if (existing) {
        setActiveConversation(existing);
      }
    }
  }, [targetUserId, conversations]);

  // When active conversation changes, join room and load messages
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
      // Check if message belongs to current active conversation
      const incomingConvId = incomingMsg.conversationId || incomingMsg.conversation;
      if (activeConversation && activeConversation._id === incomingConvId) {
        setMessages(prev => {
          if (prev.some(m => m._id === incomingMsg._id)) return prev;
          return [...prev, incomingMsg];
        });
        // Auto mark read if we are looking at this conversation
        if (incomingMsg.sender?._id !== user?._id && incomingMsg.sender !== user?._id) {
          axios.patch(`/messages/${incomingConvId}/read`).catch(() => {});
        }
      }

      // Update conversations list (latest message preview and timestamp)
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
                lastMessage: incomingMsg.text || (incomingMsg.attachments?.length ? 'Shared a document' : 'New message'),
                lastMessageAt: incomingMsg.createdAt || new Date().toISOString(),
                unreadCounts: updatedCounts
              };
            }
            return c;
          }).sort((a, b) => new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0));
        } else {
          // New conversation created externally, refetch
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

  // Start or open conversation with a selected contact
  const handleSelectContact = async (contact) => {
    try {
      const res = await axios.post('/messages/conversations', {
        recipientId: contact._id,
        conversationType: contact.suggestedType || 'Direct'
      });
      if (res.data?.success && res.data.data) {
        const conv = res.data.data;
        setShowNewChatModal(false);
        // Refresh conversations and set active
        await fetchConversations(conv._id);
        setActiveConversation(conv);
      }
    } catch (err) {
      alert(`Could not start conversation: ${err.response?.data?.message || err.message}`);
    }
  };

  // Upload attachment
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
      if (res.data?.success && res.data.data) {
        setSelectedAttachment(res.data.data);
      }
    } catch (err) {
      alert(`Attachment failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploadingFile(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Send message
  const handleSendMessage = async (e) => {
    e?.preventDefault();
    if (!messageText.trim() && !selectedAttachment) return;
    if (!activeConversation) return;

    const otherParticipant = activeConversation.participants?.find(
      p => (p._id || p) !== user?._id
    );

    const payload = {
      conversationId: activeConversation._id,
      receiverId: otherParticipant ? (otherParticipant._id || otherParticipant) : null,
      message: messageText.trim(),
      caseId: activeConversation.caseId?._id || activeConversation.caseId || null,
      attachments: selectedAttachment ? [selectedAttachment] : []
    };

    setSending(true);
    try {
      const res = await axios.post('/messages', payload);
      if (res.data?.success && res.data.data) {
        const savedMsg = res.data.data;
        // Add to local state if not already there
        setMessages(prev => {
          if (prev.some(m => m._id === savedMsg._id)) return prev;
          return [...prev, savedMsg];
        });
        setMessageText('');
        setSelectedAttachment(null);
      }
    } catch (err) {
      alert(`Message delivery failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setSending(false);
    }
  };

  // Get recipient display info for a conversation
  const getRecipientInfo = (conv) => {
    if (!conv) return { name: 'Chat', role: '', email: '', id: null };
    const other = conv.participants?.find(p => (p._id || p) !== user?._id);
    if (!other || typeof other !== 'object') {
      return { name: 'Support / Registry', role: 'Official', email: '', id: null };
    }
    return {
      name: other.name || 'User',
      role: other.role || 'Member',
      email: other.email || '',
      id: other._id
    };
  };

  const currentRecipient = getRecipientInfo(activeConversation);
  const activeCase = activeConversation?.caseId;

  // Filter conversations
  const filteredConversations = conversations.filter(c => {
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

  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col md:flex-row h-[680px]">
      
      {/* ── LEFT PANE: CONVERSATION LIST ── */}
      <div className="w-full md:w-80 lg:w-96 border-r border-slate-200/80 dark:border-slate-800 flex flex-col bg-slate-50/70 dark:bg-[#0B111E] shrink-0">
        
        {/* Header & Controls */}
        <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <MessageSquare size={16} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Communications</h3>
                <p className="text-[10px] text-slate-400">Interconnected Portal Messenger</p>
              </div>
            </div>

            <button
              onClick={() => {
                fetchContacts();
                setShowNewChatModal(true);
              }}
              className="p-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition flex items-center gap-1 text-xs font-bold"
              title="Start New Conversation"
            >
              <Plus size={14} /> New
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
              <p>Loading active conversations…</p>
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400 space-y-3">
              <MessageSquare size={28} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p className="font-semibold text-slate-600 dark:text-slate-300">No conversations found</p>
              <p className="text-[11px]">Click "+ New" to initiate role-authorized legal aid communication.</p>
            </div>
          ) : (
            filteredConversations.map(conv => {
              const info = getRecipientInfo(conv);
              const isActive = activeConversation?._id === conv._id;
              const unread = conv.unreadCounts && user?._id ? (conv.unreadCounts[user._id] || 0) : 0;
              const isCaseGroup = conv.conversationType === 'CaseGroup';

              return (
                <button
                  key={conv._id}
                  onClick={() => setActiveConversation(conv)}
                  className={`w-full text-left p-3 rounded-2xl flex items-start gap-3 transition ${
                    isActive
                      ? 'bg-[#FAF9F5] dark:bg-[#1A2230] border border-[#B69B72]/60 shadow-xs'
                      : 'hover:bg-white dark:hover:bg-slate-900/80'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shrink-0 shadow-inner ${
                    info.role === 'Admin' ? 'bg-[#202A3B] text-[#B69B72] border border-[#B69B72]/30' :
                    info.role === 'Lawyer' ? 'bg-[#202A3B] text-[#D9C7A5] border border-[#D9C7A5]/30' :
                    info.role === 'CourtStaff' ? 'bg-[#202A3B] text-[#B69B72]' :
                    'bg-[#202A3B] text-white'
                  }`}>
                    {info.name.charAt(0).toUpperCase()}
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
                        info.role === 'Admin' ? 'bg-[#202A3B]/10 dark:bg-[#B69B72]/20 text-[#202A3B] dark:text-[#D9C7A5]' :
                        info.role === 'Lawyer' ? 'bg-[#B69B72]/15 text-[#8A6F46] dark:text-[#D9C7A5]' :
                        info.role === 'CourtStaff' ? 'bg-[#202A3B]/10 text-[#202A3B] dark:text-[#D9C7A5]' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
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
                      {conv.lastMessage || 'No messages yet'}
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

      {/* ── RIGHT PANE: ACTIVE CHAT WINDOW ── */}
      <div className="flex-1 flex flex-col bg-white dark:bg-[#111827]">
        {activeConversation ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm text-white shadow-sm ${
                  currentRecipient.role === 'Admin' ? 'bg-purple-600' :
                  currentRecipient.role === 'Lawyer' ? 'bg-sky-600' :
                  currentRecipient.role === 'CourtStaff' ? 'bg-amber-600' :
                  'bg-blue-600'
                }`}>
                  {currentRecipient.name.charAt(0).toUpperCase()}
                </div>

                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                      {currentRecipient.name}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                      {currentRecipient.role}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>{currentRecipient.email}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Verified Participant
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
                      {activeCase.courtroom ? ` • ${activeCase.courtroom}` : ''}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Case & Opponent Info Drawer if available */}
            {activeCase?.opponentDetails?.name && (
              <div className="px-4 py-2 bg-slate-100/70 dark:bg-slate-900/60 border-b border-slate-200/60 dark:border-slate-800 text-[11px] flex items-center justify-between text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-4 flex-wrap">
                  <span><strong>Opponent Party:</strong> {activeCase.opponentDetails.name}</span>
                  {activeCase.opponentDetails.lawyerName && (
                    <span><strong>Opposing Counsel:</strong> {activeCase.opponentDetails.lawyerName}</span>
                  )}
                  {activeCase.assignedJudge && (
                    <span><strong>Presiding Bench:</strong> {typeof activeCase.assignedJudge === 'object' ? activeCase.assignedJudge.name : 'Presiding Judge'}</span>
                  )}
                </div>
                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-bold">
                  Protected Bilateral Channel
                </span>
              </div>
            )}

            {/* Message Thread */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/30 dark:bg-[#0E1524]">
              {loadingMessages ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  <RefreshCw size={20} className="animate-spin text-blue-500 mr-2" /> Loading case communication…
                </div>
              ) : messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
                  <MessageSquare size={32} className="text-slate-300 dark:text-slate-700" />
                  <p className="text-xs font-semibold text-slate-600 dark:text-slate-300">Channel initialized</p>
                  <p className="text-[11px] max-w-sm">
                    No previous messages. All communications on this portal are end-to-end authenticated, stored permanently in MongoDB, and delivered in real-time.
                  </p>
                </div>
              ) : (
                messages.map(msg => {
                  const isSender = (msg.sender?._id || msg.sender) === user?._id;
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

                  return (
                    <div
                      key={msg._id}
                      className={`flex flex-col ${isSender ? 'items-end' : 'items-start'}`}
                    >
                      <div className="flex items-end gap-1.5 max-w-[78%]">
                        {!isSender && (
                          <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-200 text-[10px] font-bold flex items-center justify-center shrink-0 mb-1">
                            {(msg.sender?.name || currentRecipient.name || 'U').charAt(0).toUpperCase()}
                          </div>
                        )}

                        <div className={`p-3.5 rounded-3xl text-xs leading-relaxed shadow-xs ${
                          isSender
                            ? 'bg-[#202A3B] text-white border border-[#B69B72]/20 rounded-br-none'
                            : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-700/80 rounded-bl-none'
                        }`}>
                          <p className="whitespace-pre-wrap">{msg.text || msg.message}</p>

                          {/* Render Attachments if present */}
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
                                  <FileText size={14} className="shrink-0" />
                                  <span className="truncate flex-1">{att.name || att.originalName || 'Document.pdf'}</span>
                                  <Download size={12} className="shrink-0" />
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

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

            {/* Selected Attachment Preview */}
            {selectedAttachment && (
              <div className="px-4 py-2 bg-blue-50 dark:bg-blue-950/60 border-t border-blue-200/60 dark:border-blue-900 flex items-center justify-between text-xs text-blue-900 dark:text-blue-200">
                <div className="flex items-center gap-2 truncate">
                  <FileText size={14} className="text-blue-600 shrink-0" />
                  <span className="font-semibold truncate">Ready to send: {selectedAttachment.name || selectedAttachment.originalName}</span>
                </div>
                <button
                  onClick={() => setSelectedAttachment(null)}
                  className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
              />

              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
                className="p-2.5 rounded-2xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition shrink-0"
                title="Attach Document / Legal Evidence"
              >
                {uploadingFile ? <RefreshCw size={18} className="animate-spin text-blue-500" /> : <Paperclip size={18} />}
              </button>

              <input
                type="text"
                placeholder="Type your message, case inquiry, or formal response..."
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl px-4 py-2.5 text-xs outline-none text-slate-800 dark:text-white focus:border-[#B69B72] transition"
              />

              <button
                type="submit"
                disabled={sending || (!messageText.trim() && !selectedAttachment)}
                className="p-2.5 rounded-2xl bg-gradient-to-r from-[#B69B72] to-[#9A7E55] hover:from-[#A88C64] hover:to-[#8C724D] disabled:opacity-50 text-white shadow-md shadow-[#B69B72]/20 transition shrink-0 flex items-center justify-center cursor-pointer"
              >
                {sending ? <RefreshCw size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </form>
          </>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-3">
            <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <MessageSquare size={32} />
            </div>
            <h4 className="text-base font-bold text-slate-800 dark:text-white">
              Select or Start a Legal Conversation
            </h4>
            <p className="text-xs max-w-sm">
              All messages are routed securely through role-based permissions between Applicants, Counsel, Court Staff, and Chamber Administration.
            </p>
            <button
              onClick={() => {
                fetchContacts();
                setShowNewChatModal(true);
              }}
              className="btn-primary text-xs py-2.5 px-5 rounded-2xl font-bold flex items-center gap-2 shadow-md shadow-blue-500/20"
            >
              <Plus size={14} /> Start New Conversation
            </button>
          </div>
        )}
      </div>

      {/* ── MODAL: START NEW CONVERSATION WITH AUTHORIZED CONTACT ── */}
      {showNewChatModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1E293B] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 max-w-md w-full shadow-2xl space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600/10 text-blue-600 flex items-center justify-center">
                  <User size={16} />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">New Communication</h4>
                  <p className="text-[10px] text-slate-400">Select an authorized legal aid contact</p>
                </div>
              </div>
              <button
                onClick={() => setShowNewChatModal(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-80 overflow-y-auto space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
              {loadingContacts ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  <RefreshCw size={16} className="animate-spin mx-auto text-blue-500 mb-2" />
                  Loading authorized contacts…
                </div>
              ) : availableContacts.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400 space-y-2">
                  <AlertCircle size={20} className="mx-auto text-amber-500" />
                  <p>No eligible contacts found for your role.</p>
                </div>
              ) : (
                availableContacts.map(contact => (
                  <button
                    key={contact._id}
                    onClick={() => handleSelectContact(contact)}
                    className="w-full text-left p-3 pt-3.5 rounded-2xl flex items-center gap-3 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition"
                  >
                    <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {contact.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                          {contact.name}
                        </p>
                        <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {contact.role}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate">{contact.email}</p>
                      {contact.caseDetails && (
                        <p className="text-[9px] text-blue-600 dark:text-blue-400 truncate font-mono mt-0.5">
                          Case: {contact.caseDetails.caseTitle || contact.caseDetails.caseNumber}
                        </p>
                      )}
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
