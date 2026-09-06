// Hand-drawn illustrative swim lane — same one shown in Process Flow Mela and as
// the "swim_lane" content type in AI Chetak, until real generation is wired up.
export default function SwimLaneSample() {
  return (
    <svg width="100%" viewBox="0 0 600 220" role="img" aria-label="Sample swim lane diagram">
      <defs>
        <marker id="arrowSolid" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#5B6472" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
        <marker id="arrowDashed" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M2 1L8 5L2 9" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </marker>
      </defs>
      <line x1="0" y1="70" x2="600" y2="70" stroke="#DCE3ED" strokeWidth="1" />
      <line x1="0" y1="140" x2="600" y2="140" stroke="#DCE3ED" strokeWidth="1" />
      <line x1="110" y1="0" x2="110" y2="210" stroke="#DCE3ED" strokeWidth="1" />
      <text x="8" y="39" fontSize="11" fill="#5B6472">Warehouse clerk</text>
      <text x="8" y="109" fontSize="11" fill="#5B6472">EWM system</text>
      <text x="8" y="179" fontSize="11" fill="#5B6472">Supervisor</text>
      <rect x="130" y="15" width="150" height="40" rx="6" fill="#FFFFFF" stroke="#C2CCDA" />
      <text x="205" y="39" textAnchor="middle" fontSize="11" fill="#0F1720">Scan inbound HU</text>
      <rect x="130" y="85" width="150" height="40" rx="6" fill="#FFFFFF" stroke="#C2CCDA" />
      <text x="205" y="109" textAnchor="middle" fontSize="11" fill="#0F1720">Determine strategy</text>
      <rect x="330" y="85" width="150" height="40" rx="6" fill="#FFFFFF" stroke="#C2CCDA" />
      <text x="405" y="109" textAnchor="middle" fontSize="11" fill="#0F1720">Assign bin & confirm</text>
      <rect x="330" y="155" width="150" height="40" rx="6" fill="#FFFFFF" stroke="#D97706" strokeDasharray="4 3" />
      <text x="405" y="179" textAnchor="middle" fontSize="11" fill="#D97706">Escalate to supervisor</text>
      <line x1="205" y1="55" x2="205" y2="83" stroke="#5B6472" strokeWidth="1.2" markerEnd="url(#arrowSolid)" />
      <line x1="280" y1="105" x2="328" y2="105" stroke="#5B6472" strokeWidth="1.2" markerEnd="url(#arrowSolid)" />
      <line x1="405" y1="125" x2="405" y2="153" stroke="#D97706" strokeWidth="1.2" strokeDasharray="3 3" markerEnd="url(#arrowDashed)" />
      <line x1="480" y1="105" x2="544" y2="105" stroke="#5B6472" strokeWidth="1.2" markerEnd="url(#arrowSolid)" />
      <text x="415" y="145" fontSize="9" fill="#D97706">if capacity exceeded</text>
      <circle cx="560" cy="105" r="16" fill="rgba(22,163,74,0.12)" stroke="#16A34A" />
      <text x="560" y="109" textAnchor="middle" fontSize="12" fill="#16A34A">✓</text>
      <text x="560" y="135" textAnchor="middle" fontSize="9" fill="#8B93A1">Complete</text>
    </svg>
  );
}
