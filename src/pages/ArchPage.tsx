import { Link } from "react-router-dom";

const C = {
  ground:   "#080c18",
  surface:  "#0d1122",
  border:   "#1c2340",
  text:     "#dde2f0",
  muted:    "#68708a",
  dim:      "#38405a",
  accent:   "#7b6cf4",
  amber:    "#f59e3a",
  blue:     "#3b82f6",
  green:    "#34d399",
  red:      "#dc2626",
  indigo:   "#5a4de0",
  teal:     "#60d0e4",
};

const FONT = "-apple-system, 'Segoe UI', system-ui, sans-serif";

const FLOW_STEPS = [
  {
    n: "01",
    title: "Event Ingestion",
    color: C.amber,
    steps: [
      "Client SDK sends POST /event with api_key in the request body",
      "NGINX proxies the request to the API Server on :8080",
      "API Server validates the API key (hash lookup → project_id)",
      "Event is published to Kafka's events topic (4 partitions, round-robin)",
    ],
  },
  {
    n: "02",
    title: "Stream Processing",
    color: C.indigo,
    steps: [
      "Worker consumes Kafka batches via eachBatch (KafkaJS)",
      "API key → project_id lookups are de-duplicated per batch",
      "Single multi-row INSERT into analytics.raw_event (PostgreSQL)",
      "On batch failure: each event is sent to the retry topic individually",
    ],
  },
  {
    n: "03",
    title: "Real-time Updates",
    color: C.accent,
    steps: [
      "Worker INCRs Redis counters: EVENTS_TOTAL, EVENTS_WINDOW, INFLIGHT",
      "Worker PUBLISHes each event to the Redis live-events channel",
      "API Server SUBSCRIBEs to Redis and broadcasts live_event to WebSocket clients",
      "Every second: API Server reads counters via getDel and broadcasts system_metrics",
    ],
  },
  {
    n: "04",
    title: "Analytics Queries",
    color: C.blue,
    steps: [
      "Authenticated clients call REST endpoints: /analytics/overview, /events, etc.",
      "Clerk JWT is validated on every request via middleware",
      "SQL queries run against analytics.raw_event filtered by project_id",
      "Results are paginated with cursor-based pagination (id > cursor)",
    ],
  },
  {
    n: "05",
    title: "Observability",
    color: C.green,
    steps: [
      "All services are instrumented with OpenTelemetry SDK",
      "OTEL Collector receives traces and metrics from API Server + Worker",
      "Prometheus scrapes metrics from the OTEL Collector",
      "Grafana dashboards visualize metrics; Jaeger stores distributed traces",
    ],
  },
];

