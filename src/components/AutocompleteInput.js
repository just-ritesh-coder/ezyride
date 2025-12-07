import React, { useEffect, useRef, useState } from "react";
import styled, { keyframes } from "styled-components";
import { FaMapMarkerAlt, FaSpinner, FaSearch } from "react-icons/fa";

export default function AutocompleteInput({
  value,
  onChange,
  onPick, // optional: receives full item with {label, lat, lon}
  placeholder = "Search place",
  minChars = 3,
  limit = 5,
  disabled = false,
}) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const abortRef = useRef(null);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);

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
        const coords = Array.isArray(f.geometry?.coordinates) ? f.geometry.coordinates : null;
        return {
          id: `${p.osm_id || ""}-${p.name || ""}-${p.postcode || ""}`,
          label: parts.join(", "),
          lon: coords ? Number(coords[0]) : undefined,
          lat: coords ? Number(coords[1]) : undefined,
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
    onPick?.(item);
    setOpen(false);
    setActiveIndex(-1);
  };

  const handleBlur = () => {
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
    <InputContainer>
      <InputWrapper>
        <InputIcon>
          <FaMapMarkerAlt />
        </InputIcon>
        <StyledInput
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          disabled={disabled}
          aria-autocomplete="list"
          aria-controls={open && suggestions.length ? "ac-listbox" : undefined}
          aria-activedescendant={
            open && activeIndex >= 0 ? `ac-option-${suggestions[activeIndex]?.id}` : undefined
          }
          onFocus={() => {
            if (query.trim().length >= minChars && suggestions.length) setOpen(true);
          }}
        />
        {loading && (
          <LoadingIcon>
            <FaSpinner />
          </LoadingIcon>
        )}
      </InputWrapper>

      {open && (
        <SuggestionsList
          ref={listRef}
          id="ac-listbox"
          role="listbox"
        >
          {loading && (
            <LoadingState>
              <FaSpinner /> <span>Searching...</span>
            </LoadingState>
          )}

          {!loading && suggestions.length === 0 && (
            <EmptyState>
              <FaSearch /> <span>No suggestions found</span>
            </EmptyState>
          )}

          {!loading &&
            suggestions.map((item, idx) => {
              const isActive = idx === activeIndex;
              return (
                <SuggestionItem
                  key={item.id}
                  id={`ac-option-${item.id}`}
                  role="option"
                  aria-selected={isActive}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => handleSelect(item)}
                  $active={isActive}
                >
                  <SuggestionIcon><FaMapMarkerAlt /></SuggestionIcon>
                  <SuggestionText>{item.label}</SuggestionText>
                </SuggestionItem>
              );
            })}
        </SuggestionsList>
      )}
    </InputContainer>
  );
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const InputContainer = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const InputIcon = styled.div`
  position: absolute;
  left: 16px;
  color: #1e90ff;
  font-size: 1.1rem;
  z-index: 1;
  pointer-events: none;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const LoadingIcon = styled.div`
  position: absolute;
  right: 16px;
  color: #1e90ff;
  font-size: 1rem;
  z-index: 1;
  pointer-events: none;
  animation: ${spin} 1s linear infinite;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const StyledInput = styled.input`
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 2px solid #e1e5e9;
  border-radius: 12px;
  font-size: 16px;
  outline: none;
  background-color: #fafbfc;
  transition: all 0.3s ease;
  font-family: 'Poppins', sans-serif;
  min-height: 52px;

  &::placeholder {
    color: #9ca3af;
  }

  &:hover:not(:disabled) { 
    border-color: #b8c5d1;
    background-color: #fff;
  }
  
  &:focus {
    border-color: #1e90ff;
    background-color: #fff;
    box-shadow: 0 0 0 4px rgba(30, 144, 255, 0.1);
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const SuggestionsList = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e1e5e9;
  border-top: none;
  border-radius: 0 0 12px 12px;
  box-shadow: 0 10px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
  z-index: 1000;
  max-height: 280px;
  overflow-y: auto;
  animation: ${fadeIn} 0.3s ease-out;
  margin-top: 2px;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: rgba(30, 144, 255, 0.3);
    border-radius: 3px;
    
    &:hover {
      background: rgba(30, 144, 255, 0.5);
    }
  }
`;

const LoadingState = styled.div`
  padding: 16px 20px;
  color: #1e90ff;
  font-size: 14px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  background: linear-gradient(135deg, #f0f7ff 0%, #e8f4ff 100%);
  
  svg {
    font-size: 1rem;
    animation: ${spin} 1s linear infinite;
  }
`;

const EmptyState = styled.div`
  padding: 20px;
  color: #999;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  
  svg {
    font-size: 1.5rem;
    color: #ccc;
  }
`;

const SuggestionItem = styled.div`
  padding: 12px 16px;
  cursor: pointer;
  background: ${props => props.$active 
    ? 'linear-gradient(135deg, #e8f4ff 0%, #d6ebff 100%)' 
    : '#fff'};
  border-bottom: 1px solid rgba(30, 144, 255, 0.1);
  color: #333;
  font-size: 15px;
  display: flex;
  align-items: center;
  gap: 12px;
  transition: all 0.2s ease;
  
  &:hover {
    background: linear-gradient(135deg, #e8f4ff 0%, #d6ebff 100%);
    transform: translateX(4px);
  }
  
  &:last-child {
    border-bottom: none;
  }
`;

const SuggestionIcon = styled.div`
  color: #1e90ff;
  font-size: 1rem;
  flex-shrink: 0;
  
  svg {
    width: 100%;
    height: 100%;
  }
`;

const SuggestionText = styled.span`
  flex: 1;
  min-width: 0;
  line-height: 1.4;
`;
