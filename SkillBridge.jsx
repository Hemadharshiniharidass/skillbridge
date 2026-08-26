import React, { useState, useMemo, useCallback } from "react";
import {
  LayoutDashboard, User, BarChart3, Briefcase, FileText, GraduationCap,
  Bell, Settings, Search, Filter, Bookmark, BookmarkCheck, CheckCircle2,
  AlertTriangle, TrendingUp, Building2, Users, Target, Award, Upload,
  ChevronRight, ChevronDown, X, Menu, ArrowRight, MapPin, Clock,
  IndianRupee, Star, Sparkles, Rocket, PlusCircle, Send, Eye, ShieldCheck,
  Cloud, Database, Code2, Activity, LogOut, Zap, Layers, CircleCheck,
  ClipboardList, School, LineChart as LineChartIcon, MinusCircle, Tag,
  ChevronLeft, Home, Info,
} from "lucide-react";
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, Legend,
} from "recharts";

/* ============================================================================
   SKILLBRIDGE — Design tokens
   Ink navy + institutional indigo + skill-growth teal. Amber marks gaps.
   Display face: Space Grotesk (structural, technical). Body: Inter.
   Data/metrics: IBM Plex Mono — every score, %, and stat reads as measured
   data, not decoration. Signature element: the "Bridge Ring" — a radial arc
   gauge used everywhere a match/skill/completion score appears, plus the
   literal bridge-arc motif connecting Student → Skill → Opportunity.
============================================================================ */

const C = {
  ink: "#0E1526",
  inkSoft: "#4A5268",
  bg: "#F5F6FA",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF0F8",
  border: "#E3E6F0",
  primary: "#24399B",
  primaryDark: "#152368",
  primarySoft: "#E7EAF9",
  accent: "#0E9E8B",
  accentDark: "#0A7A6C",
  accentSoft: "#E1F5F1",
  violet: "#6D3FC9",
  violetSoft: "#EFE7FB",
  warn: "#DA8A1F",
  warnSoft: "#FBEEDA",
  danger: "#D14B3F",
  dangerSoft: "#FAE6E3",
};

const FONTS = (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
    .f-display { font-family:'Space Grotesk',sans-serif; letter-spacing:-0.01em; }
    .f-body { font-family:'Inter',sans-serif; }
    .f-mono { font-family:'IBM Plex Mono',monospace; }
    * { box-sizing: border-box; }
    .sb-scroll::-webkit-scrollbar { width:6px; height:6px; }
    .sb-scroll::-webkit-scrollbar-thumb { background:${C.border}; border-radius:4px; }
    @keyframes sbFadeUp { from { opacity:0; transform:translateY(8px);} to {opacity:1; transform:translateY(0);} }
    .sb-fade-up { animation: sbFadeUp .45s ease both; }
    @keyframes sbToast { from {opacity:0; transform:translateY(-8px) scale(.96);} to {opacity:1; transform:translateY(0) scale(1);} }
    .sb-toast { animation: sbToast .3s ease both; }
  `}</style>
);

/* ---------------------------------------------------------------------------
   Shared primitives
--------------------------------------------------------------------------- */

function BridgeRing({ value, size = 64, stroke = 7, color = C.primary, track = C.surfaceAlt, label, sub }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c - (Math.min(value, 100) / 100) * c;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke={track} strokeWidth={stroke} fill="none" />
        <circle
          cx={size / 2} cy={size / 2} r={r} stroke={color} strokeWidth={stroke} fill="none"
          strokeDasharray={c} strokeDashoffset={off} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset .8s cubic-bezier(.4,0,.2,1)" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center">
        <span className="f-mono font-semibold" style={{ fontSize: size * 0.24, color: C.ink }}>{value}%</span>
        {sub && <span className="f-body" style={{ fontSize: size * 0.11, color: C.inkSoft }}>{sub}</span>}
      </div>
    </div>
  );
}

function StatusBadge({ status }) {
  const map = {
    Strong: { bg: C.accentSoft, fg: C.accentDark, icon: CheckCircle2 },
    "Needs Improvement": { bg: C.warnSoft, fg: C.warn, icon: MinusCircle },
    "Skill Gap": { bg: C.dangerSoft, fg: C.danger, icon: AlertTriangle },
  };
  const s = map[status] || map.Strong;
  const Icon = s.icon;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold f-body" style={{ background: s.bg, color: s.fg }}>
      <Icon size={13} strokeWidth={2.5} />{status}
    </span>
  );
}

function Pill({ children, active, onClick, tone = "default" }) {
  const tones = {
    default: active ? { bg: C.primary, fg: "#fff" } : { bg: C.surfaceAlt, fg: C.inkSoft },
  };
  const t = tones[tone];
  return (
    <button onClick={onClick} className="px-3.5 py-1.5 rounded-full text-sm font-medium f-body transition-all" style={{ background: t.bg, color: t.fg }}>
      {children}
    </button>
  );
}

function SkillChip({ children, onRemove }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium f-body" style={{ background: C.primarySoft, color: C.primaryDark }}>
      {children}
      {onRemove && <X size={13} className="cursor-pointer opacity-60 hover:opacity-100" onClick={onRemove} />}
    </span>
  );
}

function SkillBar({ label, value, color = C.primary }) {
  return (
    <div className="mb-3.5">
      <div className="flex justify-between items-baseline mb-1.5">
        <span className="text-sm font-medium f-body" style={{ color: C.ink }}>{label}</span>
        <span className="text-xs font-semibold f-mono" style={{ color }}>{value}%</span>
      </div>
      <div className="h-2 rounded-full w-full" style={{ background: C.surfaceAlt }}>
        <div className="h-2 rounded-full sb-fade-up" style={{ width: `${value}%`, background: color, transition: "width 1s ease" }} />
      </div>
    </div>
  );
}

function Card({ children, className = "", padded = true, style }) {
  return (
    <div
      className={`rounded-2xl ${padded ? "p-5" : ""} ${className}`}
      style={{ background: C.surface, border: `1px solid ${C.border}`, boxShadow: "0 1px 2px rgba(14,21,38,0.04), 0 8px 24px -16px rgba(14,21,38,0.10)", ...style }}
    >
      {children}
    </div>
  );
}

function Button({ children, onClick, variant = "primary", size = "md", icon: Icon, full, type = "button" }) {
  const sizes = { sm: "px-3 py-1.5 text-xs", md: "px-4 py-2.5 text-sm", lg: "px-6 py-3 text-base" };
  const variants = {
    primary: { background: C.primary, color: "#fff", border: "none" },
    accent: { background: C.accent, color: "#fff", border: "none" },
    ghost: { background: "transparent", color: C.primary, border: `1.5px solid ${C.border}` },
    outline: { background: C.surface, color: C.ink, border: `1.5px solid ${C.border}` },
    dark: { background: C.ink, color: "#fff", border: "none" },
  };
  return (
    <button
      type={type} onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-xl font-semibold f-body transition-transform active:scale-[0.97] hover:brightness-105 ${sizes[size]} ${full ? "w-full" : ""}`}
      style={variants[variant]}
    >
      {Icon && <Icon size={size === "lg" ? 18 : 15} strokeWidth={2.4} />}
      {children}
    </button>
  );
}

function StatCard({ icon: Icon, label, value, delta, color = C.primary, soft = C.primarySoft }) {
  return (
    <Card className="sb-fade-up">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: soft }}>
          <Icon size={19} color={color} strokeWidth={2.2} />
        </div>
        {delta && (
          <span className="flex items-center gap-1 text-xs font-semibold f-mono" style={{ color: C.accentDark }}>
            <TrendingUp size={12} />{delta}
          </span>
        )}
      </div>
      <div className="mt-3 text-2xl font-bold f-mono" style={{ color: C.ink }}>{value}</div>
      <div className="text-xs f-body mt-0.5" style={{ color: C.inkSoft }}>{label}</div>
    </Card>
  );
}

