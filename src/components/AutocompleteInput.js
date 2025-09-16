import React, { useEffect, useRef, useState } from "react";

export default function AutocompleteInput({
  value,
  onChange,
  placeholder = "Search place",
  minChars = 3,
  limit = 5,
  disabled = false,
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1); // for keyboard nav

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

  // Sync internal query with controlled value from parent
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  const fetchSuggestions = async (q) => {
    if (abortRef.current) abortRef.current.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(q)}&limit=${limit}`;
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error("Photon error");
      const data = await res.json();

      const items = (data.features || []).map((f) => {
        const p = f.properties || {};
        const parts = [p.name, p.street, p.city, p.state, p.country].filter(Boolean);
        return {
          id: `${p.osm_id || ""}-${p.name || ""}-${p.postcode || ""}`,
          label: parts.join(", "),
        };
      });

      setSuggestions(items);
      setActiveIndex(items.length ? 0 : -1);
    } catch (e) {
      if (e.name !== "AbortError") {
        setSuggestions([]);
        setActiveIndex(-1);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInput = (e) => {
    const v = e.target.value;
    setQuery(v);
    onChange?.(v);

    if (timerRef.current) clearTimeout(timerRef.current);

    if (v.trim().length < minChars) {
      setSuggestions([]);
      setOpen(false);
      setActiveIndex(-1);
      return;
    }

    setOpen(true);
    timerRef.current = setTimeout(() => fetchSuggestions(v.trim()), 300);
  };

  const handleSelect = (item) => {
    onChange?.(item.label);
    setQuery(item.label);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleBlur = () => {
    // Delay closing so click on suggestion still registers
    setTimeout(() => setOpen(false), 150);
  };

  const handleKeyDown = (e) => {
    if (!open || !suggestions.length) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((idx) => (idx + 1) % suggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((idx) => (idx - 1 + suggestions.length) % suggestions.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < suggestions.length) {
        handleSelect(suggestions[activeIndex]);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  };

  return (
    <div style={{ position: "relative" }}>
      <input
        ref={inputRef}
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        disabled={disabled}
        aria-autocomplete="list"
        aria-expanded={open}
        aria-controls="ac-listbox"
        aria-activedescendant={
          open && activeIndex >= 0 ? `ac-option-${suggestions[activeIndex]?.id}` : undefined
        }
        style={{
          width: "100%",
          padding: "12px 14px",
          border: "1px solid #ccc",
          borderRadius: "10px",
          fontSize: "16px",
          outline: "none",
          transition: "border-color 0.2s",
        }}
        onFocus={() => {
          if (query.trim().length >= minChars && suggestions.length) setOpen(true);
        }}
      />

      {open && (
        <div
          ref={listRef}
          id="ac-listbox"
          role="listbox"
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "#fff",
            border: "1px solid #e6e6e6",
            borderTop: "none",
            borderRadius: "0 0 10px 10px",
            boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
            zIndex: 1000,
            maxHeight: "240px",
            overflowY: "auto",
          }}
        >
          {loading && (
            <div style={{ padding: "10px 12px", color: "#666", fontSize: "14px" }}>
              Searching...
            </div>
          )}

          {!loading && suggestions.length === 0 && (
            <div style={{ padding: "10px 12px", color: "#999", fontSize: "14px" }}>
              No suggestions
            </div>
          )}

          {!loading &&
            suggestions.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <div
                  key={item.id}
                  id={`ac-option-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={(e) => e.preventDefault()} // prevent input blur before click
                  onClick={() => handleSelect(item)}
                  style={{
                    padding: "10px 12px",
                    cursor: "pointer",
                    background: isActive ? "#f0f7ff" : "#fff",
                    borderBottom: "1px solid #f5f5f5",
                    color: "#333",
                    fontSize: "15px",
                  }}
                >
                  {item.label}
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
}
