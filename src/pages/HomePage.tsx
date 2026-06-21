import { SignInButton, useAuth, useClerk } from "@clerk/react";
import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

export default function HomePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const { openSignIn } = useClerk();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isSignedIn) navigate("/dashboard");
    else openSignIn({ fallbackRedirectUrl: "/dashboard" });
  };
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lineSvgRef = useRef<SVGSVGElement>(null);
  const lineFillRef = useRef<SVGPathElement>(null);
  const lineStrokeRef = useRef<SVGPathElement>(null);
  const donutRef = useRef<SVGSVGElement>(null);

  // Redirect already-authenticated users straight to the app
  useEffect(() => {
    if (isLoaded && isSignedIn) navigate("/dashboard", { replace: true });
  }, [isLoaded, isSignedIn, navigate]);

  // Hero particle stream animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    let W = 0, H = 0, rafId = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const resize = () => {
      const rect = canvas.parentElement!.getBoundingClientRect();
      W = canvas.width  = rect.width;
      H = canvas.height = rect.height;
    };

    interface P { x: number; y: number; baseY: number; speed: number; amp: number; freq: number; phase: number; size: number; alpha: number; }
    const particles: P[] = [];

    const reset = (p: P, randomX: boolean) => {
      p.x      = randomX ? Math.random() * W : -8;
      p.baseY  = Math.random() * H;
      p.y      = p.baseY;
      p.speed  = 0.35 + Math.random() * 0.8;
      p.amp    = 15   + Math.random() * 45;
      p.freq   = 0.004 + Math.random() * 0.008;
      p.phase  = Math.random() * Math.PI * 2;
      p.size   = 1    + Math.random() * 1.8;
      p.alpha  = 0.18 + Math.random() * 0.38;
    };

    for (let i = 0; i < 55; i++) {
      const p: P = {} as P;
      resize();
      reset(p, true);
      particles.push(p);
    }

    const animate = () => {
      ctx.clearRect(0, 0, W, H);
      for (const p of particles) {
        p.x += p.speed;
        p.y = p.baseY + Math.sin(p.phase + p.x * p.freq) * p.amp;
        if (p.x > W + 10) reset(p, false);
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(123,108,244,${p.alpha})`;
        ctx.fill();
      }
      rafId = requestAnimationFrame(animate);
    };

    window.addEventListener("resize", resize);
    resize();
    if (!reduced) animate();
    return () => { cancelAnimationFrame(rafId); window.removeEventListener("resize", resize); };
  }, []);

  // Build SVG donut chart
  useEffect(() => {
    const svg = donutRef.current;
    if (!svg) return;
    const segs = [
      { pct: 0.452, color: "#7b6cf4" },
      { pct: 0.221, color: "#5a4de0" },
      { pct: 0.157, color: "#f59e3a" },
      { pct: 0.098, color: "#3b82f6" },
      { pct: 0.072, color: "#3c4470" },
    ];
    const cx = 35, cy = 35, R = 31, r = 18;
    let start = -Math.PI / 2;
    let html = "";
    for (const s of segs) {
      const angle = s.pct * 2 * Math.PI;
      const end = start + angle;
      const x1 = cx + R * Math.cos(start), y1 = cy + R * Math.sin(start);
      const x2 = cx + R * Math.cos(end),   y2 = cy + R * Math.sin(end);
      const ix1 = cx + r * Math.cos(start), iy1 = cy + r * Math.sin(start);
      const ix2 = cx + r * Math.cos(end),   iy2 = cy + r * Math.sin(end);
      const large = angle > Math.PI ? 1 : 0;
      html += `<path d="M${x1},${y1} A${R},${R} 0 ${large},1 ${x2},${y2} L${ix2},${iy2} A${r},${r} 0 ${large},0 ${ix1},${iy1} Z" fill="${s.color}"/>`;
      start = end;
    }
    svg.innerHTML = html;
  }, []);

  // Build SVG line chart — runs after layout so clientWidth/clientHeight are valid
  useEffect(() => {
    const build = () => {
      const svg = lineSvgRef.current;
      const fill = lineFillRef.current;
      const stroke = lineStrokeRef.current;
      if (!svg || !fill || !stroke) return;
      const W = svg.clientWidth;
      const H = svg.clientHeight;
      if (!W || !H) { setTimeout(build, 50); return; }

      svg.setAttribute("viewBox", `0 0 ${W} ${H}`);

      const raw = [28, 33, 25, 40, 36, 48, 44, 56, 52, 65, 60, 72, 68, 80, 76, 88, 82, 92];
      const pL = 4, pR = 4, pT = 6, pB = 6;
      const cW = W - pL - pR, cH = H - pT - pB;

      const pts = raw.map((v, i) => ({
        x: pL + (i / (raw.length - 1)) * cW,
        y: pT + (1 - v / 100) * cH,
      }));

      let d = `M${pts[0].x.toFixed(1)},${pts[0].y.toFixed(1)}`;
      for (let i = 1; i < pts.length; i++) {
        const mx = ((pts[i - 1].x + pts[i].x) / 2).toFixed(1);
        d += ` C${mx},${pts[i-1].y.toFixed(1)} ${mx},${pts[i].y.toFixed(1)} ${pts[i].x.toFixed(1)},${pts[i].y.toFixed(1)}`;
      }

      stroke.setAttribute("d", d);
      const last = pts[pts.length - 1];
      fill.setAttribute("d", `${d} L${last.x},${H} L${pts[0].x},${H} Z`);
    };

    build();
    window.addEventListener("resize", build);
    return () => window.removeEventListener("resize", build);
  }, []);

  if (isLoaded && isSignedIn) return null;

  return (
    <div className="hp">
      {/* ── NAVBAR ──────────────────────────────────────────── */}
      <nav className="hp-nav">
        <a className="hp-nav-logo" href="#">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <path d="M3 17 L7.5 9.5 L12 13.5 L16.5 6 L21 13" stroke="#7b6cf4" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="13" r="2.2" fill="#7b6cf4"/>
          </svg>
          Event<span className="m">Lens</span>
        </a>

        <ul className="hp-nav-links">
          {[
            { label: "Features",     href: "#features" },
            { label: "Architecture", href: "/arch" },
            { label: "Docs",         href: "/docs" },
            { label: "Blogs",        href: "https://heyankit.hashnode.dev/series/learning-backend-systems" },
          ].map(({ label, href }) => (
            <li key={label}><a href={href} {...(href.startsWith("http") ? { target: "_blank", rel: "noreferrer" } : {})}>{label}</a></li>
          ))}
        </ul>

        <div className="hp-nav-right">
          <a className="hp-btn hp-btn-ghost" href="https://github.com/ydv-ankit/eventlens" target="_blank" rel="noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <button className="hp-btn hp-btn-primary" onClick={handleGetStarted}>Get Started</button>
        </div>
      </nav>

      {/* ── HERO ────────────────────────────────────────────── */}
      <section className="hp-hero">
        <canvas ref={canvasRef} className="hp-hero-canvas" />
        <div className="hp-hero-glow" />

        <div className="hp-hero-inner">
          {/* Left */}
          <div>
            <div className="hp-badge">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor">
                <path d="M6 0L7.545 4.455H12L8.25 7.08L9.75 11.52L6 9L2.25 11.52L3.75 7.08L0 4.455H4.455Z"/>
              </svg>
              Open Source Analytics Platform
            </div>

            <h1 className="hp-h1">
              Event Analytics<br/>
              <span className="grad">Built for Scale</span>
            </h1>

            <p className="hp-desc">
              High-throughput event ingestion and real-time analytics. Collect every user action, explore it instantly, and understand your product at any scale — from one project to millions of events per minute.
            </p>

            <div className="hp-cta">
              <button className="hp-btn hp-btn-primary hp-btn-lg" onClick={handleGetStarted}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Get Started
              </button>
              <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
                <button className="hp-btn hp-btn-ghost hp-btn-lg">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                  </svg>
                  Sign In
                </button>
              </SignInButton>
            </div>

            <div className="hp-pills">
              {["High Throughput", "Real-time Analytics", "Open Source"].map((label) => (
                <span className="hp-pill" key={label}>
                  <svg className="icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                    <circle cx="12" cy="12" r="9"/><polyline points="9 12 11 14 15 10"/>
                  </svg>
                  {label}
                </span>
              ))}
            </div>
          </div>

          {/* Right: dashboard mockup */}
          <div className="hp-mockup-outer">
            <div className="hp-mockup">
              {/* Sidebar */}
              <div className="hp-ms">
                <div className="hp-ms-logo">
                  <svg width="14" height="14" viewBox="0 0 26 26" fill="none">
                    <path d="M3 17 L7.5 9.5 L12 13.5 L16.5 6 L21 13" stroke="#7b6cf4" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Event<span className="m">Lens</span>
                </div>
                {[
                  { label: "Overview",  on: true,  icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg> },
                  { label: "Projects",  on: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg> },
                  { label: "API Keys",  on: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/></svg> },
                  { label: "Events",    on: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/><polyline points="13 2 13 9 20 9"/></svg> },
                  { label: "Analytics", on: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg> },
                  { label: "System",    on: false, icon: <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.07 4.93l-1.41 1.41M5.34 18.66l-1.41 1.41M20 12H22M2 12H4M19.07 19.07l-1.41-1.41M5.34 5.34L3.93 3.93M12 20v2M12 2V4"/></svg> },
                ].map(({ label, on, icon }) => (
                  <div key={label} className={`hp-ms-item${on ? " on" : ""}`}>
                    {icon}{label}
                  </div>
                ))}
              </div>

              {/* Main panel */}
              <div className="hp-mm">
                <div className="hp-mm-top">
                  <span className="hp-mm-title">Overview</span>
                  <span className="hp-mm-filter">
                    Last 1 hour
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>
                  </span>
                </div>

                <div className="hp-kpis">
                  {[
                    { lbl: "Events Ingested", val: "1.23M", sub: "↑ 12.5%", cls: "hp-up" },
                    { lbl: "Events / sec",    val: "5,432", sub: "↑ 8.3%",  cls: "hp-up" },
                    { lbl: "Active Users",    val: "12.4K", sub: "↑ 15.7%", cls: "hp-up" },
                    { lbl: "Error Rate",      val: "0.02%", sub: "↓ 32.1%", cls: "hp-dn" },
                  ].map(({ lbl, val, sub, cls }) => (
                    <div key={lbl} className="hp-kpi">
                      <div className="hp-kpi-lbl">{lbl}</div>
                      <div className="hp-kpi-val">{val}</div>
                      <div className={`hp-kpi-sub ${cls}`}>{sub}</div>
                    </div>
                  ))}
                </div>

                <div className="hp-charts">
                  <div className="hp-ccard">
                    <div className="hp-ccard-title">Events Over Time</div>
                    <svg
                      ref={lineSvgRef}
                      style={{ flex: 1, width: "100%", minHeight: 0 }}
                      preserveAspectRatio="none"
                    >
                      <defs>
                        <linearGradient id="hp-lg" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#7b6cf4" stopOpacity="0.35"/>
                          <stop offset="100%" stopColor="#7b6cf4" stopOpacity="0"/>
                        </linearGradient>
                      </defs>
                      <path ref={lineFillRef} fill="url(#hp-lg)"/>
                      <path ref={lineStrokeRef} fill="none" stroke="#7b6cf4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                  <div className="hp-ccard">
                    <div className="hp-ccard-title">Top Events</div>
                    <div className="hp-donut-body">
                      <svg ref={donutRef} width="70" height="70" viewBox="0 0 70 70" style={{ flexShrink: 0 }}/>
                      <div className="hp-donut-legend">
                        {[
                          { color: "#7b6cf4", name: "page_view",   pct: "45%" },
                          { color: "#5a4de0", name: "btn_click",   pct: "22%" },
                          { color: "#f59e3a", name: "user_signup", pct: "16%" },
                          { color: "#3b82f6", name: "purchase",    pct: "10%" },
                          { color: "#3c4470", name: "others",      pct: "7%"  },
                        ].map(({ color, name, pct }) => (
                          <div key={name} className="hp-dl-row">
                            <span className="hp-dl-dot" style={{ background: color }}/>
                            <span className="hp-dl-name">{name}</span>
                            <span className="hp-dl-pct">{pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="hp-bottom">
                  <div className="hp-bcard">
                    <div className="hp-bcard-title">Recent Events</div>
                    <table className="hp-tbl">
                      <thead><tr><th>Event</th><th>User</th><th>Project</th><th>Time</th></tr></thead>
                      <tbody>
                        {[
                          ["page_view",   "user_123", "Website", "2s ago"],
                          ["btn_click",   "user_456", "Website", "5s ago"],
                          ["user_signup", "user_789", "Mobile",  "8s ago"],
                          ["purchase",    "user_123", "Mobile",  "12s ago"],
                        ].map(([ev, u, p, t]) => (
                          <tr key={ev + u}>
                            <td>{ev}</td><td>{u}</td><td>{p}</td><td>{t}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div className="hp-bcard">
                    <div className="hp-bcard-title">System Health</div>
                    <div className="hp-health">
                      {["Kafka", "Workers", "Database", "Ingestion"].map((svc) => (
                        <div key={svc} className="hp-health-row">
                          <span>{svc}</span>
                          <span className="hp-health-ok">
                            <span className="hp-health-dot"/>Healthy
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FEATURES ────────────────────────────────────────── */}
      <section id="features" className="hp-features">
        <div className="hp-features-inner">
          {[
            {
              title: "High Throughput",
              desc: "Kafka-backed ingestion with batch processing. Handles millions of events per minute without dropping a single one.",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>,
            },
            {
              title: "Real-time Analytics",
              desc: "WebSocket-powered live dashboards. See your events/sec, active users, and pipeline health update as it happens.",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 6 12 12 16 14"/></svg>,
            },
            {
              title: "Reliable & Scalable",
              desc: "Retry topics, dead-letter queues, and Redis-backed counters ensure every event is accounted for under load.",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
            },
            {
              title: "Observable by Default",
              desc: "First-class OpenTelemetry tracing, Prometheus metrics, and Grafana dashboards ship out of the box.",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
            },
            {
              title: "Open Source",
              desc: "Fully open, self-hostable, and hackable. No vendor lock-in. Run it on your own infrastructure in minutes.",
              icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="9"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/></svg>,
            },
          ].map(({ title, desc, icon }) => (
            <div key={title} className="hp-feat">
              <div className="hp-feat-icon">{icon}</div>
              <div className="hp-feat-title">{title}</div>
              <div className="hp-feat-desc">{desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── TECH STACK ──────────────────────────────────────── */}
      <section className="hp-stack">
        <div className="hp-stack-inner">
          <p className="hp-stack-eyebrow">Built with proven open-source infrastructure</p>
          <div className="hp-stack-logos">
            {[
              { label: "Kafka",          bg: "#231f20", text: "K"  },
              { label: "PostgreSQL",     bg: "#336791", text: "PG" },
              { label: "Prometheus",     bg: "#e6522c", text: "P"  },
              { label: "Grafana",        bg: "#f46800", text: "G"  },
              { label: "OpenTelemetry", bg: "#000212", text: "OT", border: "1px solid #3c3c3c" },
              { label: "Jaeger",         bg: "#60d0e4", text: "J", textColor: "#0a0a0a" },
              { label: "NGINX",          bg: "#009639", text: "N"  },
              { label: "Redis",          bg: "#dc382d", text: "R"  },
            ].map(({ label, bg, text, border, textColor }) => (
              <div key={label} className="hp-stack-item">
                <div className="hp-si-icon" style={{ background: bg, border: border ?? "none", color: textColor ?? "#fff" }}>
                  {text}
                </div>
                {label}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
