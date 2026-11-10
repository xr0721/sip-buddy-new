import React from 'react';
import { X, Cpu, GitBranch, Sparkles, AlertTriangle, ShieldCheck, Database } from 'lucide-react';
import { TransparencyData } from '../types.js';

interface HowItWorksModalProps {
  isOpen: boolean;
  onClose: () => void;
  transparency?: TransparencyData;
}

export const HowItWorksModal: React.FC<HowItWorksModalProps> = ({
  isOpen,
  onClose,
  transparency,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl max-h-[90vh] bg-[#FFFDF9] rounded-3xl border border-[#E8DEC9] shadow-2xl flex flex-col overflow-hidden text-[#360E17]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#EFE5D5] flex items-center justify-between bg-[#FAF6EE]">
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#C2410C]" />
            <h3 className="font-serif-title font-bold text-lg text-[#360E17]">
              How Sip Buddy Works
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#8C6961] hover:text-[#360E17] hover:bg-[#EFE5D5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 text-xs sm:text-sm">
          {/* Architecture Flow Diagram */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8A5B50] mb-2.5">
              The 5-Step Pipeline
            </span>
            <div className="space-y-2 font-mono text-xs">
              <div className="p-2.5 rounded-xl bg-[#FAF5EB] border border-[#E9DCB8] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#360E17] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">1</span>
                <div>
                  <strong className="text-[#360E17]">User Preferences</strong>
                  <p className="text-[11px] text-[#734A42] font-sans">Free text, flavor chips, category, exclusions, alcohol choice.</p>
                </div>
              </div>

              <div className="flex justify-center text-[#C2410C]">↓</div>

              <div className="p-2.5 rounded-xl bg-[#FFF5E6] border border-[#F3C68F] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#C2410C] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">2</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-[#360E17]">Reference Selection</strong>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#DCFCE7] text-[#166534] uppercase font-sans">
                      Deterministic
                    </span>
                  </div>
                  <p className="text-[11px] text-[#734A42] font-sans">
                    Keyword, tag, and allergen filtering strictly eliminates non-compliant drinks from the 24 reference catalog.
                  </p>
                </div>
              </div>

              <div className="flex justify-center text-[#C2410C]">↓</div>

              <div className="p-2.5 rounded-xl bg-[#FAF5EB] border border-[#E9DCB8] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#360E17] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">3</span>
                <div>
                  <strong className="text-[#360E17]">Context Assembly</strong>
                  <p className="text-[11px] text-[#734A42] font-sans">
                    System instructions + retrieved reference entries + conversation history combined securely on the server.
                  </p>
                </div>
              </div>

              <div className="flex justify-center text-[#C2410C]">↓</div>

              <div className="p-2.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#991B1B] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">4</span>
                <div>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-[#360E17]">Gemini Reasoning</strong>
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-[#EDE9FE] text-[#6D28D9] uppercase font-sans">
                      Probabilistic
                    </span>
                  </div>
                  <p className="text-[11px] text-[#734A42] font-sans">
                    Gemini evaluates nuance, personalizes the match explanation, and creates natural bar ordering phrasing.
                  </p>
                </div>
              </div>

              <div className="flex justify-center text-[#C2410C]">↓</div>

              <div className="p-2.5 rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] flex items-center gap-2">
                <span className="w-5 h-5 rounded-md bg-[#047857] text-white flex items-center justify-center font-bold shrink-0 text-[10px]">5</span>
                <div>
                  <strong className="text-[#360E17]">Recommendations</strong>
                  <p className="text-[11px] text-[#734A42] font-sans">
                    One best match + two alternatives with one-tap copy buttons.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Key Transparency Guarantees */}
          <div className="space-y-2.5 pt-2 border-t border-[#F0E6D5]">
            <div className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#F1E0C4] flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-[#360E17]">Deterministic Rules vs. Probabilistic AI</strong>
                <p className="text-[11px] text-[#6D4940] mt-0.5 leading-relaxed">
                  Ingredient exclusions, zero-proof requirements, and drink type filters are <strong>deterministic</strong>: hard code rules that unconditionally block unsuited drinks. Meanwhile, taste profiling, pairing descriptions, and conversational advice are <strong>probabilistic</strong>: generated dynamically by Gemini.
                </p>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-[#FFF9EE] border border-[#F1E0C4] flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-[#C2410C] shrink-0 mt-0.5" />
              <div>
                <strong className="text-xs text-[#360E17]">No Live Bar Inventory Access</strong>
                <p className="text-[11px] text-[#6D4940] mt-0.5 leading-relaxed">
                  Sip Buddy does not have access to any specific bar's backbar, tap list, or wine cellar. All ordering phrases are carefully worded as inquiries (e.g. <em>"Could you make...?"</em> or <em>"Do you have...?"</em>) rather than assumptions.
                </p>
              </div>
            </div>
          </div>

          {/* Live Data Inspection (if present) */}
          {transparency && (
            <div className="pt-2 border-t border-[#F0E6D5] space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-[#8A5B50]">
                Live Request Audit
              </span>
              <div className="p-3 rounded-xl bg-[#F8F2E6] text-[11px] space-y-1.5 font-mono text-[#4A261F]">
                <div><span className="text-[#8C6961]">Model:</span> {transparency.modelUsed}</div>
                {transparency.durationMs !== undefined && (
                  <div><span className="text-[#8C6961]">Duration:</span> {transparency.durationMs}ms</div>
                )}
                <div><span className="text-[#8C6961]">Query:</span> {transparency.userPreferences.query}</div>
                <div><span className="text-[#8C6961]">Flavors:</span> {transparency.userPreferences.flavorChips.join(', ') || 'None'}</div>
                <div><span className="text-[#8C6961]">Deterministic rules applied:</span></div>
                <ul className="list-disc pl-4 text-[10px] space-y-0.5 font-sans">
                  {transparency.deterministicRulesApplied.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
                <div className="pt-1"><span className="text-[#8C6961]">Candidates provided to Gemini ({transparency.retrievedCandidates.length}):</span></div>
                <div className="flex flex-wrap gap-1 font-sans">
                  {transparency.retrievedCandidates.map((c, i) => (
                    <span key={i} className="px-1.5 py-0.5 bg-white border border-[#E0D0BB] rounded text-[10px]">
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#EFE5D5] bg-[#FAF6EE] flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="min-h-[38px] px-4 py-1.5 rounded-xl text-xs font-bold bg-[#360E17] text-white hover:bg-[#4A1521] transition-colors"
          >
            Got it, thanks!
          </button>
        </div>
      </div>
    </div>
  );
};
