import { useEffect, useRef, useState } from "react";
import { SignInButton } from "@clerk/react";
import "./DocsPage.css";

const NAV_LINKS = [
  { label: "Features",     href: "/#features" },
  { label: "Architecture", href: "/arch" },
  { label: "Docs",         href: "/docs" },
  { label: "Pricing",      href: "#" },
];

const SECTIONS = [
  {
    label: "Getting Started",
    items: [
      { id: "introduction",  label: "Introduction" },
      { id: "quick-start",   label: "Quick Start" },
    ],
  },
  {
    label: "SDK — eventlens-js",
    items: [
      { id: "sdk-install",   label: "Installation" },
      { id: "sdk-config",    label: "Configuration" },
      { id: "sdk-identify",  label: "identify()" },
      { id: "sdk-track",     label: "track()" },
      { id: "sdk-autocapture", label: "Auto-Capture" },
      { id: "sdk-mask",      label: "maskSensitive()" },
      { id: "sdk-react",     label: "React" },
      { id: "sdk-destroy",   label: "destroy()" },
    ],
  },
  {
    label: "REST API",
    items: [
      { id: "api-auth",   label: "Authentication" },
      { id: "api-ingest", label: "POST /event" },
    ],
  },
  {
    label: "Self Hosting",
    items: [
      { id: "self-host", label: "Docker Compose" },
    ],
  },
];

function CopyButton({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      className="dp-copy-btn"
      onClick={() => {
        navigator.clipboard.writeText(code).then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 1500);
        });
      }}
    >
      {copied ? "Copied!" : "Copy"}
    </button>
  );
}

function CodeBlock({ lang, code }: { lang: string; code: string }) {
  return (
    <div className="dp-code-block">
      <div className="dp-code-header">
        <span className="dp-code-lang">{lang}</span>
        <CopyButton code={code} />
      </div>
      <pre><code dangerouslySetInnerHTML={{ __html: code }} /></pre>
    </div>
  );
}

