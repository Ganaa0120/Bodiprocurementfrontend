export function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,300;14..32,400;14..32,500;14..32,600;14..32,700;14..32,800&display=swap');
      *,*::before,*::after{box-sizing:border-box;font-family:'Inter',sans-serif;}
      body{margin:0;background:#0a0e1a;}
      ::-webkit-scrollbar{width:4px}
      ::-webkit-scrollbar-track{background:rgba(255,255,255,0.03)}
      ::-webkit-scrollbar-thumb{background:rgba(255,255,255,0.12);border-radius:99px}
      @keyframes fadeIn{from{opacity:0}to{opacity:1}}
      @keyframes fadeInUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
      @keyframes slideIn{from{opacity:0;transform:translateX(-20px)}to{opacity:1;transform:translateX(0)}}
      @keyframes spin{to{transform:rotate(360deg)}}
      .nav-item{display:flex;align-items:center;gap:12px;padding:10px 16px;margin:4px 12px;border-radius:12px;cursor:pointer;transition:all 0.3s;color:rgba(255,255,255,0.4);position:relative;overflow:hidden}
      .nav-item::before{content:'';position:absolute;left:0;top:0;bottom:0;width:0;background:linear-gradient(135deg,rgba(99,102,241,0.15),rgba(139,92,246,0.08));transition:width 0.3s;z-index:0}
      .nav-item:hover::before{width:100%}
      .nav-item:hover{color:rgba(255,255,255,0.85);transform:translateX(4px)}
      .nav-item.active{background:linear-gradient(135deg,rgba(99,102,241,0.12),rgba(139,92,246,0.08));color:#a5b4fc;border-left:2px solid #6366f1}
      .nav-item>*{position:relative;z-index:1}
      .glass-card{background:rgba(12,16,35,0.8);backdrop-filter:blur(12px);border:1px solid rgba(255,255,255,0.06);border-radius:24px;transition:all 0.3s}
      .glass-card:hover{border-color:rgba(99,102,241,0.25);box-shadow:0 8px 32px rgba(99,102,241,0.08)}
      .animate-fade-up{animation:fadeInUp 0.4s ease forwards}
      @media (max-width:1024px){.mobile-menu-btn{display:flex!important}.sidebar{transform:translateX(-100%);transition:transform 0.3s}.sidebar.open{transform:translateX(0)}.main-content{margin-left:0!important}}
    `}</style>
  );
}