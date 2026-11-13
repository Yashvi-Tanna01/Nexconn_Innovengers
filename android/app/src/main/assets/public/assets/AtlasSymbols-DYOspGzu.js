import{L as f}from"./map-vendor-Bbu4dE7n.js";const p={water_leakage:{color:"#0284C7",bg:"#F0F9FF",stroke:"#0284C7",label:"Water Leakage"},drainage_overflow:{color:"#0D9488",bg:"#F0FDFA",stroke:"#0D9488",label:"Drainage & Overflow"},damaged_roads:{color:"#DC2626",bg:"#FEF2F2",stroke:"#DC2626",label:"Damaged Roads"},broken_streetlights:{color:"#D97706",bg:"#FFFBEB",stroke:"#D97706",label:"Broken Streetlights"},public_infrastructure:{color:"#475569",bg:"#F8FAFC",stroke:"#475569",label:"Public Infrastructure"}},v=(t,e)=>{switch(t){case"water_leakage":return`
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${e}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          <path d="M8.5 14c1 1.2 2 1.2 3.5 0s2.5-1.2 3.5 0" stroke-width="1.6"></path>
        </svg>
      `;case"drainage_overflow":return`
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${e}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="3"></rect>
          <line x1="8" y1="8" x2="8" y2="16"></line>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="16" y1="8" x2="16" y2="16"></line>
        </svg>
      `;case"damaged_roads":return`
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${e}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="12 2 22 12 12 22 2 12"></polygon>
          <path d="M12 6l-2 4 4 4-2 4"></path>
        </svg>
      `;case"broken_streetlights":return`
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${e}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18h6"></path>
          <path d="M10 22h4"></path>
          <path d="M12 2v2"></path>
          <path d="M12 4a6 6 0 0 0-6 6c0 3 2 4.5 2 6h8c0-1.5 2-3 2-6a6 6 0 0 0-6-6z"></path>
        </svg>
      `;case"public_infrastructure":default:return`
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="${e}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M4 21V7l8-4 8 4v14"></path>
          <path d="M9 21v-7a3 3 0 0 1 6 0v7"></path>
        </svg>
      `}},k=(t,e,s,i=0)=>{const l=p[t.category]||p.public_infrastructure,d=t.status==="candidate_pattern",h=t.status==="verified_incident",c=t.status==="resolved",r=e?42:s?37:34;let o="border border-[#E6EAE6]",a="",n=l.color;h?(o="border-2 border-solid border-[#D9534F]",n="#D9534F",a=`
      <span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#D9534F] text-white rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-xs" title="Coordinator-Verified Incident">
        <svg viewBox="0 0 24 24" width="9" height="9" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
        </svg>
      </span>
    `):d?(o="border-2 border-dashed border-[#D99A45] ring-2 ring-[#D99A45]/20",n="#D99A45",a=`
      <span class="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 bg-[#D99A45] text-white rounded-full border-2 border-white flex items-center justify-center shadow-xs" title="AI-Detected Candidate Signal Cluster">
        <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
      </span>
    `):c?(o="border-2 border-solid border-[#286B56] opacity-90",n="#286B56",a=`
      <span class="absolute -top-1.5 -right-1.5 w-4 h-4 bg-[#286B56] text-white rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold shadow-xs" title="Resolved Issue">
        ✓
      </span>
    `):o="border border-[#E6EAE6]";const g=e?h?"shadow-[0_0_0_3px_rgba(217,83,79,0.35),0_12px_28px_rgba(217,83,79,0.25)]":d?"shadow-[0_0_0_3px_rgba(217,154,69,0.35),0_12px_28px_rgba(217,154,69,0.25)]":c?"shadow-[0_0_0_3px_rgba(40,107,86,0.35),0_12px_28px_rgba(40,107,86,0.25)]":"shadow-[0_0_0_3px_rgba(8,123,86,0.25),0_12px_28px_rgba(8,123,86,0.20)]":s?"shadow-[0_0_0_2px_rgba(217,154,69,0.4),0_6px_16px_rgba(24,35,34,0.08)] hover:-translate-y-0.5":"shadow-[0_2px_8px_rgba(24,35,34,0.08)] hover:shadow-[0_8px_20px_rgba(24,35,34,0.16)] hover:-translate-y-0.5 active:scale-95",b=e?"transform: scale(1.12); z-index: 100;":s?"transform: scale(1.05); z-index: 50;":"transform: scale(1);",u=s&&!e?'<span class="absolute -bottom-1.5 -right-1.5 px-1 py-0.2 rounded text-[7px] font-mono font-bold bg-[#FFF7ED] text-[#D99A45] border border-[#D99A45]/40 shadow-2xs">LINK</span>':"",x=e?`
      <span class="atlas-signal-pulse" data-cycle="${i}" style="border-color: ${n};"></span>
      <span class="atlas-signal-pulse" data-cycle="${i}" style="border-color: #087B56; animation-delay: 0.18s; opacity: 0.8;"></span>
      <span class="atlas-signal-pulse" data-cycle="${i}" style="border-color: #3DD6A5; animation-delay: 0.36s; opacity: 0.6;"></span>
    `:"",_=v(t.category,l.color),w=`
    <div class="atlas-symbol-wrapper relative flex items-center justify-center" style="width: ${r}px; height: ${r}px;">
      ${x}
      <div 
        class="atlas-symbol-badge relative flex items-center justify-center rounded-2xl bg-white ${o} ${g} transition-all duration-200 cursor-pointer"
        style="width: ${r}px; height: ${r}px; ${b}"
        title="${t.title} (${t.id}) • ${h?"Verified Incident":d?"Candidate Cluster":c?"Resolved Incident":"Reported Community Issue"}"
      >
        <div class="flex items-center justify-center" style="color: ${l.color};">
          ${_}
        </div>
        ${a}
        ${u}
      </div>
    </div>
  `;return f.divIcon({className:"atlas-marker-container",html:w,iconSize:[r,r],iconAnchor:[r/2,r/2]})};export{p as C,k as c,v as g};
