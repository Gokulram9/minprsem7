import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UserCheck, Shield, Scale, ChevronRight, X, Phone, Mail, MapPin, Briefcase, Award, AlertTriangle, ExternalLink
} from 'lucide-react';
import Card from './ui/card';

const CaseRelationshipGraph = ({ representationData, onSelectProfile }) => {
  const [selectedNode, setSelectedNode] = useState(null);

  if (!representationData) {
    return (
      <div className="p-8 text-center text-slate-400">
        <p>Loading case relationship topology graph...</p>
      </div>
    );
  }

  const { yourSide, opposingSide, caseTitle, caseNumber, court, status } = representationData;

  const mainApplicant = yourSide?.parties[0] || { fullName: 'Applicant', partyType: 'APPLICANT' };
  const mainOpponent = opposingSide?.parties[0] || { fullName: 'Opponent', partyType: 'OPPONENT' };

  const applicantLawyer = yourSide?.lawyers[0];
  const opponentLawyer = opposingSide?.lawyers[0];

  const handleCardClick = (type, data) => {
    setSelectedNode({ type, data });
    if (onSelectProfile) onSelectProfile({ type, data });
  };

  return (
    <Card className="relative overflow-hidden bg-slate-900/80 border-slate-800 backdrop-blur-md p-6 rounded-2xl shadow-xl">
      {/* Background Graphic Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]" />

      {/* Graph Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-slate-800 pb-4 mb-6 gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">
              CASE TOPOLOGY GRAPH
            </span>
            <span className="text-xs text-slate-400 font-mono">{caseNumber}</span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">{caseTitle}</h3>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="text-slate-400">Presiding Court:</span>
          <span className="text-slate-200 font-medium">{court}</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            {status}
          </span>
        </div>
      </div>

      {/* Visual Relationship Graph */}
      <div className="relative flex flex-col items-center py-4">
        {/* Top Node: THE CASE */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="z-10 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg shadow-blue-500/20 flex items-center gap-2 text-sm border border-blue-400/30"
        >
          <Scale className="w-4 h-4 text-blue-200" />
          <span>DOCKET: {caseNumber}</span>
        </motion.div>

        {/* Animated Connecting SVG Lines */}
        <svg className="w-full h-24 my-1 overflow-visible pointer-events-none">
          <defs>
            <linearGradient id="blueLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="redLine" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ef4444" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0.3" />
            </linearGradient>
          </defs>
          {/* Main Stem */}
          <line x1="50%" y1="0" x2="50%" y2="30" stroke="#475569" strokeWidth="2" strokeDasharray="4 4" />
          
          {/* Horizontal Split */}
          <line x1="25%" y1="30" x2="75%" y2="30" stroke="#475569" strokeWidth="2" />

          {/* Left Branch to YOUR SIDE */}
          <line x1="25%" y1="30" x2="25%" y2="90" stroke="url(#blueLine)" strokeWidth="2.5" />

          {/* Right Branch to OPPOSING SIDE */}
          <line x1="75%" y1="30" x2="75%" y2="90" stroke="url(#redLine)" strokeWidth="2.5" />
        </svg>

        {/* Two Main Columns: YOUR SIDE vs OPPOSING SIDE */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full">
          {/* YOUR SIDE COLUMN */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-4 p-4 rounded-xl bg-blue-950/20 border border-blue-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-blue-400 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-blue-400">
                YOUR SIDE (APPLICANT)
              </span>
            </div>

            {/* Applicant Card */}
            <div
              onClick={() => handleCardClick('APPLICANT', mainApplicant)}
              className="w-full p-4 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-blue-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-blue-600/20 border border-blue-500/30 flex items-center justify-center font-bold text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  {mainApplicant.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-blue-300">
                      {mainApplicant.fullName}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 font-medium">
                      {mainApplicant.partyType || 'APPLICANT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {mainApplicant.relationshipToCase || 'Primary Legal Aid Claimant'}
                  </p>
                </div>
              </div>
            </div>

            {/* Connecting Vertical Arrow */}
            <div className="h-6 w-0.5 bg-blue-500/30 my-0.5" />

            {/* Applicant Lawyer Card */}
            <div
              onClick={() => handleCardClick('YOUR_LAWYER', applicantLawyer)}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-slate-800 to-blue-950/40 border border-blue-500/30 hover:border-blue-400 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg group"
            >
              <div className="flex items-center gap-3">
                {applicantLawyer?.profileImage ? (
                  <img src={applicantLawyer.profileImage} alt="" className="h-10 w-10 rounded-full object-cover border border-blue-400" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                    <Scale className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-blue-300">
                      {applicantLawyer?.name || 'Adv. Unassigned'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-blue-400/20 text-blue-300 border border-blue-400/30 font-semibold">
                      COUNSEL
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {applicantLawyer?.specialization || 'Assigned Defense Attorney'}
                  </p>
                  {applicantLawyer?.experience && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-blue-300">
                      <Award className="w-3 h-3 text-amber-400" />
                      <span>{applicantLawyer.experience} Yrs Experience</span>
                      <span>•</span>
                      <span>★ {applicantLawyer.rating || 4.9}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>

          {/* OPPOSING SIDE COLUMN */}
          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center gap-4 p-4 rounded-xl bg-red-950/20 border border-red-500/20"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="h-2 w-2 rounded-full bg-red-400 animate-ping" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-red-400">
                OPPOSING SIDE (DEFENDANT)
              </span>
            </div>

            {/* Opponent Card */}
            <div
              onClick={() => handleCardClick('OPPONENT', mainOpponent)}
              className="w-full p-4 rounded-xl bg-slate-800/90 border border-slate-700 hover:border-red-500/50 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-md group"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-red-600/20 border border-red-500/30 flex items-center justify-center font-bold text-red-400 group-hover:bg-red-600 group-hover:text-white transition-colors">
                  {mainOpponent.fullName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-red-300">
                      {mainOpponent.fullName}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-300 font-medium">
                      {mainOpponent.partyType || 'OPPONENT'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {mainOpponent.organization || mainOpponent.relationshipToCase || 'Opposing Party Entity'}
                  </p>
                </div>
              </div>
            </div>

            {/* Connecting Vertical Arrow */}
            <div className="h-6 w-0.5 bg-red-500/30 my-0.5" />

            {/* Opponent Lawyer Card */}
            <div
              onClick={() => handleCardClick('OPPONENT_LAWYER', opponentLawyer)}
              className="w-full p-4 rounded-xl bg-gradient-to-br from-slate-800 to-red-950/40 border border-red-500/30 hover:border-red-400 cursor-pointer transition-all duration-300 hover:scale-[1.02] shadow-lg group"
            >
              <div className="flex items-center gap-3">
                {opponentLawyer?.profileImage ? (
                  <img src={opponentLawyer.profileImage} alt="" className="h-10 w-10 rounded-full object-cover border border-red-400" />
                ) : (
                  <div className="h-10 w-10 rounded-full bg-red-500/20 border border-red-400 flex items-center justify-center text-red-400 font-bold">
                    <Scale className="w-5 h-5" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-semibold text-slate-100 truncate group-hover:text-red-300">
                      {opponentLawyer?.name || 'Adv. Opposing Counsel'}
                    </h4>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-red-400/20 text-red-300 border border-red-400/30 font-semibold">
                      OPP COUNSEL
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 truncate mt-0.5">
                    {opponentLawyer?.specialization || 'Opposing Trial Advocate'}
                  </p>
                  {opponentLawyer?.barRegistrationNumber && (
                    <div className="flex items-center gap-2 mt-1.5 text-[11px] text-red-300">
                      <Shield className="w-3 h-3 text-red-400" />
                      <span>{opponentLawyer.barRegistrationNumber}</span>
                      <span>•</span>
                      <span>Verified Advocate</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Interactive Node Profile Modal */}
      <AnimatePresence>
        {selectedNode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md"
            onClick={() => setSelectedNode(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-2xl text-slate-100 relative"
            >
              <button
                onClick={() => setSelectedNode(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-4">
                <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${
                  selectedNode.type.includes('OPP') ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                }`}>
                  {selectedNode.data?.fullName?.charAt(0) || selectedNode.data?.name?.charAt(0) || 'P'}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-100">
                    {selectedNode.data?.fullName || selectedNode.data?.name || 'Party Information'}
                  </h3>
                  <span className="text-xs px-2 py-0.5 rounded font-medium bg-slate-800 text-slate-300">
                    {selectedNode.type}
                  </span>
                </div>
              </div>

              {/* Sanitized Detail Fields */}
              <div className="space-y-3 text-xs">
                {selectedNode.data?.organization && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Briefcase className="w-4 h-4 text-slate-400" />
                    <span>Organization: {selectedNode.data.organization}</span>
                  </div>
                )}
                {selectedNode.data?.specialization && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Scale className="w-4 h-4 text-blue-400" />
                    <span>Specialization: {selectedNode.data.specialization}</span>
                  </div>
                )}
                {selectedNode.data?.barRegistrationNumber && (
                  <div className="flex items-center gap-2 text-slate-300">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    <span>Bar License: {selectedNode.data.barRegistrationNumber}</span>
                  </div>
                )}

                {/* Privacy Protected Notice for Opponents */}
                {selectedNode.type.includes('OPP') ? (
                  <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] flex items-start gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Privacy Policy Enforced:</span> Private contact phone, email, and personal address are restricted to court staff and verified legal council.
                    </div>
                  </div>
                ) : (
                  <div className="mt-4 p-3 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] flex items-start gap-2">
                    <UserCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Verified Counsel:</span> Full case docket representation authorized.
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
};

export default CaseRelationshipGraph;