export default function DocsPage() {
  const [active, setActive] = useState("introduction");
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const ids = SECTIONS.flatMap((s) => s.items.map((i) => i.id));
    const els = ids.map((id) => document.getElementById(id)).filter(Boolean) as HTMLElement[];

    observerRef.current = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-30% 0px -60% 0px" },
    );

    els.forEach((el) => observerRef.current!.observe(el));
    return () => observerRef.current?.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="dp">
      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="dp-nav">
        <a className="dp-nav-logo" href="/">
          <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
            <path d="M3 17 L7.5 9.5 L12 13.5 L16.5 6 L21 13" stroke="#7b6cf4" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round"/>
            <circle cx="21" cy="13" r="2.2" fill="#7b6cf4"/>
          </svg>
          Event<span className="m">Lens</span>
        </a>

        <ul className="dp-nav-links">
          {NAV_LINKS.map(({ label, href }) => (
            <li key={label}>
              <a href={href} className={href === "/docs" ? "active" : ""}>{label}</a>
            </li>
          ))}
        </ul>

        <div className="dp-nav-right">
          <a className="dp-btn dp-btn-ghost" href="https://github.com/ydv-ankit/eventlens" target="_blank" rel="noreferrer">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/>
            </svg>
            GitHub
          </a>
          <SignInButton mode="redirect" forceRedirectUrl="/dashboard">
            <button className="dp-btn dp-btn-primary">Get Started</button>
          </SignInButton>
        </div>
      </nav>

      {/* ── Body ───────────────────────────────────────────── */}
      <div className="dp-layout">
        {/* Sidebar */}
        <aside className="dp-sidebar">
          {SECTIONS.map((sec) => (
            <div key={sec.label} className="dp-sidebar-section">
              <div className="dp-sidebar-label">{sec.label}</div>
              {sec.items.map((item) => (
                <button
                  key={item.id}
                  className={`dp-sidebar-link${active === item.id ? " active" : ""}`}
                  onClick={() => scrollTo(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </aside>

        {/* Content */}
        <main className="dp-content">

          {/* ── Introduction ───────────────────────────────── */}
          <section id="introduction" className="dp-section">
            <div className="dp-section-eyebrow">
              <svg width="11" height="11" viewBox="0 0 12 12" fill="currentColor"><path d="M6 0L7.545 4.455H12L8.25 7.08L9.75 11.52L6 9L2.25 11.52L3.75 7.08L0 4.455H4.455Z"/></svg>
              Overview
            </div>
            <h1 className="dp-h1">EventLens Documentation</h1>
            <p className="dp-p">
              EventLens is an open-source, self-hostable analytics platform built for high-throughput event ingestion and real-time exploration. Collect every user action via the JavaScript SDK or the REST API, then explore and visualise your data from the dashboard.
            </p>
            <p className="dp-p">
              The stack is Kafka → PostgreSQL → React. Events are ingested through an Express API, queued in Kafka, consumed by a worker, and written to an analytics schema in PostgreSQL.
            </p>
            <div className="dp-callout dp-callout-info">
              <span className="dp-callout-icon">💡</span>
              <div className="dp-callout-text">
                <strong>New here?</strong> The quickest path is: create a project → copy your API key → drop the SDK into your site. You'll see events flowing within seconds.
              </div>
            </div>
          </section>

          {/* ── Quick Start ────────────────────────────────── */}
          <section id="quick-start" className="dp-section">
            <h2 className="dp-h2">Quick Start</h2>
            <p className="dp-p">Get your first event tracked in under two minutes.</p>
            <ol className="dp-steps">
              <li>
                <div>
                  <strong>Create a project</strong>
                  Sign in and go to <strong>Projects → New Project</strong>. Give it a name.
                </div>
              </li>
              <li>
                <div>
                  <strong>Generate an API key</strong>
                  Open the project, go to the <strong>API Keys</strong> tab, and click <strong>Create Key</strong>. Copy the key — it's shown once.
                </div>
              </li>
              <li>
                <div>
                  <strong>Add the SDK</strong>
                  <CodeBlock lang="html" code={`<span class="tk-cm">&lt;!-- Drop this before &lt;/body&gt; --&gt;</span>
<span class="tk-kw">&lt;script</span> <span class="tk-pm">src</span>=<span class="tk-str">"https://unpkg.com/eventlens-js/dist/eventlens.iife.js"</span><span class="tk-kw">&gt;&lt;/script&gt;</span>
<span class="tk-kw">&lt;script&gt;</span>
  <span class="tk-kw">const</span> <span class="tk-pm">el</span> = <span class="tk-kw">new</span> <span class="tk-typ">EventLens</span>({ <span class="tk-pm">apiKey</span>: <span class="tk-str">"el_your_api_key"</span> });
<span class="tk-kw">&lt;/script&gt;</span>`} />
                </div>
              </li>
              <li>
                <div>
                  <strong>Open your dashboard</strong>
                  Navigate your site and watch events appear in <strong>Event Explorer</strong> in real time.
                </div>
              </li>
            </ol>
          </section>

          {/* ── SDK Install ────────────────────────────────── */}
          <section id="sdk-install" className="dp-section">
            <h2 className="dp-h2">SDK — Installation</h2>
            <p className="dp-p">
              The <code>eventlens-js</code> package ships three build targets: an IIFE bundle for <code>&lt;script&gt;</code> tags, an ESM build for bundlers, and a CJS build for server-side environments.
            </p>

            <h3 className="dp-h3">npm / yarn / pnpm</h3>
            <CodeBlock lang="bash" code={`npm install eventlens-js`} />

            <h3 className="dp-h3">CDN (IIFE)</h3>
            <p className="dp-p">Use this for plain HTML pages — no build step required.</p>
            <CodeBlock lang="html" code={`<span class="tk-kw">&lt;script</span> <span class="tk-pm">src</span>=<span class="tk-str">"https://unpkg.com/eventlens-js/dist/eventlens.iife.js"</span><span class="tk-kw">&gt;&lt;/script&gt;</span>`} />

            <div className="dp-callout dp-callout-info">
              <span className="dp-callout-icon">📦</span>
              <div className="dp-callout-text">
                The IIFE bundle is ~4 kB gzipped and has zero runtime dependencies.
              </div>
            </div>
          </section>

          {/* ── SDK Config ─────────────────────────────────── */}
          <section id="sdk-config" className="dp-section">
            <h2 className="dp-h2">SDK — Configuration</h2>
            <p className="dp-p">Pass a config object to the constructor. Only <code>apiKey</code> is required.</p>

            <CodeBlock lang="typescript" code={`<span class="tk-kw">import</span> <span class="tk-typ">EventLens</span> <span class="tk-kw">from</span> <span class="tk-str">"eventlens-js"</span>;

<span class="tk-kw">const</span> <span class="tk-pm">el</span> = <span class="tk-kw">new</span> <span class="tk-typ">EventLens</span>({
  <span class="tk-cm">// Required — find this in Project → API Keys</span>
  <span class="tk-pm">apiKey</span>: <span class="tk-str">"el_your_api_key"</span>,

  <span class="tk-cm">// Optional — defaults to http://localhost:8080</span>
  <span class="tk-pm">endpoint</span>: <span class="tk-str">"https://analytics.yoursite.com"</span>,

  <span class="tk-cm">// Optional — disable individual auto-capture categories</span>
  <span class="tk-pm">autoCapture</span>: {
    <span class="tk-pm">pageViews</span>: <span class="tk-kw">true</span>,
    <span class="tk-pm">buttons</span>:   <span class="tk-kw">true</span>,
    <span class="tk-pm">links</span>:     <span class="tk-kw">true</span>,
    <span class="tk-pm">forms</span>:     <span class="tk-kw">true</span>,
    <span class="tk-pm">errors</span>:    <span class="tk-kw">true</span>,
    <span class="tk-pm">pageLeave</span>: <span class="tk-kw">true</span>,
  },
});

<span class="tk-cm">// Or turn off all auto-capture</span>
<span class="tk-kw">const</span> <span class="tk-pm">el</span> = <span class="tk-kw">new</span> <span class="tk-typ">EventLens</span>({ <span class="tk-pm">apiKey</span>: <span class="tk-str">"el_xxx"</span>, <span class="tk-pm">autoCapture</span>: <span class="tk-kw">false</span> });`} />

            <div className="dp-table-wrap">
              <table className="dp-table">
                <thead>
                  <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
                </thead>
                <tbody>
                  {[
                    ["apiKey",      "string",                     "—",                         "API key for your project. Required."],
                    ["endpoint",    "string",                     "http://localhost:8080",      "Base URL of your EventLens server."],
                    ["autoCapture", "Partial<AutoCaptureConfig> | false", "all true",          "Enable or disable auto-capture categories."],
                  ].map(([opt, type, def, desc]) => (
                    <tr key={opt}>
                      <td><code>{opt}</code></td>
                      <td><code>{type}</code></td>
                      <td><code>{def}</code></td>
                      <td>{desc}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* ── identify ───────────────────────────────────── */}
          <section id="sdk-identify" className="dp-section">
            <h2 className="dp-h2">SDK — identify()</h2>
            <div className="dp-method">
              <div className="dp-method-header">
                <span className="dp-method-name">identify</span>
                <span className="dp-method-sig">(userId: string): void</span>
              </div>
              <div className="dp-method-body">
                <p className="dp-method-desc">
                  Associate a user identity with all subsequent events. Call this after your auth flow resolves so events are attributed to the right user. Events tracked before <code>identify()</code> have <code>user_id: null</code>.
                </p>
                <CodeBlock lang="typescript" code={`<span class="tk-cm">// After login / auth resolves</span>
<span class="tk-pm">el</span>.<span class="tk-fn">identify</span>(<span class="tk-str">"user_123"</span>);

<span class="tk-cm">// All events from here carry user_id: "user_123"</span>
<span class="tk-pm">el</span>.<span class="tk-fn">track</span>(<span class="tk-str">"dashboard_opened"</span>);`} />
              </div>
            </div>
          </section>

          {/* ── track ──────────────────────────────────────── */}
          <section id="sdk-track" className="dp-section">
            <h2 className="dp-h2">SDK — track()</h2>
            <div className="dp-method">
              <div className="dp-method-header">
                <span className="dp-method-name">track</span>
                <span className="dp-method-sig">(eventName: string, metadata?: Record&lt;string, unknown&gt;): void</span>
              </div>
              <div className="dp-method-body">
                <p className="dp-method-desc">
                  Manually record a business event. Use this for meaningful product moments that auto-capture won't cover — purchases, feature usage, custom funnels.
                </p>
                <CodeBlock lang="typescript" code={`<span class="tk-cm">// Simple event</span>
<span class="tk-pm">el</span>.<span class="tk-fn">track</span>(<span class="tk-str">"upgrade_clicked"</span>);

<span class="tk-cm">// With metadata</span>
<span class="tk-pm">el</span>.<span class="tk-fn">track</span>(<span class="tk-str">"purchase_completed"</span>, {
  <span class="tk-pm">plan</span>:     <span class="tk-str">"pro"</span>,
  <span class="tk-pm">amount</span>:   <span class="tk-num">99</span>,
  <span class="tk-pm">currency</span>: <span class="tk-str">"USD"</span>,
});

<span class="tk-cm">// Feature usage</span>
<span class="tk-pm">el</span>.<span class="tk-fn">track</span>(<span class="tk-str">"export_triggered"</span>, { <span class="tk-pm">format</span>: <span class="tk-str">"csv"</span>, <span class="tk-pm">rows</span>: <span class="tk-num">1200</span> });`} />
              </div>
            </div>
            <div className="dp-callout dp-callout-info">
              <span className="dp-callout-icon">💡</span>
              <div className="dp-callout-text">
                <strong>Naming convention:</strong> use <code>snake_case</code> event names and keep them in <code>noun_verb</code> order — <code>checkout_started</code>, <code>video_played</code>, <code>invite_sent</code>. Consistent naming makes querying much easier.
              </div>
            </div>
          </section>

          {/* ── Auto-capture ───────────────────────────────── */}
          <section id="sdk-autocapture" className="dp-section">
            <h2 className="dp-h2">SDK — Auto-Capture</h2>
            <p className="dp-p">
              The SDK captures the following events automatically when auto-capture is enabled. All categories are on by default and can be disabled individually.
            </p>

            <div className="dp-table-wrap">
              <table className="dp-table">
                <thead>
                  <tr><th>Event</th><th>Trigger</th><th>Metadata</th></tr>
                </thead>
                <tbody>
                  {[
                    ["session_start",  "SDK initialised",               "user_agent, language"],
                    ["page_view",      "Page load + SPA navigation",    "path, title, referrer"],
                    ["button_click",   "<button> clicked",              "element_type, element_id, text"],
                    ["link_click",     "<a> clicked",                   "element_type, element_id, text, href"],
                    ["click",          "[data-eventlens] clicked",      "element_type, element_id, text"],
                    ["form_submit",    "<form> submitted",              "element_type, element_id, action"],
                    ["page_leave",     "Tab hidden / closed",           "path, duration_ms"],
                    ["error",          "Uncaught JS error",             "message, source, line, column"],
                  ].map(([ev, trigger, meta]) => (
                    <tr key={ev}>
                      <td><code>{ev}</code></td>
                      <td>{trigger}</td>
                      <td><code style={{ fontSize: 11 }}>{meta}</code></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h3 className="dp-h3">Explicit capture with data-eventlens</h3>
            <p className="dp-p">
              Mark any element for capture without writing JavaScript. Add <code>data-eventlens="name"</code> and the SDK fires a <code>click</code> event with <code>element_id</code> set to that name.
            </p>
            <CodeBlock lang="html" code={`<span class="tk-cm">&lt;!-- fires: { event_name: "click", metadata: { element_id: "open_chat", element_type: "div" } } --&gt;</span>
<span class="tk-kw">&lt;div</span> <span class="tk-pm">data-eventlens</span>=<span class="tk-str">"open_chat"</span><span class="tk-kw">&gt;</span>Chat with us<span class="tk-kw">&lt;/div&gt;</span>

<span class="tk-cm">&lt;!-- works on any element type --&gt;</span>
<span class="tk-kw">&lt;img</span> <span class="tk-pm">data-eventlens</span>=<span class="tk-str">"hero_banner"</span> <span class="tk-pm">src</span>=<span class="tk-str">"banner.jpg"</span> <span class="tk-pm">alt</span>=<span class="tk-str">"banner"</span> <span class="tk-kw">/&gt;</span>`} />

            <h3 className="dp-h3">SPA page views</h3>
            <p className="dp-p">
              The SDK monkey-patches <code>history.pushState</code> and <code>history.replaceState</code>, so client-side navigation in React Router, Next.js, or any SPA framework fires <code>page_view</code> automatically — no extra setup.
            </p>
          </section>

          {/* ── maskSensitive ──────────────────────────────── */}
          <section id="sdk-mask" className="dp-section">
            <h2 className="dp-h2">SDK — maskSensitive()</h2>
            <div className="dp-method">
              <div className="dp-method-header">
                <span className="dp-method-name">maskSensitive</span>
                <span className="dp-method-sig">(value: string): string</span>
              </div>
              <div className="dp-method-body">
                <p className="dp-method-desc">
                  A utility export that replaces common PII patterns with placeholders. Not called automatically — use it when your metadata includes user-entered values from input or form fields.
                </p>
                <CodeBlock lang="typescript" code={`<span class="tk-kw">import</span> { <span class="tk-typ">maskSensitive</span> } <span class="tk-kw">from</span> <span class="tk-str">"eventlens-js"</span>;

<span class="tk-cm">// "john@example.com"     → "[email]"</span>
<span class="tk-cm">// "4111 1111 1111 1111"  → "[card]"</span>
<span class="tk-cm">// "+1 (555) 123-4567"    → "[phone]"</span>
<span class="tk-cm">// "123-45-6789"          → "[ssn]"</span>

<span class="tk-pm">el</span>.<span class="tk-fn">track</span>(<span class="tk-str">"search_performed"</span>, {
  <span class="tk-pm">query</span>: <span class="tk-fn">maskSensitive</span>(<span class="tk-pm">searchInput</span>.<span class="tk-pm">value</span>),
});`} />
              </div>
            </div>
            <div className="dp-callout dp-callout-warn">
              <span className="dp-callout-icon">⚠️</span>
              <div className="dp-callout-text">
                <strong>Auto-capture never reads form field values.</strong> <code>maskSensitive</code> is for manual <code>track()</code> calls where you're explicitly passing user input into metadata.
              </div>
            </div>
          </section>

          {/* ── React ──────────────────────────────────────── */}
          <section id="sdk-react" className="dp-section">
            <h2 className="dp-h2">SDK — React</h2>
            <p className="dp-p">
              Initialise the SDK once outside any component so it's not recreated on re-renders. The ESM build works with Vite, Next.js, Create React App, and any other bundler.
            </p>

            <h3 className="dp-h3">1. Initialise at module level</h3>
            <CodeBlock lang="typescript" code={`<span class="tk-cm">// src/analytics.ts</span>
<span class="tk-kw">import</span> <span class="tk-typ">EventLens</span> <span class="tk-kw">from</span> <span class="tk-str">"eventlens-js"</span>;

<span class="tk-kw">export const</span> <span class="tk-pm">analytics</span> = <span class="tk-kw">new</span> <span class="tk-typ">EventLens</span>({
  <span class="tk-pm">apiKey</span>: <span class="tk-pm">import</span>.<span class="tk-pm">meta</span>.<span class="tk-pm">env</span>.<span class="tk-pm">VITE_EVENTLENS_KEY</span>,
});`} />

            <h3 className="dp-h3">2. Identify after auth resolves</h3>
            <CodeBlock lang="typescript" code={`<span class="tk-cm">// e.g. in your auth provider or a useEffect</span>
<span class="tk-kw">import</span> { <span class="tk-pm">analytics</span> } <span class="tk-kw">from</span> <span class="tk-str">"@/analytics"</span>;

<span class="tk-fn">useEffect</span>(() => {
  <span class="tk-kw">if</span> (<span class="tk-pm">user</span>) <span class="tk-pm">analytics</span>.<span class="tk-fn">identify</span>(<span class="tk-pm">user</span>.<span class="tk-pm">id</span>);
}, [<span class="tk-pm">user</span>]);`} />

            <h3 className="dp-h3">3. Track business events</h3>
            <CodeBlock lang="typescript" code={`<span class="tk-kw">import</span> { <span class="tk-pm">analytics</span> } <span class="tk-kw">from</span> <span class="tk-str">"@/analytics"</span>;

<span class="tk-kw">function</span> <span class="tk-fn">UpgradeButton</span>() {
  <span class="tk-kw">return</span> (
    <span class="tk-kw">&lt;button</span> <span class="tk-pm">onClick</span>={() => {
      <span class="tk-pm">analytics</span>.<span class="tk-fn">track</span>(<span class="tk-str">"upgrade_clicked"</span>, { <span class="tk-pm">plan</span>: <span class="tk-str">"pro"</span> });
      <span class="tk-cm">// ... open upgrade modal</span>
    }}<span class="tk-kw">&gt;</span>
      Upgrade to Pro
    <span class="tk-kw">&lt;/button&gt;</span>
  );
}`} />

            <div className="dp-callout dp-callout-info">
              <span className="dp-callout-icon">💡</span>
              <div className="dp-callout-text">
                Don't call <code>destroy()</code> in a <code>useEffect</code> cleanup — that would tear down and recreate the SDK on every render. Only call it on explicit logout if you need a full teardown.
              </div>
            </div>
          </section>

          {/* ── destroy ────────────────────────────────────── */}
          <section id="sdk-destroy" className="dp-section">
            <h2 className="dp-h2">SDK — destroy()</h2>
            <div className="dp-method">
              <div className="dp-method-header">
                <span className="dp-method-name">destroy</span>
                <span className="dp-method-sig">(): void</span>
              </div>
              <div className="dp-method-body">
                <p className="dp-method-desc">
                  Removes all auto-capture event listeners and restores the original <code>history.pushState</code> / <code>history.replaceState</code> methods. Call this on logout if you want a clean teardown between user sessions.
                </p>
                <CodeBlock lang="typescript" code={`<span class="tk-kw">async function</span> <span class="tk-fn">handleLogout</span>() {
  <span class="tk-pm">analytics</span>.<span class="tk-fn">destroy</span>();
  <span class="tk-kw">await</span> <span class="tk-fn">signOut</span>();
}`} />
              </div>
            </div>
          </section>

          {/* ── REST API Auth ───────────────────────────────── */}
          <section id="api-auth" className="dp-section">
            <h2 className="dp-h2">REST API — Authentication</h2>
            <p className="dp-p">
              Every event ingestion request requires a project API key. Pass it as <code>api_key</code> in the request body (required for <code>sendBeacon</code> compatibility, since it can't send custom headers).
            </p>
            <p className="dp-p">
              Dashboard endpoints (fetching events, analytics) use Bearer token auth via Clerk — these are not intended to be called from your SDK.
            </p>
          </section>

          {/* ── REST API POST /event ────────────────────────── */}
          <section id="api-ingest" className="dp-section">
            <h2 className="dp-h2">REST API — POST /event</h2>
            <p className="dp-p">Ingest a single event. This is what the SDK calls under the hood.</p>

            <div className="dp-method">
              <div className="dp-method-header">
                <span className="dp-method-name" style={{ color: "#7b6cf4" }}>POST</span>
                <span className="dp-method-sig">/event</span>
                <span className="dp-badge dp-badge-green" style={{ marginLeft: "auto" }}>Public</span>
              </div>
              <div className="dp-method-body">
                <h3 className="dp-h3" style={{ marginTop: 0 }}>Request body</h3>
                <CodeBlock lang="json" code={`{
  <span class="tk-str">"api_key"</span>:    <span class="tk-str">"el_your_api_key"</span>,
  <span class="tk-str">"event_name"</span>: <span class="tk-str">"purchase_completed"</span>,
  <span class="tk-str">"user_id"</span>:    <span class="tk-str">"user_123"</span>,
  <span class="tk-str">"session_id"</span>: <span class="tk-str">"9374f388-..."</span>,
  <span class="tk-str">"timestamp"</span>:  <span class="tk-str">"2026-06-21T10:49:45.923Z"</span>,
  <span class="tk-str">"metadata"</span>:   { <span class="tk-str">"plan"</span>: <span class="tk-str">"pro"</span>, <span class="tk-str">"amount"</span>: <span class="tk-num">99</span> }
}`} />
                <h3 className="dp-h3">Response</h3>
                <CodeBlock lang="json" code={`{ <span class="tk-str">"success"</span>: <span class="tk-kw">true</span>, <span class="tk-str">"message"</span>: <span class="tk-str">"event accepted"</span> }`} />
                <div className="dp-table-wrap" style={{ marginTop: 16 }}>
                  <table className="dp-table">
                    <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
                    <tbody>
                      {[
                        ["api_key",    "string",  "Yes", "Project API key."],
                        ["event_name", "string",  "Yes", "Name of the event, e.g. page_view."],
                        ["user_id",    "string",  "No",  "Identified user. Null for anonymous."],
                        ["session_id", "string",  "No",  "Session identifier."],
                        ["timestamp",  "ISO 8601","No",  "Defaults to server receive time if omitted."],
                        ["metadata",   "object",  "No",  "Arbitrary key/value pairs. No nesting limit."],
                      ].map(([f, t, r, d]) => (
                        <tr key={f}>
                          <td><code>{f}</code></td>
                          <td><code>{t}</code></td>
                          <td>{r === "Yes" ? <span className="dp-badge dp-badge-purple">Required</span> : <span style={{ color: "#4a5278" }}>Optional</span>}</td>
                          <td>{d}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <h3 className="dp-h3">curl example</h3>
            <CodeBlock lang="bash" code={`curl -X POST http://localhost:8080/event \\
  -H <span class="tk-str">"Content-Type: application/json"</span> \\
  -d <span class="tk-str">'{
    "api_key": "el_your_api_key",
    "event_name": "purchase_completed",
    "user_id": "user_123",
    "timestamp": "2026-06-21T10:49:45.923Z",
    "metadata": { "plan": "pro", "amount": 99 }
  }'</span>`} />
          </section>

          {/* ── Self Hosting ───────────────────────────────── */}
          <section id="self-host" className="dp-section">
            <h2 className="dp-h2">Self Hosting</h2>
            <p className="dp-p">
              EventLens is fully self-hostable. The entire stack — API, worker, Kafka, PostgreSQL, Redis, and the observability layer — is defined in a single <code>docker-compose.yml</code>.
            </p>

            <ol className="dp-steps">
              <li>
                <div>
                  <strong>Clone the repo</strong>
                  <CodeBlock lang="bash" code={`git clone https://github.com/ydv-ankit/eventlens
cd eventlens/server`} />
                </div>
              </li>
              <li>
                <div>
                  <strong>Copy and edit the environment file</strong>
                  <CodeBlock lang="bash" code={`cp env.example .env
<span class="tk-cm"># Edit .env — set DATABASE_URL, CLERK_SECRET_KEY, CORS_ORIGINS</span>`} />
                </div>
              </li>
              <li>
                <div>
                  <strong>Start the stack</strong>
                  <CodeBlock lang="bash" code={`docker compose up -d`} />
                  The API is available at <code>http://localhost:8080</code>. Grafana at <code>:3001</code>, Jaeger at <code>:16686</code>.
                </div>
              </li>
              <li>
                <div>
                  <strong>Point your SDK at the server</strong>
                  <CodeBlock lang="typescript" code={`<span class="tk-kw">new</span> <span class="tk-typ">EventLens</span>({
  <span class="tk-pm">apiKey</span>:   <span class="tk-str">"el_your_key"</span>,
  <span class="tk-pm">endpoint</span>: <span class="tk-str">"https://your-server.com"</span>,
});`} />
                </div>
              </li>
            </ol>

            <div className="dp-callout dp-callout-info">
              <span className="dp-callout-icon">🏗️</span>
              <div className="dp-callout-text">
                A Helm chart for Kubernetes is included in <code>server/helm/</code>. See the <a className="dp-inline-link" href="/arch">Architecture page</a> for a full diagram of the system pipeline.
              </div>
            </div>
          </section>

        </main>
      </div>
    </div>
  );
}
