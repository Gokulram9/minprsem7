import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Calendar, Clock, FileText, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, ChevronRight, UserCheck, MessageSquare
} from 'lucide-react';
import axios from '../api/axios';
import { AuthContext } from '../contexts/AuthContext';
import Card from '../components/ui/card';
import CaseRelationshipGraph from '../components/CaseRelationshipGraph';
import CasePartiesSection from '../components/CasePartiesSection';

const CaseDetailsPage = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [representation, setRepresentation] = useState(null);
  const [caseDetails, setCaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        setLoading(true);

        // Fetch case representation
        const repRes = await axios.get(`/cases/${caseId}/representation`);
        setRepresentation(repRes.data.data);

        // Fetch application full document details
        const appRes = await axios.get(`/applications/${caseId}`);
        setCaseDetails(appRes.data);
      } catch (err) {
        console.error('Case Details Load Error:', err);
        setError('Failed to fetch case docket records.');
      } finally {
        setLoading(false);
      }
    };

    if (caseId) fetchDetails();
  }, [caseId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-slate-400">Retrieving case representation structure...</p>
        </div>
      </div>
    );
  }

  if (error || !representation) {
    return (
      <div className="p-8 text-center max-w-md mx-auto">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-100 mb-1">Case Docket Unavailable</h3>
        <p className="text-xs text-slate-400 mb-4">{error || 'Case records could not be retrieved.'}</p>
        <button
          onClick={() => navigate(-1)}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
        >
          Return to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Top Navigation Back Action */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Dashboard
        </button>
        <span className="text-xs text-slate-400 font-mono">DOCKET ACCESS ROLE: {user?.role || 'User'}</span>
      </div>

      {/* TOP SUMMARY HEADER BLOCK */}
      <Card className="bg-slate-900/90 border-slate-800 p-6 rounded-2xl shadow-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-slate-800 pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-600/20 text-blue-400 border border-blue-500/30">
                {representation.caseType}
              </span>
              <span className="text-xs font-mono text-slate-400">{representation.caseNumber}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-100">{representation.caseTitle}</h1>
            <p className="text-xs text-slate-400 mt-1">Presiding Forum: <span className="text-slate-200 font-semibold">{representation.court}</span></p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">STATUS</span>
              <span className="text-xs font-bold text-emerald-400">{representation.status}</span>
            </div>

            <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-center min-w-[140px]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">NEXT HEARING</span>
              <span className="text-xs font-bold text-blue-400">{representation.nextHearing}</span>
            </div>

            {representation.yourSide?.lawyers?.length > 0 && (
              <button
                onClick={async () => {
                  const txt = prompt(`Send direct message to ${representation.yourSide.lawyers[0].name}:`);
                  if (txt && txt.trim()) {
                    try {
                      await axios.post('/messages', {
                        receiver: representation.yourSide.lawyers[0].id,
                        application: representation.caseId,
                        text: txt
                      });
                      alert(`Message dispatched to ${representation.yourSide.lawyers[0].name}!`);
                    } catch (e) {
                      alert('Could not dispatch message.');
                    }
                  }
                }}
                className="px-4 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message Advocate
              </button>
            )}
          </div>
        </div>
      </Card>

      {/* CASE RELATIONSHIP GRAPH */}
      <CaseRelationshipGraph representationData={representation} />

      {/* CASE PARTIES SIDE-BY-SIDE SECTION */}
      <CasePartiesSection representationData={representation} />

      {/* CASE TIMELINE & CALENDAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Column */}
        <Card className="lg:col-span-2 bg-slate-900/80 border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-400" /> Case Timeline & Audit History
          </h3>

          <div className="space-y-4 pt-2">
            {(caseDetails?.timeline || [
              { status: 'Submitted', date: new Date(), note: 'Legal aid application submitted' },
              { status: 'LawyerAssigned', date: new Date(), note: 'Advocate allocated to case' },
              { status: 'CourtScheduled', date: new Date(), note: 'Hearing scheduled with Court Registrar' }
            ]).map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start relative">
                {idx < (caseDetails?.timeline?.length || 3) - 1 && (
                  <div className="absolute top-6 left-3.5 bottom-0 w-0.5 bg-slate-800" />
                )}
                <div className="h-7 w-7 rounded-full bg-blue-500/20 border border-blue-400 text-blue-400 flex items-center justify-center shrink-0 text-xs font-bold z-10">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 bg-slate-800/60 p-3 rounded-xl border border-slate-700/60">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-bold text-slate-200">{item.status}</span>
                    <span className="text-[10px] text-slate-400">{new Date(item.date).toLocaleDateString()}</span>
                  </div>
                  <p className="text-xs text-slate-300">{item.note}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Authorized Documents Side Card */}
        <Card className="bg-slate-900/80 border-slate-800 p-6 rounded-2xl space-y-4">
          <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <FileText className="w-4 h-4 text-emerald-400" /> Authorized Documents
          </h3>
          <p className="text-xs text-slate-400">Access role-restricted case documentation.</p>

          <div className="space-y-2 pt-2">
            {['Application_Filing_Claim.pdf', 'Court_Notice_Summons.pdf', 'Lawyer_Representation_Notice.pdf'].map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 text-xs text-slate-200 hover:border-slate-500 transition-colors cursor-pointer">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-blue-400 shrink-0" />
                  <span className="truncate">{doc}</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium">VIEW</span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
