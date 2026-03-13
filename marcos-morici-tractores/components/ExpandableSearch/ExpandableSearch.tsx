'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import './ExpandableSearch.css';

const SEARCH_INPUT_ID = 'header-search-input';

interface ExpandableSearchProps {
  placeholder?: string;
  ariaLabel?: string;
  /** Callback al enviar la búsqueda (Enter) */
  onSearch?: (query: string) => void;
}

export default function ExpandableSearch({
  placeholder = 'Buscar...',
  ariaLabel = 'Buscar',
  onSearch,
}: ExpandableSearchProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClose = useCallback(() => setIsExpanded(false), []);

  useClickOutside(wrapperRef, handleClose, isExpanded);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose();
    };
    if (isExpanded) {
      document.addEventListener('keydown', handleEscape);
    }
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isExpanded, handleClose]);

  useEffect(() => {
    if (isExpanded) {
      inputRef.current?.focus();
    }
  }, [isExpanded]);

  const handleToggle = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const query = inputRef.current?.value.trim();
    if (query && onSearch) {
      onSearch(query);
    }
  };

  return (
    <div
      ref={wrapperRef}
      className={`expandable-search ${isExpanded ? 'expandable-search--expanded' : ''}`}
      role="search"
    >
      <form onSubmit={handleSubmit} className="expandable-search__form">
        <input
          ref={inputRef}
          id={SEARCH_INPUT_ID}
          type="search"
          placeholder={placeholder}
          className="expandable-search__input"
          onFocus={() => setIsExpanded(true)}
          autoComplete="off"
          aria-expanded={isExpanded}
          aria-label={ariaLabel}
        />
        <button
          type="button"
          className="expandable-search__btn"
          aria-label={isExpanded ? 'Cerrar buscador' : ariaLabel}
          aria-expanded={isExpanded}
          aria-controls={SEARCH_INPUT_ID}
          onClick={handleToggle}
        >
          <SearchIcon aria-hidden={true} />
        </button>
      </form>
    </div>
  );
}

function SearchIcon({ 'aria-hidden': ariaHidden = true }: { 'aria-hidden'?: boolean }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={ariaHidden}
      className="expandable-search__icon"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}
