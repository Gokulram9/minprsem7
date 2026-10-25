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
          <h3 className="text-lg font-bold text-[#202A3B] dark:text-white" style={{ fontFamily: 'var(--font-display)' }}>Case Representation & Parties</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Side-by-side counsel structure and litigation advocate assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* YOUR SIDE CARD CONTAINER */}
        <Card className="bg-white dark:bg-[#1B2332] border border-[#B69B72]/30 p-6 rounded-2xl space-y-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-[#B69B72]/15 border-b border-l border-[#B69B72]/30 text-[#B69B72] dark:text-[#D9C7A5] font-extrabold text-[11px] uppercase tracking-wider rounded-bl-xl">
            YOUR SIDE
          </div>

          {/* Applicant Info Block */}
          <div>
            <span className="text-xs font-bold text-[#B69B72] uppercase tracking-wider block mb-3">APPLICANT CLAIMANT</span>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/60">
              <div className="h-12 w-12 rounded-full bg-[#202A3B] text-[#D9C7A5] border border-[#B69B72]/40 flex items-center justify-center font-bold text-lg shadow-sm">
                {applicant.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#202A3B] dark:text-white truncate">{applicant.fullName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#B69B72]/15 text-[#B69B72] dark:text-[#D9C7A5] border border-[#B69B72]/30">
                    {applicant.partyType || 'PLAINTIFF'}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{applicant.relationshipToCase || 'Primary Applicant'}</p>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
            <span className="text-[11px] text-[#B69B72] font-semibold uppercase tracking-wider">REPRESENTED BY COUNSEL</span>
            <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800" />
          </div>

          {/* Applicant Lawyer Block */}
          <div>
            <div className="p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-[#B69B72]/30 hover:border-[#B69B72] transition-all">
              <div className="flex items-start gap-4">
                {applicantLawyer?.profileImage ? (
                  <img src={applicantLawyer.profileImage} alt="" className="h-14 w-14 rounded-xl object-cover border border-[#B69B72]/40" />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-[#202A3B] text-[#D9C7A5] border border-[#B69B72]/30 flex items-center justify-center font-bold">
                    <Scale className="w-7 h-7 text-[#B69B72]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-[#202A3B] dark:text-white truncate">
                      {applicantLawyer?.name || 'Advocate Allocation Pending'}
                    </h4>
                    {applicantLawyer && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                        <ShieldCheck className="w-3 h-3" /> VERIFIED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#B69B72] dark:text-[#D9C7A5] font-medium mt-0.5">
                    {applicantLawyer?.specialization || 'General Trial Practice'}
                  </p>
                  
                  {applicantLawyer && (
                    <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 dark:text-slate-300 pt-2 border-t border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 text-[#B69B72]">
                        <Award className="w-3.5 h-3.5" />
                        <span className="font-semibold">{applicantLawyer.experience} Yrs Exp</span>
                      </div>
                      <span>•</span>
                      <div>
                        Rating: <span className="font-bold text-[#202A3B] dark:text-white">{applicantLawyer.rating || 4.9} / 5</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* OPPOSING SIDE CARD CONTAINER */}
        <Card className="bg-white dark:bg-[#1B2332] border border-slate-200/90 dark:border-slate-800 p-6 rounded-2xl space-y-6 relative overflow-hidden shadow-sm">
          <div className="absolute top-0 right-0 px-4 py-1.5 bg-slate-100 dark:bg-slate-800 border-b border-l border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-[11px] uppercase tracking-wider rounded-bl-xl">
            OPPOSING SIDE
          </div>

          {/* Opponent Info Block */}
          <div>
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-3">OPPONENT DEFENDANT</span>
            <div className="flex items-center gap-4 p-4 rounded-xl bg-[#FAF9F5] dark:bg-[#202A3B]/50 border border-slate-200 dark:border-slate-700/60">
              <div className="h-12 w-12 rounded-full bg-slate-700 text-white flex items-center justify-center font-bold text-lg shadow-sm">
                {opponent.fullName.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="text-base font-bold text-[#202A3B] dark:text-white truncate">{opponent.fullName}</h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200">
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
