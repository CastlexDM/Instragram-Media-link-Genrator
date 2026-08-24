"use client";

import { useMemo, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronDown,
  Clipboard,
  Download,
  ExternalLink,
  Film,
  Image as ImageIcon,
  Instagram,
  Link2,
  Loader2,
  Sparkles,
} from "lucide-react";

type MediaItem = {
  id: string;
  type: "Post" | "Reel";
  date: string;
  caption: string;
  url: string;
  preview: string;
};

function isInstagramProfileUrl(value: string) {
  try {
    const url = new URL(value.trim());
    if (!['instagram.com', 'www.instagram.com'].includes(url.hostname.toLowerCase())) return false;
    const parts = url.pathname.split('/').filter(Boolean);
    return parts.length === 1 && !['p', 'reel', 'reels', 'explore', 'accounts', 'direct'].includes(parts[0].toLowerCase());
  } catch {
    return false;
  }
}

function getUsername(value: string) {
  try {
    return new URL(value.trim()).pathname.split("/").filter(Boolean)[0] || "profile";
  } catch {
    return "profile";
  }
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [type, setType] = useState<"All" | "Post" | "Reel">("All");
  const [showDate, setShowDate] = useState(false);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState<string | "selected" | "all" | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");

  const urlIsValid = isInstagramProfileUrl(url);

  const [items, setItems] = useState<MediaItem[]>([]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesType = type === "All" || item.type === type;
      const matchesFrom = !from || item.date >= from;
      const matchesTo = !to || item.date <= to;
      return matchesType && matchesFrom && matchesTo;
    });
  }, [items, type, from, to]);

  const allSelected = filteredItems.length > 0 && filteredItems.every((item) => selected.includes(String(item.id)));
  const selectedItems = filteredItems.filter((item) => selected.includes(String(item.id)));

  async function copy(text: string, key: string | "selected" | "all") {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const textarea = document.createElement("textarea");
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      textarea.remove();
    }
    setCopied(key);
    window.setTimeout(() => setCopied(null), 1400);
  }

  async function generate() {
    if (!urlIsValid) return;
    setLoading(true);
    setApiError("");
    setSelected([]);

    try {
      const params = new URLSearchParams({ url: url.trim(), type });
      if (from) params.set("from", from);
      if (to) params.set("to", to);
      params.set("limit", "100");

      const response = await fetch(`/api/profile-media?${params.toString()}`);
      const data = await response.json();
      if (!response.ok || !data.ok) {
        setApiError(data.error || "The profile could not be retrieved.");
        setSearched(false);
        setItems([]);
        return;
      }

      const mapped: MediaItem[] = (data.media ?? []).map((item: MediaItem) => ({
        id: String(item.id),
        type: item.type,
        date: item.date,
        caption: item.caption || "—",
        url: item.url || "",
        preview: item.preview || "#DAD3DC",
      }));

      setItems(mapped);
      setSearched(true);
    } catch {
      setApiError("Could not reach the profile lookup API. Make sure the development server is running.");
      setSearched(false);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  function toggleAll() {
    setSelected(allSelected ? [] : filteredItems.map((item) => String(item.id)));
  }

  function toggle(id: string) {
    setSelected((current) => current.includes(String(id)) ? current.filter((item) => item !== String(id)) : [...current, String(id)]);
  }

  function applyDateRange() {
    if (from && to && from > to) {
      const oldFrom = from;
      setFrom(to);
      setTo(oldFrom);
    }
    setSelected([]);
    setShowDate(false);
  }

  function clearDateRange() {
    setFrom("");
    setTo("");
    setSelected([]);
    setShowDate(false);
  }

  function exportCsv() {
    const exportItems = selectedItems.length ? selectedItems : items;
    const rows = exportItems.map((item) => [item.id, item.type, item.date, item.caption, item.url]);
    const csv = [["#", "Type", "Date", "Caption", "Link"], ...rows]
      .map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = selectedItems.length ? "instagram-selected-links.csv" : "instagram-media-links.csv";
    a.click();
    URL.revokeObjectURL(href);
  }

  const allLinks = items.map((item) => item.url).join("\n");
  const selectedLinks = selectedItems.map((item) => item.url).join("\n");
  const rangeLabel = from || to ? `${from || "Any"} → ${to || "Now"}` : "Any time";

  return (
    <main>
      <nav className="nav shell">
        <div className="brand"><span className="brand-mark"><Link2 size={17} /></span> medialink</div>
        <div className="nav-pill"><span className="dot" /> Instagram only · V1</div>
        <a className="nav-link" href="#how">How it works <ArrowUpRight size={15} /></a>
      </nav>

      <section className="hero shell">
        <div className="hero-copy">
          <div className="eyebrow"><Sparkles size={15} /> ORGANIZE PUBLIC MEDIA</div>
          <h1>Turn an Instagram profile into <em>clean links.</em></h1>
          <p>Paste a profile, choose what you need, and get an easy-to-copy media table. Built for quick research and organization.</p>
        </div>

        <div className="search-card">
          <label htmlFor="profile">Instagram profile</label>
          <div className="input-row">
            <div className="url-input"><Instagram size={18} /><input id="profile" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && generate()} placeholder="https://www.instagram.com/username/" /></div>
            <button className="primary" onClick={generate} disabled={loading || !url}>
              {loading ? <><Loader2 size={17} className="spin" /> Finding…</> : <>Generate links <ArrowUpRight size={17} /></>}
            </button>
          </div>
          {url && !urlIsValid && <div className="error">Enter a valid Instagram profile URL, for example instagram.com/username/.</div>}
          {apiError && <div className="error api-error">{apiError}</div>}

          <div className="filters">
            <div className="filter-block"><span>Media</span><div className="segmented">{(["All", "Post", "Reel"] as const).map((option) => <button key={option} className={type === option ? "active" : ""} onClick={() => { setType(option); setSelected([]); }}>{option === "Post" ? "Posts" : option === "Reel" ? "Reels" : option}</button>)}</div></div>
            <div className="filter-block date-block">
              <span>Date range</span>
              <button className="date-button" onClick={() => setShowDate(!showDate)}><CalendarDays size={16} />{rangeLabel}<ChevronDown size={15} /></button>
              {showDate && <div className="date-popover">
                <div><label htmlFor="from-date">From</label><input id="from-date" type="date" value={from} max={to || undefined} onChange={(e) => setFrom(e.target.value)} /></div>
                <div><label htmlFor="to-date">To</label><input id="to-date" type="date" min={from || undefined} value={to} onChange={(e) => setTo(e.target.value)} /></div>
                <div className="date-actions"><button className="ghost-date" onClick={clearDateRange}>Clear</button><button className="apply-date" onClick={applyDateRange}>Apply range</button></div>
              </div>}
            </div>
          </div>
        </div>
      </section>

      {searched && <section className="results shell">
        <div className="results-head">
          <div>
            <div className="eyebrow">RESULTS</div>
            <h2>@{getUsername(url)}</h2>
            <p>{filteredItems.length} available {items.length === 1 ? "item" : "items"} · {type === "All" ? "all media" : type.toLowerCase() + "s"} · {rangeLabel}</p>
          </div>
          <div className="result-actions">
            <button className="dark-action" onClick={() => copy(allLinks, "all")} disabled={!filteredItems.length}>{copied === "all" ? <><Check size={16} /> Copied all</> : <><Clipboard size={16} /> Copy all links</>}</button>
            <button onClick={() => copy(selectedLinks, "selected")} disabled={!selectedItems.length}>{copied === "selected" ? <><Check size={16} /> Copied {selectedItems.length}</> : <><Clipboard size={16} /> Copy selected{selectedItems.length ? ` (${selectedItems.length})` : ""}</>}</button>
            <button onClick={exportCsv} disabled={!filteredItems.length}><Download size={16} /> {selectedItems.length ? "Export selected" : "CSV"}</button>
          </div>
        </div>

        <div className="table-wrap">
          {filteredItems.length ? <table>
            <thead><tr><th className="check-col"><button aria-label="Select all" className={`check ${allSelected ? "checked" : ""}`} onClick={toggleAll}>{allSelected && <Check size={13} />}</button></th><th>Preview</th><th>Type</th><th>Date</th><th>Caption</th><th>Media link</th><th /></tr></thead>
            <tbody>{filteredItems.map((item) => <tr key={item.id}>
              <td><button aria-label={`Select ${item.type} ${item.id}`} className={`check ${selected.includes(String(item.id)) ? "checked" : ""}`} onClick={() => toggle(String(item.id))}>{selected.includes(String(item.id)) && <Check size={13} />}</button></td>
              <td><div className="preview" style={{ background: item.preview }}>{item.type === "Reel" ? <Film size={19} /> : <ImageIcon size={19} />}</div></td>
              <td><span className={`type ${item.type.toLowerCase()}`}>{item.type}</span></td>
              <td className="date-cell">{item.date ? new Intl.DateTimeFormat("en-GB", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(item.date + "T00:00:00")) : "—"}</td>
              <td className="caption" title={item.caption}>{item.caption}</td>
              <td><div className="link-cell"><span title={item.url}>{item.url.replace("https://www.", "")}</span><button className="icon-button" onClick={() => copy(item.url, item.id)} title="Copy link">{copied === item.id ? <Check size={16} /> : <Clipboard size={16} />}</button></div></td>
              <td><a className="open-link" href={item.url} target="_blank" rel="noreferrer" aria-label="Open Instagram link"><ExternalLink size={16} /></a></td>
            </tr>)}</tbody>
          </table> : <div className="empty-state"><div className="empty-icon"><CalendarDays size={20} /></div><h3>No media matches these filters</h3><p>Try widening the date range or switching the media type.</p><button onClick={() => { setFrom(""); setTo(""); setType("All"); setSelected([]); }}>Reset filters</button></div>}
        </div>
        <div className="table-foot"><span>Showing {filteredItems.length} live items</span><span className="safe-note"><Check size={14} /> Public-profile data via Apify · results are a snapshot</span></div>
      </section>}

      {!searched && <section className="intro-grid shell" id="how">
        <div><span className="step">01</span><h3>Paste a profile</h3><p>Start with an Instagram profile URL. No complicated search syntax.</p></div>
        <div><span className="step">02</span><h3>Set the range</h3><p>Filter between dates and narrow results to posts, reels, or both.</p></div>
        <div><span className="step">03</span><h3>Copy or export</h3><p>Use row-level copy, copy selected, copy all, or export the table to CSV.</p></div>
      </section>}

      <footer className="footer shell"><span>medialink / 2026</span><span>Instagram media organizer · V1</span></footer>
    </main>
  );
}
