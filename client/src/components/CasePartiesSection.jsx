import { ShieldCheck, UserCheck, Scale, Award, Lock, ExternalLink } from 'lucide-react';
import Card from './ui/card';

const CasePartiesSection = ({ representationData, onSelectProfile }) => {
  if (!representationData) return null;

  const { yourSide, opposingSide } = representationData;

  const applicant = yourSide?.parties[0] || { fullName: 'Applicant', partyType: 'APPLICANT' };
  const applicantLawyer = yourSide?.lawyers[0];

  const opponent = opposingSide?.parties[0] || { fullName: 'Opponent', partyType: 'OPPONENT' };
  const opponentLawyer = opposingSide?.lawyers[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-slate-100">Case Representation & Parties</h3>
          <p className="text-xs text-slate-400">Side-by-side counsel structure and litigation advocate assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YOUR SIDE CARD CONTAINER */}
        <Card className="bg-gradient-to-b from-blue-950/30 to-slate-900 border-blue-500/30 p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-blue-600/20 border-b border-l border-blue-500/30 text-blue-300 font-extrabold text-[11px] uppercase tracking-wider rounded-bl-xl">
            YOUR SIDE
          </div>

          {/* Applicant Info Block */}
          <div>
            <span className="text-xs font-bold text-blue-400 uppercase tracking-wider block mb-3">APPLICANT CLAIMANT</span>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="h-12 w-12 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                {applicant.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-100 truncate">{applicant.fullName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    {applicant.partyType || 'PLAINTIFF'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{applicant.relationshipToCase || 'Primary Applicant'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-blue-400 font-semibold uppercase tracking-wider">REPRESENTED BY COUNSEL</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Applicant Lawyer Block */}
          <div>
            <div className="p-4 rounded-xl bg-slate-800/90 border border-blue-500/30 hover:border-blue-400 transition-all">
              <div className="flex items-start gap-4">
                {applicantLawyer?.profileImage ? (
                  <img src={applicantLawyer.profileImage} alt="" className="h-14 w-14 rounded-xl object-cover border border-blue-400" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 font-bold">
                    <Scale className="w-7 h-7" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-100 truncate">
                      {applicantLawyer?.name || 'Advocate Allocation Pending'}
                    </h4>
                    {applicantLawyer && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-blue-300 font-medium mt-0.5">
                    {applicantLawyer?.specialization || 'General Trial Practice'}
                  </p>
                  
                  {applicantLawyer && (
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Award className="w-3.5 h-3.5" />
                        <span className="font-semibold">{applicantLawyer.experience} Yrs Exp</span>
                      </div>
                      <span>•</span>
                      <div className="text-slate-300">
                        Rating: <span className="font-bold text-white">{applicantLawyer.rating || 4.9} / 5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* OPPOSING SIDE CARD CONTAINER */}
        <Card className="bg-gradient-to-b from-red-950/30 to-slate-900 border-red-500/30 p-6 rounded-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-red-600/20 border-b border-l border-red-500/30 text-red-300 font-extrabold text-[11px] uppercase tracking-wider rounded-bl-xl">
            OPPOSING SIDE
          </div>

          {/* Opponent Info Block */}
          <div>
            <span className="text-xs font-bold text-red-400 uppercase tracking-wider block mb-3">OPPONENT DEFENDANT</span>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-800/80 border border-slate-700">
              <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center font-bold text-white text-lg shadow-lg">
                {opponent.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-slate-100 truncate">{opponent.fullName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                    {opponent.partyType || 'DEFENDANT'}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{opponent.organization || opponent.relationshipToCase || 'Opposing Party'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-800" />
            <span className="text-[11px] text-red-400 font-semibold uppercase tracking-wider">REPRESENTED BY OPPOSING COUNSEL</span>
            <div className="flex-1 h-px bg-slate-800" />
          </div>

          {/* Opponent Lawyer Block */}
          <div>
            <div className="p-4 rounded-xl bg-slate-800/90 border border-red-500/30 hover:border-red-400 transition-all">
              <div className="flex items-start gap-4">
                {opponentLawyer?.profileImage ? (
                  <img src={opponentLawyer.profileImage} alt="" className="h-14 w-14 rounded-xl object-cover border border-red-400" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-red-600/20 border border-red-500/40 flex items-center justify-center text-red-400 font-bold">
                    <Scale className="w-7 h-7" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-100 truncate">
                      {opponentLawyer?.name || 'Adv. Opposing Counsel'}
                    </h4>
                    {opponentLawyer && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> PUBLIC SCOPE
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-red-300 font-medium mt-0.5">
                    {opponentLawyer?.specialization || 'Litigation Counsel'}
                  </p>
                  
                  {opponentLawyer && (
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-300 pt-2 border-t border-slate-700/60">
                      <div className="flex items-center gap-1 text-amber-400">
                        <Award className="w-3.5 h-3.5" />
                        <span className="font-semibold">{opponentLawyer.experience} Yrs Exp</span>
                      </div>
                      <span>•</span>
                      <div className="text-slate-300">
                        Rating: <span className="font-bold text-white">{opponentLawyer.rating || 4.8} / 5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CasePartiesSection;
