import React, { useEffect, useRef, useState } from "react";

export default function AutocompleteInput({ value, onChange, placeholder = "Search place" }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const abortRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const fetchSuggestions = async (q) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=5`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("Photon error");
      const data = await res.json();
      const items = (data.features || []).map((f) => {
        const p = f.properties || {};
        const parts = [p.name, p.street, p.city, p.state, p.country].filter(Boolean);
        return { id: `${p.osm_id || ""}-${p.name || ""}`, label: parts.join(", ") };
      });
      setSuggestions(items);
    } catch (e) {
      if (e.name !== "AbortError") setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const onInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
    if (timerRef.current) clearTimeout(timerRef.current);
    if (v.trim().length < 3) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    setOpen(true);
    timerRef.current = setTimeout(() => fetchSuggestions(v.trim()), 300);
  };

  const select = (item) => {
    onChange(item.label);
    setQuery(item.label);
    setOpen(false);
  };

  const onBlur = () => {
    setTimeout(() => setOpen(false), 150); // allow click
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={onInput}
        autoComplete="off"
        onBlur={onBlur}
        onFocus={() => {
          if (suggestions.length > 0 && query.trim().length >= 3) setOpen(true);
        }}
        style={{
          width: "100%",
          padding: "12px 15px",
          borderRadius: "8px",
          border: "1px solid #ccc",
          outline: "none",
          fontSize: "16px",
          boxSizing: "border-box",
        }}
      />
      {open && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            zIndex: 1000,
            background: "white",
            listStyle: "none",
            padding: 0,
            margin: 0,
            width: "100%",
            border: "1px solid #ccc",
            maxHeight: "180px",
            overflowY: "auto",
            cursor: "pointer",
            borderRadius: "0 0 8px 8px",
            boxShadow: "0 9px 20px rgba(32, 35, 42, 0.2)",
          }}
        >
          {loading && <li style={{ padding: "8px 10px", color: "#666" }}>Searching...</li>}
          {!loading &&
            suggestions.map((s, i) => (
              <li
                key={s.id || i}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => select(s)}
                style={{ padding: "8px 10px", borderTop: "1px solid #f1f5f9" }}
              >
                {s.label}
              </li>
            ))}
          {!loading && suggestions.length === 0 && query.trim().length >= 3 && (
            <li style={{ padding: "8px 10px", color: "#64748b" }}>No results</li>
          )}
        </ul>
      )}
    </div>
  );
}