export default function ArchPage() {
  return (
    <div style={{ background: C.ground, color: C.text, minHeight: "100vh", fontFamily: FONT, WebkitFontSmoothing: "antialiased" }}>

      {/* ── NAVBAR ── */}
      <nav style={{ position: "sticky", top: 0, zIndex: 100, height: 60, display: "flex", alignItems: "center", padding: "0 2.5rem", background: "rgba(8,12,24,0.92)", backdropFilter: "blur(14px)", borderBottom: `1px solid ${C.border}`, gap: "0.625rem" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "0.375rem", color: C.muted, fontSize: "0.875rem", textDecoration: "none", transition: "color 0.15s" }}
          onMouseEnter={e => (e.currentTarget.style.color = C.text)}
          onMouseLeave={e => (e.currentTarget.style.color = C.muted)}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" style={{ display: "block" }}>
            <path d="M19 12H5M5 12l7-7M5 12l7 7"/>
          </svg>
          Home
        </Link>
        <span style={{ color: C.dim, fontSize: "1rem" }}>·</span>
        <span style={{ fontSize: "0.875rem", color: C.muted }}>Architecture</span>
        <div style={{ flex: 1 }} />
        <a href="https://github.com/ydv-ankit/eventlens" target="_blank" rel="noreferrer"
          style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: C.muted, fontSize: "0.8125rem", textDecoration: "none", padding: "0.35rem 0.75rem", border: `1px solid ${C.border}`, borderRadius: 6, transition: "all 0.15s" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = C.accent; e.currentTarget.style.color = C.accent; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = C.border; e.currentTarget.style.color = C.muted; }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" style={{ display: "block" }}>
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
          </svg>
          GitHub
        </a>
      </nav>

      {/* ── PAGE CONTENT ── */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "3rem 2rem 5rem" }}>

        {/* Header */}
        <div style={{ marginBottom: "2.5rem" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", padding: "0.25rem 0.75rem", background: "rgba(123,108,244,0.12)", border: "1px solid rgba(123,108,244,0.28)", borderRadius: 100, fontSize: "0.75rem", color: C.accent, marginBottom: "1rem", fontWeight: 500 }}>
            System Design
          </div>
          <h1 style={{ fontSize: "clamp(1.75rem, 3vw, 2.5rem)", fontWeight: 840, letterSpacing: "-0.04em", marginBottom: "0.75rem", lineHeight: 1.1 }}>
            Architecture
          </h1>
          <p style={{ fontSize: "1.0625rem", color: C.muted, maxWidth: 600, lineHeight: 1.7 }}>
            EventLens is a horizontally scalable event ingestion pipeline. Events flow from client SDKs through Kafka into PostgreSQL, while Redis enables sub-second real-time dashboards over WebSocket.
          </p>
        </div>

        {/* ── DIAGRAM CARD ── */}
        <div style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 12, padding: "2rem 1.5rem 1.5rem", marginBottom: "2.5rem", overflowX: "auto" }}>
          <svg
            viewBox="0 0 1080 435"
            width="100%"
            style={{ display: "block", minWidth: 720 }}
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {([ ["a-dim", C.dim], ["a-mut", C.muted], ["a-acc", C.accent], ["a-amb", C.amber], ["a-blu", C.blue], ["a-red", C.red], ["a-grn", C.green], ["a-tel", C.teal] ] as [string, string][]).map(([id, color]) => (
                <marker key={id} id={id} viewBox="0 0 8 8" refX="7" refY="4" markerWidth="5.5" markerHeight="5.5" orient="auto">
                  <path d="M0,1 L7,4 L0,7 Z" fill={color}/>
                </marker>
              ))}
            </defs>

            {/* ── ZONE EYEBROWS ── */}
            {([
              ["EVENT SOURCES", 77,   78],
              ["GATEWAY",       260,  78],
              ["API LAYER",     452,  54],
              ["MESSAGE QUEUE", 660,  64],
              ["PROCESSING",    855,  64],
              ["STORAGE",       1030, 64],
            ] as [string, number, number][]).map(([label, x, y]) => (
              <text key={label} x={x} y={y} textAnchor="middle" fontSize="8" fill={C.dim} fontFamily={FONT} letterSpacing="0.12em">{label}</text>
            ))}

            {/* ── COMPONENT BOXES ── */}

            {/* Browser App */}
            <rect x="15" y="90" width="125" height="58" rx="8" fill="#0c1226" stroke={C.border}/>
            <text x="77" y="116" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.text} fontFamily={FONT}>Browser App</text>
            <text x="77" y="132" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>React · Vite</text>

            {/* SDK / External */}
            <rect x="15" y="195" width="125" height="58" rx="8" fill="#0c1226" stroke={C.border}/>
            <text x="77" y="221" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.text} fontFamily={FONT}>SDK / API</text>
            <text x="77" y="237" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>External clients</text>

            {/* NGINX */}
            <rect x="200" y="118" width="120" height="58" rx="8" fill="#111828" stroke="#2a3350"/>
            <text x="260" y="145" textAnchor="middle" fontSize="11.5" fontWeight="600" fill={C.text} fontFamily={FONT}>NGINX</text>
            <text x="260" y="161" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>Reverse proxy · :8080</text>

            {/* API Server — tall box */}
            <rect x="380" y="68" width="145" height="225" rx="8" fill="#0b1030" stroke={C.accent} strokeWidth="1.25"/>
            <text x="452" y="93" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.text} fontFamily={FONT}>API Server</text>
            <text x="452" y="108" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>Node.js · Express · TS</text>
            <line x1="390" y1="116" x2="515" y2="116" stroke={C.border} strokeWidth="0.75"/>
            <text x="395" y="131" fontSize="8.5" fill={C.dim} fontFamily={FONT}>● POST /event</text>
            <text x="395" y="147" fontSize="8.5" fill={C.dim} fontFamily={FONT}>● GET /analytics/*</text>
            <text x="395" y="163" fontSize="8.5" fill={C.dim} fontFamily={FONT}>● GET /system/health</text>
            <text x="395" y="179" fontSize="8.5" fill={C.dim} fontFamily={FONT}>● GET /users/:id/events</text>
            <line x1="390" y1="187" x2="515" y2="187" stroke={C.border} strokeWidth="0.75"/>
            <text x="395" y="202" fontSize="8.5" fill={C.accent} fontFamily={FONT}>● WebSocket /ws</text>
            <text x="402" y="216" fontSize="8" fill={C.dim} fontFamily={FONT}>↳ system_metrics (1s)</text>
            <text x="402" y="230" fontSize="8" fill={C.dim} fontFamily={FONT}>↳ live_event</text>
            <line x1="390" y1="238" x2="515" y2="238" stroke={C.border} strokeWidth="0.75"/>
            <text x="395" y="253" fontSize="8.5" fill={C.dim} fontFamily={FONT}>● Clerk JWT auth</text>
            <text x="395" y="267" fontSize="8.5" fill={C.dim} fontFamily={FONT}>● CORS · Helmet · OTEL</text>

            {/* Kafka */}
            <rect x="595" y="78" width="130" height="82" rx="8" fill="#1a1305" stroke={C.amber}/>
            <text x="660" y="107" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.text} fontFamily={FONT}>Apache Kafka</text>
            <text x="660" y="122" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>events · retry topics</text>
            <text x="660" y="138" textAnchor="middle" fontSize="8.5" fill={C.amber} fontFamily={FONT}>4 partitions</text>

            {/* Worker */}
            <rect x="790" y="78" width="130" height="82" rx="8" fill="#0d0b30" stroke={C.indigo}/>
            <text x="855" y="107" textAnchor="middle" fontSize="12" fontWeight="700" fill={C.text} fontFamily={FONT}>Worker</text>
            <text x="855" y="122" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>KafkaJS consumer</text>
            <text x="855" y="138" textAnchor="middle" fontSize="8" fill={C.indigo} fontFamily={FONT}>eachBatch · multi-row INSERT</text>

            {/* PostgreSQL */}
            <rect x="983" y="78" width="92" height="82" rx="8" fill="#0a1520" stroke={C.blue}/>
            <text x="1029" y="107" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.text} fontFamily={FONT}>PostgreSQL</text>
            <text x="1029" y="121" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>analytics.*</text>
            <text x="1029" y="135" textAnchor="middle" fontSize="8" fill={C.blue} fontFamily={FONT}>raw_event table</text>

            {/* Redis */}
            <rect x="983" y="215" width="92" height="82" rx="8" fill="#1a0808" stroke={C.red}/>
            <text x="1029" y="244" textAnchor="middle" fontSize="11" fontWeight="700" fill={C.text} fontFamily={FONT}>Redis</text>
            <text x="1029" y="258" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>pub/sub · counters</text>
            <text x="1029" y="272" textAnchor="middle" fontSize="8" fill={C.red} fontFamily={FONT}>INFLIGHT · EVT_WIN</text>

            {/* ── ARROWS ── */}

            {/* Browser → NGINX */}
            <path d="M 140 119 L 200 141" fill="none" stroke={C.dim} strokeWidth="1.25" markerEnd="url(#a-dim)"/>
            {/* SDK → NGINX */}
            <path d="M 140 220 L 200 162" fill="none" stroke={C.dim} strokeWidth="1.25" markerEnd="url(#a-dim)"/>
            <text x="170" y="177" textAnchor="middle" fontSize="7.5" fill={C.dim} fontFamily={FONT}>HTTPS</text>

            {/* NGINX → API */}
            <path d="M 320 147 L 380 147" fill="none" stroke={C.muted} strokeWidth="1.25" markerEnd="url(#a-mut)"/>

            {/* API → Kafka (produce) */}
            <path d="M 525 112 L 595 112" fill="none" stroke={C.amber} strokeWidth="1.5" markerEnd="url(#a-amb)"/>
            <text x="560" y="106" textAnchor="middle" fontSize="7.5" fill={C.amber} fontFamily={FONT}>PRODUCE</text>

            {/* Kafka → Worker (consume) */}
            <path d="M 725 119 L 790 119" fill="none" stroke={C.amber} strokeWidth="1.5" markerEnd="url(#a-amb)"/>
            <text x="757" y="113" textAnchor="middle" fontSize="7.5" fill={C.amber} fontFamily={FONT}>CONSUME</text>

            {/* Worker → PostgreSQL */}
            <path d="M 920 102 L 983 102" fill="none" stroke={C.blue} strokeWidth="1.5" markerEnd="url(#a-blu)"/>
            <text x="951" y="96" textAnchor="middle" fontSize="7.5" fill={C.blue} fontFamily={FONT}>INSERT</text>

            {/* Worker → Redis (right angle: right then down) */}
            <path d="M 920 136 L 955 136 L 955 256 L 983 256" fill="none" stroke={C.red} strokeWidth="1.25" markerEnd="url(#a-red)"/>
            <text x="943" y="200" fontSize="7.5" fill={C.red} fontFamily={FONT} textAnchor="end">INCR·PUBLISH</text>

            {/* Redis → API Server (subscribe, dashed, routes below) */}
            <path d="M 983 268 L 948 268 L 948 312 L 452 312 L 452 293" fill="none" stroke={C.accent} strokeWidth="1.25" strokeDasharray="5 3" markerEnd="url(#a-acc)"/>
            <text x="700" y="326" textAnchor="middle" fontSize="7.5" fill={C.accent} fontFamily={FONT}>SUBSCRIBE (Redis pub/sub)</text>

            {/* API → Browser (WebSocket, dashed, routes above) */}
            <path d="M 380 138 L 335 138 L 335 43 L 77 43 L 77 90" fill="none" stroke={C.accent} strokeWidth="1.25" strokeDasharray="5 3" markerEnd="url(#a-acc)"/>
            <text x="210" y="36" textAnchor="middle" fontSize="7.5" fill={C.accent} fontFamily={FONT}>WebSocket broadcast</text>

            {/* ── OBSERVABILITY SECTION ── */}
            <line x1="30" y1="345" x2="1065" y2="345" stroke={C.border} strokeWidth="0.75" strokeDasharray="4 4"/>
            <text x="540" y="340" textAnchor="middle" fontSize="8" fill={C.dim} fontFamily={FONT} letterSpacing="0.12em">OBSERVABILITY</text>

            {/* Telemetry: API + Worker → OTEL */}
            <path d="M 452 293 L 452 332 L 242 358" fill="none" stroke={C.green} strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#a-grn)"/>
            <path d="M 855 160 L 855 332 L 378 358" fill="none" stroke={C.green} strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#a-grn)"/>
            <text x="648" y="340" textAnchor="middle" fontSize="7.5" fill={C.green} fontFamily={FONT}>OTEL telemetry</text>

            {/* OTEL Collector */}
            <rect x="185" y="358" width="115" height="48" rx="7" fill="#0a1a0a" stroke={C.green}/>
            <text x="242" y="380" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.text} fontFamily={FONT}>OTEL Collector</text>
            <text x="242" y="396" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>traces · metrics · logs</text>

            {/* OTEL → Prometheus */}
            <path d="M 300 382 L 330 382" fill="none" stroke={C.green} strokeWidth="1" markerEnd="url(#a-grn)"/>

            {/* Prometheus */}
            <rect x="330" y="358" width="115" height="48" rx="7" fill="#1a0a05" stroke="#e6522c"/>
            <text x="387" y="380" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.text} fontFamily={FONT}>Prometheus</text>
            <text x="387" y="396" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>metrics storage</text>

            {/* Prometheus → Grafana */}
            <path d="M 445 382 L 475 382" fill="none" stroke={C.green} strokeWidth="1" markerEnd="url(#a-grn)"/>

            {/* Grafana */}
            <rect x="475" y="358" width="115" height="48" rx="7" fill="#1a0d00" stroke="#f46800"/>
            <text x="532" y="380" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.text} fontFamily={FONT}>Grafana</text>
            <text x="532" y="396" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>dashboards</text>

            {/* OTEL → Jaeger (traces, dashed arc along bottom) */}
            <path d="M 242 406 L 242 424 L 622 424 L 622 406" fill="none" stroke={C.teal} strokeWidth="1" strokeDasharray="4 3" markerEnd="url(#a-tel)"/>
            <text x="432" y="432" textAnchor="middle" fontSize="7.5" fill={C.teal} fontFamily={FONT}>distributed traces</text>

            {/* Jaeger */}
            <rect x="568" y="358" width="108" height="48" rx="7" fill="#0a1a1a" stroke={C.teal}/>
            <text x="622" y="380" textAnchor="middle" fontSize="11" fontWeight="600" fill={C.text} fontFamily={FONT}>Jaeger</text>
            <text x="622" y="396" textAnchor="middle" fontSize="8.5" fill={C.muted} fontFamily={FONT}>trace visualization</text>

          </svg>
        </div>

        {/* ── LEGEND ── */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.625rem", marginBottom: "2.5rem" }}>
          {([
            ["API Layer",     C.accent],
            ["Message Queue", C.amber],
            ["Processing",    C.indigo],
            ["Storage (DB)",  C.blue],
            ["Cache / Redis", C.red],
            ["Observability", C.green],
            ["WebSocket",     C.accent, true],
            ["Subscribe",     C.accent, true],
          ] as [string, string, boolean?][]).map(([label, color, dashed]) => (
            <div key={label} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.3rem 0.6rem", background: "rgba(255,255,255,0.03)", border: `1px solid ${C.border}`, borderRadius: 6, fontSize: "0.75rem", color: C.muted }}>
              <svg width="22" height="4" style={{ display: "block", flexShrink: 0 }}>
                <line x1="0" y1="2" x2="22" y2="2" stroke={color} strokeWidth="1.5" strokeDasharray={dashed ? "4 2" : undefined}/>
              </svg>
              {label}
            </div>
          ))}
        </div>

        {/* ── DATA FLOW STEPS ── */}
        <h2 style={{ fontSize: "1.1875rem", fontWeight: 700, letterSpacing: "-0.03em", marginBottom: "1.25rem" }}>
          Data Flow
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
          {FLOW_STEPS.map(({ n, title, color, steps }) => (
            <div key={n} style={{ background: C.surface, border: `1px solid ${C.border}`, borderRadius: 10, padding: "1.25rem", borderTopWidth: 2, borderTopColor: color }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.625rem", marginBottom: "0.875rem" }}>
                <span style={{ fontFamily: "ui-monospace, monospace", fontSize: "0.6875rem", color, fontWeight: 700, opacity: 0.7 }}>{n}</span>
                <span style={{ fontSize: "0.9375rem", fontWeight: 600, color: C.text }}>{title}</span>
              </div>
              <ol style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {steps.map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: "0.5rem", fontSize: "0.8125rem", color: C.muted, lineHeight: 1.55 }}>
                    <span style={{ color, fontWeight: 700, flexShrink: 0, marginTop: "0.05rem", opacity: 0.6 }}>→</span>
                    {step}
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
