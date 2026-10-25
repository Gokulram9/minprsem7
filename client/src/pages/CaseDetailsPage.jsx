import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Scale, Calendar, Clock, FileText, CheckCircle2, AlertCircle, ArrowLeft, ShieldCheck, ChevronRight, UserCheck, MessageSquare, Gavel, MapPin, Building, ArrowRight, History
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

  const courtTier = caseDetails?.courtDetails?.courtTier || representation?.courtTier || 'District Court';
  const courtName = caseDetails?.courtDetails?.courtName || representation?.court || 'District Court, Coimbatore';
  const district = caseDetails?.courtDetails?.district || caseDetails?.applicant?.district || 'Coimbatore';
  const state = caseDetails?.courtDetails?.state || caseDetails?.applicant?.state || 'Tamil Nadu';
  const presidingJudgeName = caseDetails?.assignedJudge?.name || representation?.presidingJudge?.name;
  const judgeHistory = caseDetails?.judgeHistory || [];
  const transferHistory = caseDetails?.transferHistory || [];
  const courtChangeReq = caseDetails?.courtChangeRequest;

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
      <Card className="bg-[#202A3B] border border-[#B69B72]/25 p-6 rounded-2xl shadow-xl text-white">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#B69B72]/20 text-[#D9C7A5] border border-[#B69B72]/30">
                {representation.caseType}
              </span>
              <span className="text-xs font-mono text-slate-300">{representation.caseNumber}</span>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-[#EDE9FE]/20 text-[#EDE9FE] border border-[#EDE9FE]/30 flex items-center gap-1">
                <Building size={12} /> {courtTier}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-white">{representation.caseTitle}</h1>
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 mt-2">
              <p className="flex items-center gap-1.5">
                <Building size={13} className="text-[#D9C7A5]" />
                <span>Presiding Forum: <strong className="text-white">{courtName}</strong></span>
              </p>
              <p className="flex items-center gap-1.5">
                <MapPin size={13} className="text-slate-300" />
                <span>Jurisdiction: <strong className="text-white">{district}, {state}</strong></span>
              </p>
              {presidingJudgeName && (
                <p className="flex items-center gap-1.5">
                  <Gavel size={13} className="text-[#B69B72]" />
                  <span>Presiding Bench: <strong className="text-[#D9C7A5]">Hon. Justice {presidingJudgeName}</strong></span>
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[120px]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">STATUS</span>
              <span className="text-xs font-bold text-emerald-400">{representation.status}</span>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/10 text-center min-w-[140px]">
              <span className="text-[10px] text-slate-400 font-semibold block uppercase">NEXT HEARING</span>
              <span className="text-xs font-bold text-[#D9C7A5]">{representation.nextHearing}</span>
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
                className="px-4 py-3 rounded-xl bg-gradient-to-r from-[#B69B72] to-[#9A7E55] hover:from-[#A88C64] hover:to-[#8C724D] text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-[#B69B72]/20 transition-all cursor-pointer"
              >
                <MessageSquare className="w-4 h-4" /> Message Advocate
              </button>
            )}
          </div>
        </div>

        {/* Pending Court Elevation Banner */}
        {courtChangeReq && courtChangeReq.status === 'Pending' && (
          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-start gap-3 text-xs text-amber-200">
            <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-amber-300">
                Court Elevation Request Under Review: {courtChangeReq.requestedTier} ({courtChangeReq.requestedCourt})
              </p>
              <p className="text-[11px] text-amber-200/80">
                Grounds submitted: "{courtChangeReq.reason}". Administrative Court Registrar review is in progress. The current court tier will remain active until approved.
              </p>
            </div>
          </div>
        )}
      </Card>

      {/* CASE RELATIONSHIP GRAPH */}
      <CaseRelationshipGraph representationData={representation} />

      {/* CASE PARTIES SIDE-BY-SIDE SECTION */}
      <CasePartiesSection representationData={representation} />

      {/* JUDICIAL BENCH & COURT TRANSFER AUDIT HISTORY */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Judicial Bench Assignment History */}
        <Card className="bg-white dark:bg-[#1B2332] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#202A3B] dark:text-white flex items-center gap-2">
              <Gavel className="w-4 h-4 text-[#B69B72]" /> Presiding Judicial Officer History
            </h3>
            <span className="text-[11px] font-mono text-[#B69B72] dark:text-[#D9C7A5]">
              {judgeHistory.length} Assignment Record(s)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Chronological audit trail of judicial appointments, bench rotations, and reassignment justifications.
          </p>

          <div className="space-y-3 pt-1">
            {judgeHistory.length > 0 ? (
              judgeHistory.map((h, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-[#202A3B] dark:text-[#D9C7A5] text-sm">
                        Hon. Justice {h.judgeName || 'Designated Judge'}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {h.designation || 'Presiding Judicial Officer'} · {h.courtroom || 'Courtroom Hall 1'}
                      </p>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(h.assignedAt || h.date).toLocaleDateString()}
                    </span>
                  </div>
                  {h.reason && (
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300 italic">
                      <strong className="text-slate-500 not-italic">Reassignment Reason:</strong> {h.reason}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/30 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                {presidingJudgeName ? `Presided by Hon. Justice ${presidingJudgeName} under initial bench roster.` : 'No previous bench reassignments recorded for this docket.'}
              </div>
            )}
          </div>
        </Card>

        {/* Court Transfer & Jurisdictional History */}
        <Card className="bg-white dark:bg-[#1B2332] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-[#202A3B] dark:text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-[#B69B72]" /> Court Transfer & Elevation History
            </h3>
            <span className="text-[11px] font-mono text-[#B69B72] dark:text-[#D9C7A5]">
              {transferHistory.length} Transfer(s)
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Official jurisdictional records of case transfers between District, High, and Supreme Courts.
          </p>

          <div className="space-y-3 pt-1">
            {transferHistory.length > 0 ? (
              transferHistory.map((t, i) => (
                <div key={i} className="p-3.5 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
                  <div className="flex items-center justify-between font-semibold text-[#202A3B] dark:text-slate-200">
                    <div className="flex items-center gap-2">
                      <span className="text-slate-500 dark:text-slate-400">{t.fromTier || 'District Court'}</span>
                      <ArrowRight size={14} className="text-[#B69B72]" />
                      <span className="text-[#B69B72] dark:text-[#D9C7A5] font-bold">{t.toTier || 'High Court'}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {new Date(t.date || t.reviewedAt || Date.now()).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Target Forum: <strong className="text-[#202A3B] dark:text-slate-200">{t.toCourt}</strong>
                  </p>
                  {t.reason && (
                    <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                      Grounds: {t.reason}
                    </p>
                  )}
                  {t.reviewRemarks && (
                    <p className="text-[10px] text-emerald-600 dark:text-emerald-400">
                      Administrative Decision: {t.reviewRemarks}
                    </p>
                  )}
                </div>
              ))
            ) : (
              <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/30 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-500 dark:text-slate-400">
                Operating within primary trial jurisdiction: {courtName} ({courtTier}). No external transfers registered.
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* CASE TIMELINE & CALENDAR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline Column */}
        <Card className="lg:col-span-2 bg-white dark:bg-[#1B2332] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#202A3B] dark:text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#B69B72]" /> Complete Chronological Case Timeline
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Immutable log of all docket milestones, party filings, judicial assignments, and hearing outcomes.
          </p>

          <div className="space-y-4 pt-2">
            {(caseDetails?.timeline || [
              { status: 'Submitted', date: new Date(), note: 'Legal aid application submitted' },
              { status: 'LawyerAssigned', date: new Date(), note: 'Advocate allocated to case' },
              { status: 'CourtScheduled', date: new Date(), note: 'Hearing scheduled with Court Registrar' }
            ]).map((item, idx) => (
              <div key={idx} className="flex gap-4 items-start relative">
                {idx < (caseDetails?.timeline?.length || 3) - 1 && (
                  <div className="absolute top-6 left-3.5 bottom-0 w-0.5 bg-slate-200 dark:bg-slate-700" />
                )}
                <div className="h-7 w-7 rounded-full bg-[#B69B72]/15 border border-[#B69B72] text-[#B69B72] flex items-center justify-center shrink-0 text-xs font-bold z-10">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0 bg-[#FAF9F5] dark:bg-[#202A3B]/50 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700/60 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-[#202A3B] dark:text-slate-200">{item.status || item.eventType}</span>
                    <span className="text-[10px] text-slate-400">
                      {new Date(item.date).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{item.note}</p>
                  {(item.actorRole || item.actorName) && (
                    <p className="text-[10px] text-slate-400">
                      Action by: <strong className="text-[#202A3B] dark:text-slate-300">{item.actorName || item.actorRole}</strong> ({item.actorRole || 'Official'})
                    </p>
                  )}
                  {item.previousValue && item.updatedValue && (
                    <p className="text-[10px] text-[#B69B72] dark:text-[#D9C7A5] font-mono">
                      Transition: {item.previousValue} → {item.updatedValue}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Authorized Documents Side Card */}
        <Card className="bg-white dark:bg-[#1B2332] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl space-y-4 shadow-sm">
          <h3 className="text-base font-bold text-[#202A3B] dark:text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#B69B72]" /> Authorized Case Documents
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Role-authenticated legal records and filings.</p>

          <div className="space-y-2 pt-2">
            {(caseDetails?.documents && caseDetails.documents.length > 0
              ? caseDetails.documents
              : [
                  { originalName: 'Application_Filing_Claim.pdf', category: 'Petition' },
                  { originalName: 'Court_Notice_Summons.pdf', category: 'Notice' },
                  { originalName: 'Lawyer_Representation_Notice.pdf', category: 'Appearance' }
                ]
            ).map((doc, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/60 text-xs text-[#202A3B] dark:text-slate-200 hover:border-[#B69B72] transition-colors">
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 text-[#B69B72] shrink-0" />
                  <div className="truncate">
                    <span className="truncate block font-medium">{doc.originalName}</span>
                    <span className="text-[10px] text-slate-400">{doc.category || 'Court Document'}</span>
                  </div>
                </div>
                <button
                  onClick={() => alert(`Opening secure document: ${doc.originalName}`)}
                  className="btn-gold text-[10px] px-2.5 py-1 rounded-lg text-white font-bold shrink-0 shadow-xs"
                >
                  VIEW
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CaseDetailsPage;