function Toasts({ toasts }) {
  return (
    <div className="fixed top-5 right-5 z-[200] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div key={t.id} className="sb-toast flex items-center gap-2 px-4 py-3 rounded-xl shadow-lg f-body text-sm font-medium" style={{ background: C.ink, color: "#fff" }}>
          <CheckCircle2 size={16} color={C.accent} /> {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Dummy data
--------------------------------------------------------------------------- */

const STUDENT_SKILLS = [
  { skill: "Python", value: 85 },
  { skill: "SQL", value: 70 },
  { skill: "Data Analysis", value: 80 },
  { skill: "Communication", value: 90 },
  { skill: "Machine Learning", value: 45 },
  { skill: "Cloud Computing", value: 30 },
];

const SKILL_GAP_TABLE = [
  { skill: "Python", your: 85, industry: 80, status: "Strong" },
  { skill: "SQL", your: 70, industry: 85, status: "Needs Improvement" },
  { skill: "Communication", your: 90, industry: 75, status: "Strong" },
  { skill: "Machine Learning", your: 45, industry: 80, status: "Skill Gap" },
  { skill: "Cloud Computing", your: 30, industry: 70, status: "Skill Gap" },
];

const OPPORTUNITIES = [
  { id: 1, type: "Internship", role: "Data Analyst Intern", company: "TechNova", location: "Bengaluru", remote: "On-site", domain: "Data Science", duration: "3 Months", match: 92, skills: ["Python", "SQL", "Excel"], color: C.primary, salary: "₹18,000/mo" },
  { id: 2, type: "Internship", role: "Data Science Intern", company: "InnovateLabs", location: "Remote", remote: "Remote", domain: "AI/ML", duration: "6 Months", match: 91, skills: ["Python", "SQL", "Statistics"], color: C.accent, salary: "₹22,000/mo" },
  { id: 3, type: "Internship", role: "Cloud Support Intern", company: "NimbusWorks", location: "Hyderabad", remote: "On-site", domain: "Cloud Computing", duration: "4 Months", match: 68, skills: ["Cloud Computing", "Linux", "Networking"], color: C.violet, salary: "₹15,000/mo" },
  { id: 4, type: "Job", role: "Junior Data Analyst", company: "FinEdge Analytics", location: "Pune", remote: "Hybrid", domain: "Data Analytics", duration: "Full-Time", match: 88, skills: ["Python", "SQL", "Power BI", "Statistics"], color: C.primary, salary: "₹6.2 LPA", eligibility: "B.Tech / B.Sc, 2026 batch" },
  { id: 5, type: "Job", role: "Software Developer", company: "CodeWorks", location: "Chennai", remote: "On-site", domain: "Software Development", duration: "Full-Time", match: 79, skills: ["React", "Node.js", "SQL"], color: C.violet, salary: "₹7.5 LPA", eligibility: "B.E/B.Tech CSE, 2026 batch" },
  { id: 6, type: "Job", role: "ML Engineer — Associate", company: "NeuralArc AI", location: "Remote", remote: "Remote", domain: "AI/ML", duration: "Full-Time", match: 61, skills: ["Machine Learning", "Python", "Cloud Computing"], color: C.accent, salary: "₹9.0 LPA", eligibility: "B.Tech, ML coursework required" },
];

const COURSES = [
  { id: 1, title: "Advanced SQL for Analysts", gap: "SQL", weeks: 6, difficulty: "Intermediate", progress: 20, icon: Database, color: C.primary },
  { id: 2, title: "Introduction to Cloud Computing", gap: "Cloud Computing", weeks: 4, difficulty: "Beginner", progress: 0, icon: Cloud, color: C.violet },
  { id: 3, title: "Machine Learning Fundamentals", gap: "Machine Learning", weeks: 8, difficulty: "Intermediate", progress: 10, icon: Sparkles, color: C.accent },
  { id: 4, title: "Applied Statistics for Data Science", gap: "Statistics", weeks: 5, difficulty: "Beginner", progress: 45, icon: BarChart3, color: C.warn },
];

const CANDIDATES = [
  { id: 1, name: "Alex Johnson", college: "Sri Krishna Institute of Tech", skills: [{ n: "Python", v: 90 }, { n: "SQL", v: 85 }, { n: "Data Analysis", v: 88 }], match: 94 },
  { id: 2, name: "Priya Sharma", college: "Anna University", skills: [{ n: "Python", v: 82 }, { n: "Statistics", v: 88 }, { n: "SQL", v: 79 }], match: 89 },
  { id: 3, name: "Rahul Kumar", college: "VIT Vellore", skills: [{ n: "Python", v: 75 }, { n: "Cloud", v: 70 }, { n: "SQL", v: 81 }], match: 84 },
  { id: 4, name: "Sneha Reddy", college: "IIIT Hyderabad", skills: [{ n: "Machine Learning", v: 77 }, { n: "Python", v: 91 }, { n: "SQL", v: 72 }], match: 80 },
  { id: 5, name: "Arjun Mehta", college: "NIT Trichy", skills: [{ n: "React", v: 85 }, { n: "Node.js", v: 80 }, { n: "SQL", v: 66 }], match: 74 },
];

const DEPT_READINESS = [
  { dept: "CSE", ready: 82 }, { dept: "IT", ready: 76 }, { dept: "ECE", ready: 58 },
  { dept: "Mech", ready: 41 }, { dept: "EEE", ready: 49 },
];
const SKILL_GAP_INSTITUTION = [
  { skill: "Machine Learning", pct: 42 }, { skill: "Cloud Computing", pct: 35 }, { skill: "Advanced SQL", pct: 28 },
];
const PLACEMENT_TREND = [
  { month: "Mar", rate: 61 }, { month: "Apr", rate: 65 }, { month: "May", rate: 69 },
  { month: "Jun", rate: 72 }, { month: "Jul", rate: 75 }, { month: "Aug", rate: 78 },
];
const INTERNSHIP_PARTICIPATION = [
  { month: "Mar", count: 60 }, { month: "Apr", count: 78 }, { month: "May", count: 95 },
  { month: "Jun", count: 110 }, { month: "Jul", count: 128 }, { month: "Aug", count: 145 },
];
const DEMANDED_SKILLS = [
  { name: "Python", value: 32 }, { name: "AI/ML", value: 24 }, { name: "Cloud", value: 18 },
  { name: "Data Analytics", value: 16 }, { name: "Cybersecurity", value: 10 },
];
const DEMAND_COLORS = [C.primary, C.accent, C.violet, C.warn, C.danger];

/* ---------------------------------------------------------------------------
   Layout: Sidebar + Topbar shell
--------------------------------------------------------------------------- */

const NAV = {
  student: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "profile", label: "My Profile", icon: User },
    { id: "analysis", label: "Skill Analysis", icon: BarChart3 },
    { id: "internships", label: "Internships", icon: Briefcase },
    { id: "jobs", label: "Jobs", icon: Building2 },
    { id: "applications", label: "Applications", icon: ClipboardList },
    { id: "learning", label: "Learning", icon: GraduationCap },
  ],
  institution: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "students", label: "Students", icon: Users },
    { id: "analytics", label: "Skill Analytics", icon: BarChart3 },
    { id: "reports", label: "Reports", icon: FileText },
  ],
  recruiter: [
    { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
    { id: "post", label: "Post Opportunity", icon: PlusCircle },
    { id: "matching", label: "Candidate Matching", icon: Target },
  ],
};

const ROLE_META = {
  student: { label: "Student", color: C.primary, soft: C.primarySoft, icon: User, name: "Alex Johnson", sub: "B.Tech, CSE · 2026" },
  institution: { label: "Institution", color: C.violet, soft: C.violetSoft, icon: School, name: "Sri Krishna Institute of Tech", sub: "Placement Cell" },
  recruiter: { label: "Recruiter", color: C.accent, soft: C.accentSoft, icon: Building2, name: "TechNova Pvt Ltd", sub: "Talent Acquisition" },
};

function Sidebar({ role, page, setPage, mobileOpen, setMobileOpen, goLanding }) {
  const meta = ROLE_META[role];
  const items = NAV[role];
  return (
    <>
      {mobileOpen && <div className="fixed inset-0 bg-black/30 z-30 lg:hidden" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`fixed lg:sticky top-0 h-screen z-40 flex flex-col transition-transform duration-300 ${mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}
        style={{ width: 252, background: C.ink, flexShrink: 0 }}
      >
        <div className="flex items-center gap-2.5 px-5 py-5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
            <Layers size={17} color="#fff" strokeWidth={2.5} />
          </div>
          <span className="f-display text-white text-lg font-semibold">SkillBridge</span>
        </div>

        <button onClick={goLanding} className="mx-4 mb-2 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium f-body opacity-60 hover:opacity-100 transition-opacity" style={{ color: "#fff" }}>
          <Home size={13} /> Exit to landing
        </button>

        <nav className="flex-1 px-3 mt-2 space-y-1 overflow-y-auto sb-scroll">
          {items.map((it) => {
            const active = page === it.id;
            const Icon = it.icon;
            return (
              <button
                key={it.id}
                onClick={() => { setPage(it.id); setMobileOpen(false); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium f-body transition-colors"
                style={{ background: active ? "rgba(255,255,255,0.08)" : "transparent", color: active ? "#fff" : "rgba(255,255,255,0.55)" }}
              >
                <Icon size={16.5} strokeWidth={2.2} color={active ? C.accent : "currentColor"} />
                {it.label}
                {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </button>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="flex items-center gap-2.5 px-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold f-mono" style={{ background: meta.color, color: "#fff" }}>
              {meta.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <div className="min-w-0">
              <div className="text-xs font-semibold text-white truncate f-body">{meta.name}</div>
              <div className="text-[11px] truncate f-body" style={{ color: "rgba(255,255,255,0.45)" }}>{meta.sub}</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, setMobileOpen, role }) {
  const meta = ROLE_META[role];
  return (
    <div className="sticky top-0 z-20 flex items-center justify-between gap-3 px-5 lg:px-8 py-4 backdrop-blur" style={{ background: "rgba(245,246,250,0.85)", borderBottom: `1px solid ${C.border}` }}>
      <div className="flex items-center gap-3 min-w-0">
        <button className="lg:hidden p-2 rounded-lg" style={{ background: C.surface, border: `1px solid ${C.border}` }} onClick={() => setMobileOpen(true)}>
          <Menu size={17} />
        </button>
        <div className="min-w-0">
          <h1 className="f-display text-lg lg:text-xl font-semibold truncate" style={{ color: C.ink }}>{title}</h1>
          {subtitle && <p className="text-xs f-body" style={{ color: C.inkSoft }}>{subtitle}</p>}
        </div>
      </div>
      <div className="flex items-center gap-2 lg:gap-3 flex-shrink-0">
        <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold f-body" style={{ background: meta.soft, color: meta.color }}>
          <meta.icon size={12} /> {meta.label} View
        </span>
        <button className="p-2 rounded-lg relative" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Bell size={16} color={C.inkSoft} />
          <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full" style={{ background: C.danger }} />
        </button>
        <button className="p-2 rounded-lg hidden sm:block" style={{ background: C.surface, border: `1px solid ${C.border}` }}>
          <Settings size={16} color={C.inkSoft} />
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   LANDING PAGE
--------------------------------------------------------------------------- */

function Landing({ onLogin, onExplore }) {
  const FLOW = [
    { label: "Student Skills", icon: User, color: C.primary },
    { label: "Skill Analysis", icon: BarChart3, color: C.violet },
    { label: "Internship Match", icon: Target, color: C.accent },
    { label: "Placement", icon: Award, color: C.warn },
  ];
  const FEATURES = [
    { icon: BarChart3, title: "Smart Skill Mapping", desc: "Analyze student skills and identify strengths and gaps against real industry benchmarks.", color: C.primary },
    { icon: Briefcase, title: "Internship Matching", desc: "Match students with relevant internship opportunities ranked by fit, not filters alone.", color: C.accent },
    { icon: Award, title: "Placement Connect", desc: "Connect skilled students with suitable job opportunities across partner industries.", color: C.violet },
    { icon: TrendingUp, title: "Industry Insights", desc: "Help institutions understand current industry skill requirements before the gap widens.", color: C.warn },
  ];
  const STEPS = [
    { n: "01", title: "Create Profile", desc: "Students, institutions, and recruiters register in a shared portal." },
    { n: "02", title: "Add Skills", desc: "Students log technical & soft skills; institutions map curricula." },
    { n: "03", title: "Analyze Skill Match", desc: "The engine compares skills against live industry requirements." },
    { n: "04", title: "Find Opportunities", desc: "Internships and jobs are ranked by real match percentage." },
    { n: "05", title: "Apply and Track Status", desc: "One click to apply, one dashboard to track every stage." },
  ];
  return (
    <div style={{ background: C.bg, minHeight: "100vh" }} className="f-body">
      {FONTS}
      {/* Nav */}
      <header className="sticky top-0 z-30 backdrop-blur" style={{ background: "rgba(245,246,250,0.85)", borderBottom: `1px solid ${C.border}` }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-5 lg:px-8 py-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
              <Layers size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="f-display text-lg font-semibold" style={{ color: C.ink }}>SkillBridge</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium" style={{ color: C.inkSoft }}>
            <a href="#home" className="hover:text-black">Home</a>
            <a href="#features" className="hover:text-black">Features</a>
            <a href="#how" className="hover:text-black">How It Works</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="text-sm font-semibold hidden sm:block" style={{ color: C.ink }}>Login</button>
            <Button onClick={onLogin} icon={ArrowRight}>Get Started</Button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section id="home" className="max-w-7xl mx-auto px-5 lg:px-8 pt-14 lg:pt-20 pb-16">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="sb-fade-up">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold mb-5" style={{ background: C.primarySoft, color: C.primary }}>
              <Sparkles size={12} /> Smart Automation · Academia–Industry Bridge
            </span>
            <h1 className="f-display font-bold leading-[1.05] tracking-tight" style={{ fontSize: "clamp(2.2rem, 4.2vw, 3.4rem)", color: C.ink }}>
              Connecting Skills<br />with Opportunities
            </h1>
            <p className="mt-5 text-base lg:text-lg max-w-lg" style={{ color: C.inkSoft }}>
              SkillBridge connects students, institutions, and industries through intelligent skill mapping, internship matching, and placement opportunities.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button size="lg" onClick={onExplore} icon={Search}>Explore Opportunities</Button>
              <Button size="lg" variant="outline" onClick={onLogin} icon={Rocket}>Get Started</Button>
            </div>
            <div className="mt-10 flex items-center gap-6">
              {[["2,450+", "Students"], ["180+", "Recruiters"], ["78%", "Placement Rate"]].map(([v, l]) => (
                <div key={l}>
                  <div className="f-mono font-bold text-xl" style={{ color: C.ink }}>{v}</div>
                  <div className="text-xs" style={{ color: C.inkSoft }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Dashboard preview / flow visual — signature element */}
          <Card className="sb-fade-up" style={{ animationDelay: ".1s" }}>
            <div className="flex items-center justify-between mb-5">
              <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.inkSoft }}>Live match pipeline</span>
              <span className="flex items-center gap-1 text-xs font-semibold f-mono" style={{ color: C.accentDark }}><Activity size={12} /> Live</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {FLOW.map((f, i) => (
                <div key={f.label} className="relative rounded-xl p-4 flex flex-col gap-2" style={{ background: C.surfaceAlt }}>
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: f.color }}>
                    <f.icon size={17} color="#fff" />
                  </div>
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>{f.label}</div>
                  {i < FLOW.length && <div className="f-mono text-[11px]" style={{ color: C.inkSoft }}>step {i + 1} of 4</div>}
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-xl p-4" style={{ background: C.primaryDark }}>
              <BridgeRing value={92} size={52} stroke={5} color={C.accent} track="rgba(255,255,255,0.18)" />
              <div>
                <div className="text-white text-sm font-semibold">Data Analyst Intern @ TechNova</div>
                <div className="text-xs f-mono" style={{ color: "rgba(255,255,255,0.6)" }}>match score computed just now</div>
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        <div className="max-w-xl mb-10">
          <h2 className="f-display text-2xl lg:text-3xl font-bold" style={{ color: C.ink }}>Built for three sides of one bridge</h2>
          <p className="mt-2 text-sm lg:text-base" style={{ color: C.inkSoft }}>One portal, three roles, a shared source of truth on skills.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {FEATURES.map((f) => (
            <Card key={f.title} className="sb-fade-up">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4" style={{ background: `${f.color}1A` }}>
                <f.icon size={19} color={f.color} />
              </div>
              <h3 className="font-semibold text-sm mb-1.5" style={{ color: C.ink }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: C.inkSoft }}>{f.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="max-w-7xl mx-auto px-5 lg:px-8 py-14">
        <h2 className="f-display text-2xl lg:text-3xl font-bold mb-10" style={{ color: C.ink }}>How it works</h2>
        <div className="grid md:grid-cols-5 gap-5 relative">
          <div className="hidden md:block absolute top-6 left-0 right-0 h-[1.5px]" style={{ background: C.border, zIndex: 0 }} />
          {STEPS.map((s) => (
            <div key={s.n} className="relative z-10 sb-fade-up">
              <div className="w-12 h-12 rounded-full flex items-center justify-center f-mono font-bold text-sm mb-3" style={{ background: C.ink, color: C.accent }}>{s.n}</div>
              <h4 className="font-semibold text-sm mb-1" style={{ color: C.ink }}>{s.title}</h4>
              <p className="text-xs leading-relaxed" style={{ color: C.inkSoft }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-5 lg:px-8 pb-20">
        <Card style={{ background: C.primaryDark, border: "none" }} className="flex flex-col md:flex-row items-center justify-between gap-6 py-10 px-8">
          <div>
            <h3 className="f-display text-xl lg:text-2xl font-bold text-white">Ready to bridge the skill gap?</h3>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>Join as a student, institution, or recruiter — free for the pilot cohort.</p>
          </div>
          <Button size="lg" variant="accent" onClick={onLogin} icon={ArrowRight}>Get Started</Button>
        </Card>
      </section>

      <footer className="border-t py-6 text-center text-xs f-body" style={{ borderColor: C.border, color: C.inkSoft }}>
        SkillBridge — Academia–Industry Collaboration Portal · Smart India Hackathon Prototype
      </footer>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   LOGIN / ROLE SELECTION
--------------------------------------------------------------------------- */

function Login({ onEnter, onBack }) {
  const [role, setRole] = useState("student");
  const roles = [
    { id: "student", label: "Student", icon: User, desc: "Skills, internships & placements" },
    { id: "institution", label: "Institution", icon: School, desc: "Analytics across your college" },
    { id: "recruiter", label: "Recruiter", icon: Building2, desc: "Post roles, find candidates" },
  ];
  return (
    <div className="min-h-screen flex items-center justify-center px-5 py-10 f-body" style={{ background: C.bg }}>
      {FONTS}
      <div className="w-full max-w-md">
        <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-medium mb-6" style={{ color: C.inkSoft }}>
          <ChevronLeft size={15} /> Back to home
        </button>
        <Card className="sb-fade-up">
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: C.accent }}>
              <Layers size={17} color="#fff" strokeWidth={2.5} />
            </div>
            <span className="f-display text-lg font-semibold" style={{ color: C.ink }}>SkillBridge</span>
          </div>
          <h2 className="f-display text-xl font-bold mt-4" style={{ color: C.ink }}>Welcome back</h2>
          <p className="text-sm mt-1" style={{ color: C.inkSoft }}>Sign in to continue to your dashboard.</p>

          <div className="grid grid-cols-3 gap-2.5 mt-5">
            {roles.map((r) => {
              const active = role === r.id;
              return (
                <button
                  key={r.id} onClick={() => setRole(r.id)}
                  className="rounded-xl p-3 flex flex-col items-center gap-1.5 text-center transition-all"
                  style={{ background: active ? ROLE_META[r.id].soft : C.surfaceAlt, border: `1.5px solid ${active ? ROLE_META[r.id].color : "transparent"}` }}
                >
                  <r.icon size={18} color={active ? ROLE_META[r.id].color : C.inkSoft} />
                  <span className="text-xs font-semibold" style={{ color: active ? ROLE_META[r.id].color : C.inkSoft }}>{r.label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] mt-2 text-center" style={{ color: C.inkSoft }}>{roles.find(r => r.id === role).desc}</p>

          <form className="mt-6 space-y-3.5" onSubmit={(e) => { e.preventDefault(); onEnter(role); }}>
            <div>
              <label className="text-xs font-semibold f-body" style={{ color: C.ink }}>Email</label>
              <input type="email" defaultValue={`${role}@skillbridge.demo`} className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}`, background: C.surface }} />
            </div>
            <div>
              <label className="text-xs font-semibold f-body" style={{ color: C.ink }}>Password</label>
              <input type="password" defaultValue="••••••••" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}`, background: C.surface }} />
            </div>
            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-1.5" style={{ color: C.inkSoft }}>
                <input type="checkbox" defaultChecked className="rounded" /> Remember me
              </label>
              <a href="#" className="font-semibold" style={{ color: C.primary }}>Forgot password?</a>
            </div>
            <Button type="submit" full size="lg" icon={ArrowRight}>Login as {roles.find(r => r.id === role).label}</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STUDENT — Dashboard
--------------------------------------------------------------------------- */

function StudentDashboard({ setPage, onApply }) {
  const recommended = OPPORTUNITIES.slice(0, 3);
  return (
    <div className="space-y-6">
      <Card className="sb-fade-up" style={{ background: `linear-gradient(120deg, ${C.primaryDark}, ${C.primary})`, border: "none" }}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h2 className="f-display text-xl lg:text-2xl font-bold text-white">Good Morning, Alex 👋</h2>
            <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.65)" }}>You're 5 skills away from a stronger match on 3 saved internships.</p>
            <Button variant="accent" size="sm" onClick={() => setPage("analysis")} icon={BarChart3}>View Skill Analysis</Button>
          </div>
          <BridgeRing value={78} size={92} stroke={8} color={C.accent} track="rgba(255,255,255,0.18)" sub="Skill Score" />
        </div>
      </Card>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Target} label="Skill Score" value="78%" delta="+4%" color={C.primary} soft={C.primarySoft} />
        <StatCard icon={Briefcase} label="Internship Matches" value="12" color={C.accent} soft={C.accentSoft} />
        <StatCard icon={Building2} label="Job Matches" value="8" color={C.violet} soft={C.violetSoft} />
        <StatCard icon={ClipboardList} label="Applications" value="5" color={C.warn} soft={C.warnSoft} />
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>My Skills</h3>
          {STUDENT_SKILLS.map((s) => (
            <SkillBar key={s.skill} label={s.skill} value={s.value} color={s.value >= 70 ? C.accent : s.value >= 50 ? C.warn : C.danger} />
          ))}
          <div className="mt-4 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: C.inkSoft }}>Top Skill Gaps</h4>
            <div className="flex flex-wrap gap-2">
              {["Machine Learning", "Cloud Computing", "Advanced SQL"].map((g) => (
                <span key={g} className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium" style={{ background: C.dangerSoft, color: C.danger }}>
                  <AlertTriangle size={11} /> {g}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <Card className="lg:col-span-3" padded={false}>
          <div className="flex items-center justify-between p-5 pb-0">
            <h3 className="font-semibold text-sm" style={{ color: C.ink }}>Recommended Opportunities</h3>
            <button onClick={() => setPage("internships")} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.primary }}>View all <ChevronRight size={13} /></button>
          </div>
          <div className="p-5 grid sm:grid-cols-2 gap-4">
            {recommended.map((o) => (
              <div key={o.id} className="rounded-xl p-4 flex flex-col gap-3" style={{ background: C.surfaceAlt }}>
                <div className="flex items-center justify-between">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-xs f-mono text-white" style={{ background: o.color }}>{o.company[0]}</div>
                  <BridgeRing value={o.match} size={40} stroke={4} color={o.color} />
                </div>
                <div>
                  <div className="font-semibold text-sm" style={{ color: C.ink }}>{o.role}</div>
                  <div className="text-xs" style={{ color: C.inkSoft }}>{o.company}</div>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {o.skills.slice(0, 3).map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: C.surface, color: C.inkSoft, border: `1px solid ${C.border}` }}>{s}</span>)}
                </div>
                <Button size="sm" variant="outline" full onClick={() => onApply(o)}>View Details</Button>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STUDENT — Profile
--------------------------------------------------------------------------- */

function StudentProfile() {
  const [skills, setSkills] = useState(["Python", "Java", "SQL", "React", "Data Analytics", "Machine Learning"]);
  return (
    <div className="grid lg:grid-cols-3 gap-5">
      <Card className="lg:col-span-1 flex flex-col items-center text-center">
        <div className="w-24 h-24 rounded-full flex items-center justify-center text-2xl font-bold f-mono text-white mb-4" style={{ background: C.primary }}>AJ</div>
        <h3 className="f-display font-bold text-lg" style={{ color: C.ink }}>Alex Johnson</h3>
        <p className="text-sm" style={{ color: C.inkSoft }}>B.Tech, Computer Science Engineering</p>
        <div className="w-full mt-5 space-y-2.5 text-left">
          {[["College", "Sri Krishna Institute of Technology"], ["Department", "Computer Science"], ["Graduation Year", "2026"], ["Location", "Bengaluru, India"]].map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs py-2" style={{ borderBottom: `1px solid ${C.border}` }}>
              <span style={{ color: C.inkSoft }}>{k}</span><span className="font-semibold" style={{ color: C.ink }}>{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 w-full flex items-center gap-3 rounded-xl p-4" style={{ background: C.surfaceAlt }}>
          <BridgeRing value={85} size={54} stroke={5} color={C.accent} />
          <div className="text-left">
            <div className="text-sm font-semibold" style={{ color: C.ink }}>Profile Completion</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>Add certifications to reach 100%</div>
          </div>
        </div>
      </Card>

      <div className="lg:col-span-2 space-y-5">
        <Card>
          <h4 className="font-semibold text-sm mb-2" style={{ color: C.ink }}>About Me</h4>
          <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
            Final-year CSE student focused on data analytics and applied machine learning. Built two dashboard projects using Python and SQL; currently strengthening cloud fundamentals ahead of placements.
          </p>
        </Card>
        <Card>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-semibold text-sm" style={{ color: C.ink }}>Technical Skills</h4>
            <button className="text-xs font-semibold flex items-center gap-1" style={{ color: C.primary }}><PlusCircle size={13} /> Add Skill</button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((s) => <SkillChip key={s} onRemove={() => setSkills(skills.filter((x) => x !== s))}>{s}</SkillChip>)}
          </div>
        </Card>
        <Card>
          <h4 className="font-semibold text-sm mb-3" style={{ color: C.ink }}>Certifications</h4>
          <div className="grid sm:grid-cols-2 gap-3">
            {[["AWS Cloud Practitioner", "Amazon Web Services"], ["Google Data Analytics", "Coursera"]].map(([t, i]) => (
              <div key={t} className="rounded-xl p-3.5 flex items-center gap-3" style={{ background: C.surfaceAlt }}>
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: C.warnSoft }}><Award size={16} color={C.warn} /></div>
                <div><div className="text-xs font-semibold" style={{ color: C.ink }}>{t}</div><div className="text-[11px]" style={{ color: C.inkSoft }}>{i}</div></div>
              </div>
            ))}
          </div>
        </Card>
        <Card>
          <h4 className="font-semibold text-sm mb-3" style={{ color: C.ink }}>Resume</h4>
          <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: C.surfaceAlt, border: `1.5px dashed ${C.border}` }}>
            <div className="flex items-center gap-3">
              <FileText size={18} color={C.inkSoft} />
              <span className="text-sm" style={{ color: C.inkSoft }}>Alex_Johnson_Resume.pdf</span>
            </div>
            <Button size="sm" variant="outline" icon={Upload}>Upload Resume</Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STUDENT — Skill Analysis
--------------------------------------------------------------------------- */

function SkillAnalysis({ setPage }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="f-display text-xl font-bold" style={{ color: C.ink }}>Skill Intelligence</h2>
        <p className="text-sm" style={{ color: C.inkSoft }}>How your current skills measure up against live industry requirements.</p>
      </div>

      <div className="grid lg:grid-cols-5 gap-5">
        <Card className="lg:col-span-2">
          <h3 className="font-semibold text-sm mb-3" style={{ color: C.ink }}>Your Current Skills</h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={STUDENT_SKILLS} outerRadius="75%">
              <PolarGrid stroke={C.border} />
              <PolarAngleAxis dataKey="skill" tick={{ fill: C.inkSoft, fontSize: 10 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fill: C.inkSoft, fontSize: 9 }} />
              <Radar dataKey="value" stroke={C.primary} fill={C.primary} fillOpacity={0.28} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="lg:col-span-3" padded={false}>
          <div className="p-5 pb-0"><h3 className="font-semibold text-sm" style={{ color: C.ink }}>Skill Gap Analysis</h3></div>
          <div className="p-5 overflow-x-auto sb-scroll">
            <table className="w-full text-sm min-w-[420px]">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ color: C.inkSoft }}>
                  <th className="pb-2 font-semibold">Skill</th>
                  <th className="pb-2 font-semibold">Your Level</th>
                  <th className="pb-2 font-semibold">Industry Req.</th>
                  <th className="pb-2 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody>
                {SKILL_GAP_TABLE.map((r) => (
                  <tr key={r.skill} style={{ borderTop: `1px solid ${C.border}` }}>
                    <td className="py-3 font-medium" style={{ color: C.ink }}>{r.skill}</td>
                    <td className="py-3 f-mono" style={{ color: C.ink }}>{r.your}%</td>
                    <td className="py-3 f-mono" style={{ color: C.inkSoft }}>{r.industry}%</td>
                    <td className="py-3"><StatusBadge status={r.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      <Card style={{ background: C.violetSoft, border: "none" }} className="flex items-start gap-4">
        <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.violet }}>
          <Sparkles size={17} color="#fff" />
        </div>
        <div className="flex-1">
          <div className="text-xs font-semibold uppercase tracking-wide mb-1" style={{ color: C.violet }}>AI Insight</div>
          <p className="text-sm" style={{ color: C.ink }}>Based on current industry requirements, improving <strong>Machine Learning</strong> and <strong>Cloud Computing</strong> could increase your job match opportunities by an estimated 15–20%.</p>
          <div className="mt-3"><Button size="sm" variant="dark" icon={GraduationCap} onClick={() => setPage("learning")}>Explore Recommended Learning</Button></div>
        </div>
      </Card>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STUDENT — Opportunities (Internships / Jobs) + Details modal
--------------------------------------------------------------------------- */

function OpportunityCard({ o, bookmarked, onBookmark, onView }) {
  return (
    <Card className="sb-fade-up flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm f-mono text-white" style={{ background: o.color }}>{o.company[0]}</div>
          <div>
            <div className="font-semibold text-sm" style={{ color: C.ink }}>{o.role}</div>
            <div className="text-xs" style={{ color: C.inkSoft }}>{o.company}</div>
          </div>
        </div>
        <button onClick={() => onBookmark(o.id)}>
          {bookmarked ? <BookmarkCheck size={18} color={C.primary} /> : <Bookmark size={18} color={C.inkSoft} />}
        </button>
      </div>
      <div className="flex flex-wrap gap-3 text-xs" style={{ color: C.inkSoft }}>
        <span className="flex items-center gap-1"><MapPin size={12} />{o.location}</span>
        <span className="flex items-center gap-1"><Clock size={12} />{o.duration}</span>
        <span className="flex items-center gap-1"><IndianRupee size={12} />{o.salary}</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {o.skills.map((s) => <span key={s} className="text-[10px] px-2 py-0.5 rounded-md font-medium" style={{ background: C.surfaceAlt, color: C.inkSoft }}>{s}</span>)}
      </div>
      <div className="flex items-center justify-between pt-2" style={{ borderTop: `1px solid ${C.border}` }}>
        <div className="flex items-center gap-2">
          <BridgeRing value={o.match} size={36} stroke={4} color={o.match >= 80 ? C.accent : o.match >= 60 ? C.warn : C.danger} />
          <span className="text-xs font-semibold" style={{ color: C.inkSoft }}>Match Score</span>
        </div>
        <Button size="sm" variant="outline" onClick={() => onView(o)}>View Details</Button>
      </div>
    </Card>
  );
}

function Opportunities({ initialType = "Internship", onView }) {
  const [type, setType] = useState(initialType);
  const [query, setQuery] = useState("");
  const [domain, setDomain] = useState("All");
  const [remote, setRemote] = useState("All");
  const [bookmarks, setBookmarks] = useState([2, 4]);

  const domains = ["All", ...Array.from(new Set(OPPORTUNITIES.map((o) => o.domain)))];
  const list = OPPORTUNITIES.filter((o) =>
    o.type === type &&
    (domain === "All" || o.domain === domain) &&
    (remote === "All" || o.remote === remote) &&
    (o.role.toLowerCase().includes(query.toLowerCase()) || o.company.toLowerCase().includes(query.toLowerCase()) || o.skills.some((s) => s.toLowerCase().includes(query.toLowerCase())))
  ).sort((a, b) => b.match - a.match);

  const toggleBookmark = (id) => setBookmarks((b) => (b.includes(id) ? b.filter((x) => x !== id) : [...b, id]));

  return (
    <div className="space-y-5">
      <div>
        <h2 className="f-display text-xl font-bold" style={{ color: C.ink }}>{type === "Internship" ? "Find Your Next Internship" : "Placement Opportunities"}</h2>
        <p className="text-sm" style={{ color: C.inkSoft }}>Ranked by match score, computed from your skill profile.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Pill active={type === "Internship"} onClick={() => setType("Internship")}>Internships</Pill>
        <Pill active={type === "Job"} onClick={() => setType("Job")}>Jobs</Pill>
      </div>

      <Card padded={false}>
        <div className="p-4 flex flex-col md:flex-row gap-3">
          <div className="flex-1 flex items-center gap-2 px-3.5 py-2.5 rounded-xl" style={{ background: C.surfaceAlt }}>
            <Search size={15} color={C.inkSoft} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by role, company, or skill" className="bg-transparent outline-none text-sm w-full" />
          </div>
          <div className="flex gap-2 flex-wrap">
            <select value={domain} onChange={(e) => setDomain(e.target.value)} className="px-3 py-2.5 rounded-xl text-xs font-medium outline-none" style={{ background: C.surfaceAlt, color: C.ink }}>
              {domains.map((d) => <option key={d}>{d}</option>)}
            </select>
            <select value={remote} onChange={(e) => setRemote(e.target.value)} className="px-3 py-2.5 rounded-xl text-xs font-medium outline-none" style={{ background: C.surfaceAlt, color: C.ink }}>
              {["All", "Remote", "On-site", "Hybrid"].map((d) => <option key={d}>{d}</option>)}
            </select>
            <button className="px-3 py-2.5 rounded-xl text-xs font-medium flex items-center gap-1.5" style={{ background: C.surfaceAlt, color: C.inkSoft }}><Filter size={13} /> More</button>
          </div>
        </div>
      </Card>

      <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {list.map((o) => <OpportunityCard key={o.id} o={o} bookmarked={bookmarks.includes(o.id)} onBookmark={toggleBookmark} onView={onView} />)}
        {list.length === 0 && <p className="text-sm col-span-full text-center py-10" style={{ color: C.inkSoft }}>No opportunities match your filters.</p>}
      </div>
    </div>
  );
}

function OpportunityDetails({ o, onBack, onApply }) {
  const matched = o.skills.slice(0, Math.ceil(o.skills.length * 0.6));
  const toImprove = o.skills.filter((s) => !matched.includes(s));
  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: C.primary }}><ChevronLeft size={15} /> Back to listings</button>
      <Card>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-lg f-mono text-white" style={{ background: o.color }}>{o.company[0]}</div>
            <div>
              <h2 className="f-display text-xl font-bold" style={{ color: C.ink }}>{o.role}</h2>
              <p className="text-sm" style={{ color: C.inkSoft }}>{o.company} · {o.location} · {o.remote}</p>
            </div>
          </div>
          <BridgeRing value={o.match} size={64} stroke={6} color={o.match >= 80 ? C.accent : C.warn} sub="Match" />
        </div>
      </Card>

      <div className="grid lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Card>
            <h4 className="font-semibold text-sm mb-2" style={{ color: C.ink }}>Description</h4>
            <p className="text-sm leading-relaxed" style={{ color: C.inkSoft }}>
              Work with the {o.domain} team to deliver production-quality outcomes, collaborating closely with senior engineers and analysts across {o.company}'s {o.location} office.
            </p>
            <h4 className="font-semibold text-sm mt-4 mb-2" style={{ color: C.ink }}>Responsibilities</h4>
            <ul className="text-sm space-y-1.5" style={{ color: C.inkSoft }}>
              <li>• Collect, clean, and analyze real-world datasets</li>
              <li>• Build dashboards and reports for stakeholder review</li>
              <li>• Collaborate with cross-functional teams on live projects</li>
            </ul>
          </Card>
          <Card>
            <h4 className="font-semibold text-sm mb-3" style={{ color: C.ink }}>Your Skill Match</h4>
            <div className="mb-3">
              <div className="text-xs font-semibold uppercase mb-1.5" style={{ color: C.accentDark }}>Matched Skills</div>
              <div className="flex flex-wrap gap-2">
                {matched.map((s) => <span key={s} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.accentSoft, color: C.accentDark }}><CheckCircle2 size={12} />{s}</span>)}
              </div>
            </div>
            {toImprove.length > 0 && (
              <div>
                <div className="text-xs font-semibold uppercase mb-1.5" style={{ color: C.warn }}>Skills to Improve</div>
                <div className="flex flex-wrap gap-2">
                  {toImprove.map((s) => <span key={s} className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: C.warnSoft, color: C.warn }}><AlertTriangle size={12} />{s}</span>)}
                </div>
              </div>
            )}
          </Card>
        </div>
        <div className="space-y-5">
          <Card>
            <h4 className="font-semibold text-sm mb-3" style={{ color: C.ink }}>Details</h4>
            <div className="space-y-2.5 text-xs">
              {[["Type", o.type], ["Duration", o.duration], ["Stipend / Salary", o.salary], ["Eligibility", o.eligibility || "Open to all final-year students"], ["Deadline", "15 Sept 2026"]].map(([k, v]) => (
                <div key={k} className="flex justify-between py-1.5" style={{ borderBottom: `1px solid ${C.border}` }}>
                  <span style={{ color: C.inkSoft }}>{k}</span><span className="font-semibold text-right" style={{ color: C.ink }}>{v}</span>
                </div>
              ))}
            </div>
            <Button full size="lg" icon={Send} onClick={() => onApply(o)}>Apply Now</Button>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STUDENT — Application Tracker
--------------------------------------------------------------------------- */

const STAGES = ["Applied", "Under Review", "Shortlisted", "Interview", "Selected"];
const STAGE_COLORS = [C.inkSoft, C.primary, C.violet, C.warn, C.accent];

function ApplicationTracker({ applications }) {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? applications : applications.filter((a) => a.category === filter);
  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="f-display text-xl font-bold" style={{ color: C.ink }}>Application Tracker</h2>
          <p className="text-sm" style={{ color: C.inkSoft }}>Track every application from submission to selection.</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {["All", "Internship", "Job"].map((f) => <Pill key={f} active={filter === f} onClick={() => setFilter(f)}>{f}</Pill>)}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {STAGES.map((stage, i) => (
          <div key={stage}>
            <div className="flex items-center gap-2 mb-3">
              <span className="w-2 h-2 rounded-full" style={{ background: STAGE_COLORS[i] }} />
              <h4 className="text-xs font-semibold uppercase tracking-wide" style={{ color: C.inkSoft }}>{stage}</h4>
              <span className="text-[10px] f-mono px-1.5 rounded" style={{ background: C.surfaceAlt, color: C.inkSoft }}>{filtered.filter((a) => a.stage === stage).length}</span>
            </div>
            <div className="space-y-3">
              {filtered.filter((a) => a.stage === stage).map((a) => (
                <Card key={a.id} className="sb-fade-up">
                  <div className="text-sm font-semibold" style={{ color: C.ink }}>{a.role}</div>
                  <div className="text-xs mt-0.5" style={{ color: C.inkSoft }}>{a.company}</div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ background: C.surfaceAlt, color: C.inkSoft }}>{a.category}</span>
                    <span className="f-mono text-xs font-semibold" style={{ color: C.primary }}>{a.match}%</span>
                  </div>
                </Card>
              ))}
              {filtered.filter((a) => a.stage === stage).length === 0 && (
                <div className="rounded-xl p-4 text-center text-xs" style={{ border: `1.5px dashed ${C.border}`, color: C.inkSoft }}>Empty</div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   STUDENT — Recommended Learning
--------------------------------------------------------------------------- */

function RecommendedLearning({ onToast }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="f-display text-xl font-bold" style={{ color: C.ink }}>Improve Your Skills</h2>
        <p className="text-sm" style={{ color: C.inkSoft }}>Recommendations based on your career goals and skill gaps.</p>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {COURSES.map((c) => (
          <Card key={c.id} className="sb-fade-up flex flex-col gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${c.color}1A` }}>
              <c.icon size={19} color={c.color} />
            </div>
            <div>
              <div className="font-semibold text-sm" style={{ color: C.ink }}>{c.title}</div>
              <div className="text-xs mt-1 flex items-center gap-1" style={{ color: C.danger }}><AlertTriangle size={11} /> Skill Gap: {c.gap}</div>
            </div>
            <div className="flex items-center gap-3 text-xs" style={{ color: C.inkSoft }}>
              <span className="flex items-center gap-1"><Clock size={12} />{c.weeks} Weeks</span>
              <span className="px-1.5 py-0.5 rounded" style={{ background: C.surfaceAlt }}>{c.difficulty}</span>
            </div>
            <div>
              <div className="h-1.5 rounded-full" style={{ background: C.surfaceAlt }}>
                <div className="h-1.5 rounded-full" style={{ width: `${c.progress}%`, background: c.color }} />
              </div>
              <div className="text-[10px] mt-1 f-mono" style={{ color: C.inkSoft }}>{c.progress}% complete</div>
            </div>
            <Button size="sm" full onClick={() => onToast(`Started "${c.title}"`)}>{c.progress > 0 ? "Continue Learning" : "Start Learning"}</Button>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   INSTITUTION DASHBOARD
--------------------------------------------------------------------------- */

function InstitutionDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users} label="Total Students" value="2,450" color={C.violet} soft={C.violetSoft} />
        <StatCard icon={CheckCircle2} label="Placement Ready" value="1,280" delta="+6%" color={C.accent} soft={C.accentSoft} />
        <StatCard icon={Briefcase} label="Active Internships" value="145" color={C.primary} soft={C.primarySoft} />
        <StatCard icon={Award} label="Placement Rate" value="78%" delta="+3%" color={C.warn} soft={C.warnSoft} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Department-wise Skill Readiness</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={DEPT_READINESS}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="dept" tick={{ fill: C.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Bar dataKey="ready" fill={C.violet} radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Most Common Skill Gaps</h3>
          {SKILL_GAP_INSTITUTION.map((g) => <SkillBar key={g.skill} label={g.skill} value={g.pct} color={C.danger} />)}
          <div className="mt-5 pt-4" style={{ borderTop: `1px solid ${C.border}` }}>
            <h4 className="text-xs font-semibold uppercase tracking-wide mb-2.5" style={{ color: C.inkSoft }}>Top Industry Demanded Skills</h4>
            <div className="flex flex-wrap gap-2">
              {DEMANDED_SKILLS.map((s, i) => <span key={s.name} className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${DEMAND_COLORS[i]}1A`, color: DEMAND_COLORS[i] }}>{s.name}</span>)}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card>
          <h3 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Internship Participation</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={INTERNSHIP_PARTICIPATION}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Line type="monotone" dataKey="count" stroke={C.primary} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
        <Card>
          <h3 className="font-semibold text-sm mb-4" style={{ color: C.ink }}>Placement Trends</h3>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={PLACEMENT_TREND}>
              <CartesianGrid strokeDasharray="3 3" stroke={C.border} vertical={false} />
              <XAxis dataKey="month" tick={{ fill: C.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: C.inkSoft, fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ borderRadius: 10, border: `1px solid ${C.border}`, fontSize: 12 }} />
              <Line type="monotone" dataKey="rate" stroke={C.accent} strokeWidth={2.5} dot={{ r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </div>
  );
}

function InstitutionStudents() {
  const rows = [
    { name: "Alex Johnson", dept: "CSE", score: 78, status: "Placement Ready" },
    { name: "Priya Sharma", dept: "IT", score: 82, status: "Placement Ready" },
    { name: "Rahul Kumar", dept: "ECE", score: 58, status: "In Progress" },
    { name: "Sneha Reddy", dept: "CSE", score: 88, status: "Placement Ready" },
    { name: "Arjun Mehta", dept: "Mech", score: 41, status: "Needs Support" },
  ];
  return (
    <Card padded={false}>
      <div className="p-5 flex items-center justify-between">
        <h3 className="font-semibold text-sm" style={{ color: C.ink }}>Students</h3>
        <span className="text-xs f-mono" style={{ color: C.inkSoft }}>2,450 total</span>
      </div>
      <div className="overflow-x-auto sb-scroll">
        <table className="w-full text-sm min-w-[520px]">
          <thead><tr className="text-left text-xs uppercase" style={{ color: C.inkSoft }}><th className="px-5 pb-3 font-semibold">Name</th><th className="pb-3 font-semibold">Dept</th><th className="pb-3 font-semibold">Skill Score</th><th className="pb-3 font-semibold">Status</th></tr></thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} style={{ borderTop: `1px solid ${C.border}` }}>
                <td className="px-5 py-3 font-medium" style={{ color: C.ink }}>{r.name}</td>
                <td className="py-3" style={{ color: C.inkSoft }}>{r.dept}</td>
                <td className="py-3 f-mono" style={{ color: C.ink }}>{r.score}%</td>
                <td className="py-3"><StatusBadge status={r.status === "Placement Ready" ? "Strong" : r.status === "In Progress" ? "Needs Improvement" : "Skill Gap"} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function InstitutionReports() {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {["Placement Summary — Aug 2026", "Skill Gap Report — CSE Dept", "Industry Demand Snapshot", "Internship Participation Log", "Recruiter Engagement Report", "Certification Uptake Report"].map((r) => (
        <Card key={r} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.violetSoft }}><FileText size={17} color={C.violet} /></div>
          <div className="flex-1 min-w-0"><div className="text-sm font-semibold truncate" style={{ color: C.ink }}>{r}</div><div className="text-xs" style={{ color: C.inkSoft }}>PDF · Updated today</div></div>
          <Eye size={16} color={C.inkSoft} />
        </Card>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   RECRUITER — Dashboard, Post Opportunity, Candidate Matching
--------------------------------------------------------------------------- */

function RecruiterDashboard({ setPage }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Briefcase} label="Active Opportunities" value="12" color={C.accent} soft={C.accentSoft} />
        <StatCard icon={Users} label="Total Applicants" value="430" delta="+18%" color={C.primary} soft={C.primarySoft} />
        <StatCard icon={CheckCircle2} label="Shortlisted" value="68" color={C.violet} soft={C.violetSoft} />
        <StatCard icon={Target} label="Interviews" value="24" color={C.warn} soft={C.warnSoft} />
      </div>

      <Card padded={false}>
        <div className="p-5 flex items-center justify-between">
          <h3 className="font-semibold text-sm" style={{ color: C.ink }}>Top Candidate Matches</h3>
          <button onClick={() => setPage("matching")} className="text-xs font-semibold flex items-center gap-1" style={{ color: C.primary }}>Open matching <ChevronRight size={13} /></button>
        </div>
        <div className="p-5 pt-0 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {CANDIDATES.slice(0, 3).map((c) => (
            <div key={c.id} className="rounded-xl p-4" style={{ background: C.surfaceAlt }}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs f-mono text-white" style={{ background: C.accent }}>{c.name.split(" ").map(w => w[0]).join("")}</div>
                  <div><div className="text-sm font-semibold" style={{ color: C.ink }}>{c.name}</div><div className="text-[11px]" style={{ color: C.inkSoft }}>{c.college}</div></div>
                </div>
                <BridgeRing value={c.match} size={38} stroke={4} color={C.accent} />
              </div>
              <div className="space-y-1.5">
                {c.skills.map((s) => <div key={s.n} className="flex justify-between text-[11px]"><span style={{ color: C.inkSoft }}>{s.n}</span><span className="f-mono font-semibold" style={{ color: C.ink }}>{s.v}%</span></div>)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function PostOpportunity({ onToast }) {
  const [oppType, setOppType] = useState("Internship");
  const [skills, setSkills] = useState(["Python", "SQL"]);
  const [skillInput, setSkillInput] = useState("");

  const addSkill = () => { if (skillInput.trim()) { setSkills([...skills, skillInput.trim()]); setSkillInput(""); } };

  return (
    <div className="max-w-3xl">
      <h2 className="f-display text-xl font-bold mb-1" style={{ color: C.ink }}>Post an Opportunity</h2>
      <p className="text-sm mb-5" style={{ color: C.inkSoft }}>Fill in the details — SkillBridge will start ranking matching candidates immediately.</p>
      <Card>
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onToast("Opportunity published successfully"); }}>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.ink }}>Opportunity Type</label>
            <div className="flex gap-2 mt-1.5">
              {["Internship", "Full-Time Job"].map((t) => <Pill key={t} active={oppType === t} onClick={() => setOppType(t)}>{t}</Pill>)}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Job Title</label>
              <input defaultValue="Data Analyst Intern" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Company</label>
              <input defaultValue="TechNova" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
            </div>
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.ink }}>Description</label>
            <textarea rows={3} defaultValue="Work with our analytics team on real customer datasets, building dashboards and predictive reports." className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none resize-none" style={{ border: `1.5px solid ${C.border}` }} />
          </div>
          <div>
            <label className="text-xs font-semibold" style={{ color: C.ink }}>Required Skills</label>
            <div className="flex flex-wrap gap-2 mt-1.5 mb-2">
              {skills.map((s) => <SkillChip key={s} onRemove={() => setSkills(skills.filter((x) => x !== s))}>{s}</SkillChip>)}
            </div>
            <div className="flex gap-2">
              <input value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())} placeholder="Type a skill and press Enter" className="flex-1 px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
              <Button variant="outline" icon={Tag} onClick={addSkill}>Add</Button>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Minimum Skill Level</label>
              <select className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }}>
                <option>Beginner (40%+)</option><option>Intermediate (60%+)</option><option>Advanced (80%+)</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Location</label>
              <input defaultValue="Bengaluru" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Duration</label>
              <input defaultValue="3 Months" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Salary / Stipend</label>
              <input defaultValue="₹18,000/mo" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
            </div>
            <div>
              <label className="text-xs font-semibold" style={{ color: C.ink }}>Deadline</label>
              <input type="date" defaultValue="2026-09-15" className="mt-1.5 w-full px-3.5 py-2.5 rounded-xl text-sm outline-none" style={{ border: `1.5px solid ${C.border}` }} />
            </div>
          </div>
          <Button type="submit" size="lg" icon={Send}>Publish Opportunity</Button>
        </form>
      </Card>
    </div>
  );
}

function CandidateMatching({ onShortlist, shortlisted }) {
  const [selectedOpp, setSelectedOpp] = useState(OPPORTUNITIES[0].id);
  const opp = OPPORTUNITIES.find((o) => o.id === selectedOpp);
  const ranked = [...CANDIDATES].sort((a, b) => b.match - a.match);

  return (
    <div className="space-y-5">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-3">
        <div>
          <h2 className="f-display text-xl font-bold" style={{ color: C.ink }}>Smart Candidate Matching</h2>
          <p className="text-sm" style={{ color: C.inkSoft }}>Candidates ranked automatically once you select an opportunity.</p>
        </div>
        <select value={selectedOpp} onChange={(e) => setSelectedOpp(Number(e.target.value))} className="px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none" style={{ border: `1.5px solid ${C.border}`, background: C.surface }}>
          {OPPORTUNITIES.map((o) => <option key={o.id} value={o.id}>{o.role} — {o.company}</option>)}
        </select>
      </div>

      <Card style={{ background: C.primarySoft, border: "none" }} className="flex items-center gap-3">
        <Info size={16} color={C.primary} className="flex-shrink-0" />
        <p className="text-xs" style={{ color: C.primaryDark }}>Match score is calculated based on required skills, skill proficiency, education, and eligibility for <strong>{opp.role}</strong>.</p>
      </Card>

      <div className="space-y-3">
        {ranked.map((c, i) => (
          <Card key={c.id} className="sb-fade-up flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className="f-mono text-xs font-bold w-6" style={{ color: C.inkSoft }}>#{i + 1}</span>
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs f-mono text-white flex-shrink-0" style={{ background: [C.primary, C.accent, C.violet][i % 3] }}>{c.name.split(" ").map(w => w[0]).join("")}</div>
              <div className="min-w-0">
                <div className="text-sm font-semibold" style={{ color: C.ink }}>{c.name}</div>
                <div className="text-xs truncate" style={{ color: C.inkSoft }}>{c.college}</div>
              </div>
            </div>
            <div className="flex gap-4 flex-wrap flex-1">
              {c.skills.map((s) => (
                <div key={s.n} className="min-w-[86px]">
                  <div className="text-[10px] mb-1" style={{ color: C.inkSoft }}>{s.n}</div>
                  <div className="h-1.5 rounded-full w-20" style={{ background: C.surfaceAlt }}>
                    <div className="h-1.5 rounded-full" style={{ width: `${s.v}%`, background: C.accent }} />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <BridgeRing value={c.match} size={44} stroke={4} color={c.match >= 85 ? C.accent : C.warn} />
              <div className="flex flex-col gap-1.5">
                <Button size="sm" variant="outline" icon={Eye}>View Profile</Button>
                <Button size="sm" variant={shortlisted.includes(c.id) ? "accent" : "primary"} icon={ShieldCheck} onClick={() => onShortlist(c.id, c.name)}>
                  {shortlisted.includes(c.id) ? "Shortlisted" : "Shortlist"}
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   ROOT APP
--------------------------------------------------------------------------- */

export default function App() {
  const [screen, setScreen] = useState("landing"); // landing | login | app
  const [role, setRole] = useState("student");
  const [page, setPage] = useState("dashboard");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [viewingOpp, setViewingOpp] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [shortlisted, setShortlisted] = useState([1]);
  const [applications, setApplications] = useState([
    { id: 1, role: "Data Analyst Intern", company: "TechNova", category: "Internship", match: 92, stage: "Shortlisted" },
    { id: 2, role: "Software Developer", company: "CodeWorks", category: "Job", match: 79, stage: "Under Review" },
    { id: 3, role: "Data Science Intern", company: "InnovateLabs", category: "Internship", match: 91, stage: "Applied" },
    { id: 4, role: "Junior Data Analyst", company: "FinEdge Analytics", category: "Job", match: 88, stage: "Interview" },
  ]);

  const pushToast = useCallback((msg) => {
    const id = Date.now();
    setToasts((t) => [...t, { id, msg }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2800);
  }, []);

  const applyToOpportunity = useCallback((o) => {
    setApplications((apps) => {
      if (apps.some((a) => a.role === o.role && a.company === o.company)) return apps;
      return [...apps, { id: Date.now(), role: o.role, company: o.company, category: o.type, match: o.match, stage: "Applied" }];
    });
    pushToast(`Applied to ${o.role} at ${o.company}`);
    setViewingOpp(null);
  }, [pushToast]);

  const enterApp = (r) => { setRole(r); setPage("dashboard"); setScreen("app"); setViewingOpp(null); };
  const shortlistCandidate = (id, name) => {
    setShortlisted((s) => (s.includes(id) ? s : [...s, id]));
    pushToast(`${name} added to shortlist`);
  };

  if (screen === "landing") return <Landing onLogin={() => setScreen("login")} onExplore={() => setScreen("login")} />;
  if (screen === "login") return <Login onEnter={enterApp} onBack={() => setScreen("landing")} />;

  const TITLES = {
    student: { dashboard: ["Dashboard", "Your personalized overview"], profile: ["My Profile", "Manage your academic & skill profile"], analysis: ["Skill Analysis", null], internships: [null, null], jobs: [null, null], applications: ["Applications", null], learning: ["Learning", null] },
    institution: { dashboard: ["Institution Dashboard", "Sri Krishna Institute of Technology"], students: ["Students", "2,450 enrolled across 5 departments"], analytics: ["Skill Analytics", "Department and industry-level insight"], reports: ["Reports", "Exportable placement & skill reports"] },
    recruiter: { dashboard: ["Recruiter Dashboard", "TechNova Pvt Ltd"], post: ["Post Opportunity", null], matching: ["Candidate Matching", null] },
  };
  const [title, subtitle] = TITLES[role][page] || [page, null];

  let content;
  if (viewingOpp) {
    content = <OpportunityDetails o={viewingOpp} onBack={() => setViewingOpp(null)} onApply={applyToOpportunity} />;
  } else if (role === "student") {
    content = {
      dashboard: <StudentDashboard setPage={setPage} onApply={setViewingOpp} />,
      profile: <StudentProfile />,
      analysis: <SkillAnalysis setPage={setPage} />,
      internships: <Opportunities initialType="Internship" onView={setViewingOpp} />,
      jobs: <Opportunities initialType="Job" onView={setViewingOpp} />,
      applications: <ApplicationTracker applications={applications} />,
      learning: <RecommendedLearning onToast={pushToast} />,
    }[page];
  } else if (role === "institution") {
    content = {
      dashboard: <InstitutionDashboard />,
      students: <InstitutionStudents />,
      analytics: <InstitutionDashboard />,
      reports: <InstitutionReports />,
    }[page];
  } else {
    content = {
      dashboard: <RecruiterDashboard setPage={setPage} />,
      post: <PostOpportunity onToast={pushToast} />,
      matching: <CandidateMatching onShortlist={shortlistCandidate} shortlisted={shortlisted} />,
    }[page];
  }

  return (
    <div className="flex f-body" style={{ background: C.bg, minHeight: "100vh" }}>
      {FONTS}
      <Toasts toasts={toasts} />
      <Sidebar role={role} page={page} setPage={(p) => { setPage(p); setViewingOpp(null); }} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} goLanding={() => setScreen("landing")} />
      <div className="flex-1 min-w-0">
        <Topbar title={viewingOpp ? "Opportunity Details" : title} subtitle={viewingOpp ? null : subtitle} setMobileOpen={setMobileOpen} role={role} />
        <main className="p-5 lg:p-8 max-w-7xl mx-auto">
          {content}
        </main>
      </div>
    </div>
  );
}
