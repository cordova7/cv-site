import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';

const cvName = (process.env.NEXT_PUBLIC_CV_NAME || 'Marco Cordova').trim() || 'Marco Cordova';

const defaultNotes = [
  {
    id: 1,
    title: 'Perfil',
    content:
      `Especialista en sistemas cripto, frontend, automatizacion avanzada y productos web complejos. Experiencia construyendo bots de trading, servicios backend con logica financiera y tooling para comunidades a gran escala.`,
  },
  {
    id: 2,
    title: 'Capacidades Tecnicas',
    content:
      'Sistemas de trading automatizado: Diseño e implementacion de bots para ejecucion de estrategias en mercados cripto en tiempo real, con control de latencia, riesgo, estados de mercado volatiles y fallos parciales.\n\nServicios backend con integracion crypto: Construccion de servicios que manejan balances, pagos, wallets, trading, logica financiera, automatizacion operativa y estado sensible en produccion.\n\nSistemas on-chain de lectura y ejecucion: Procesamiento directo de historiales de transacciones, reconstruccion de balances desde eventos crudos, trazado de flujos de fondos entre wallets y ejecucion automatizada en Ethereum, Solana e ICP.\n\nInteraccion directa con nodos y smart contracts: Uso de RPCs, CLIs y tooling blockchain para firmar transacciones, automatizar flujos, depurar fallos on-chain y operar infraestructura cripto.\n\nAutomatizacion avanzada de sistemas: Scripting para instalaciones, despliegues, pipelines internos, procesos repetitivos, bots operativos y control de entornos productivos.\n\nBots y automatizacion multiplataforma: Desarrollo de sistemas automatizados para plataformas sociales y privadas: trading, juegos con apuestas en crypto, control de acceso por balances de tokens, moderacion programable y tooling para comunidades grandes.\n\nEspecializacion frontend: Interfaces web avanzadas con UX no estandar, comportamiento tipo app nativa, estado complejo en cliente y alto nivel de interaccion.\n\nIntegracion intensiva de APIs y protocolos no comunes: Trabajo extensivo con APIs de exchanges, blockchain, redes sociales, mensajeria y servicios externos, incluyendo protocolos no estandar.\n\nIntegracion de modelos de IA en sistemas productivos: Uso de APIs de modelos para automatizar flujos, ejecutar acciones, procesar contexto y ampliar capacidades en software real.\n\nInfraestructura practica y debugging profundo: Docker, Linux, Windows, WSL, despliegues serverless, entornos reproducibles y diagnostico de fallos complejos en produccion.',
  },
  {
    id: 3,
    title: 'Stack Tecnico',
    content:
      'Rust\nTypeScript\nNode.js\nJavaScript\nPython\nJava\nC#\nReact\nNext.js\nPostgreSQL\nSupabase\nDocker\nLinux\nWindows\nEthereum\nSolana\nICP\nCLI\nRPC\nAPIs\nAutomatizacion',
  },
].map((note, index) => ({
  ...note,
  lastModified: new Date(Date.now() - index * 3600 * 1000).toISOString(),
}));

const STORAGE_KEY = 'peppleNotes';
const META_KEY = 'peppleNotesMeta';

const normalizeNotes = (items) =>
  items.map((note, index) => {
    const parsedDate = Date.parse(note.lastModified);
    const lastModified = Number.isNaN(parsedDate)
      ? new Date(Date.now() - index * 3600 * 1000).toISOString()
      : note.lastModified;

    return {
      id: note.id ?? `${Date.now()}-${index}`,
      title: note.title || 'Untitled',
      content: note.content || '',
      lastModified,
      pinned: Boolean(note.pinned),
    };
  });

const deriveTitle = (content) => {
  const firstLine = content.split('\n').find((line) => line.trim().length > 0);
  if (!firstLine) return 'Untitled';
  return firstLine.trim().slice(0, 48);
};

const formatDate = (dateString) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return 'Updated just now';

  const now = new Date();
  const sameDay = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (sameDay) {
    return date.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
  }
  if (isYesterday) return 'Yesterday';

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

const getPreviewLine = (content) => {
  if (!content) return '';
  const line = content
    .split('\n')
    .map((item) => item.trim())
    .find((item) => item.length > 0);
  return line ?? '';
};

const getTags = (content) => {
  if (!content) return [];
  const tags = new Set();
  const matches = content.match(/(^|\\s)#([a-z0-9_\\-]{2,32})/gi) ?? [];
  matches.forEach((match) => {
    const tag = match.trim().replace(/^#/, '').toLowerCase();
    if (tag) tags.add(tag);
  });
  return Array.from(tags).slice(0, 3);
};

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mediaQueryList = window.matchMedia(query);
    const listener = (event) => setMatches(event.matches);

    setMatches(mediaQueryList.matches);
    mediaQueryList.addEventListener?.('change', listener);
    mediaQueryList.addListener?.(listener);

    return () => {
      mediaQueryList.removeEventListener?.('change', listener);
      mediaQueryList.removeListener?.(listener);
    };
  }, [query]);

  return matches;
};

const IOSNotes = () => {
  const [notes, setNotes] = useState([]);
  const [activeNoteId, setActiveNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isHydrated, setIsHydrated] = useState(false);
  const [compactView, setCompactView] = useState('list');

  const widgetRef = useRef(null);
  const smallViewport = useMediaQuery('(max-width: 720px)');
  const [containerCompact, setContainerCompact] = useState(false);
  const isCompact = smallViewport || containerCompact;
  const titleInputRef = useRef(null);
  const contentInputRef = useRef(null);
  const pendingFocusRef = useRef(null);

  const createId = () => {
    if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID();
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  };

  useEffect(() => {
    const savedNotes = localStorage.getItem(STORAGE_KEY);
    const savedMeta = localStorage.getItem(META_KEY);

    const resolveInitialActiveId = (normalizedNotes) => {
      if (!savedMeta) return normalizedNotes[0]?.id ?? null;
      try {
        const parsed = JSON.parse(savedMeta);
        const storedActiveId = parsed?.activeNoteId ?? null;
        return normalizedNotes.some((note) => note.id === storedActiveId) ? storedActiveId : normalizedNotes[0]?.id ?? null;
      } catch (error) {
        return normalizedNotes[0]?.id ?? null;
      }
    };

    if (savedNotes) {
      try {
        const parsed = JSON.parse(savedNotes);
        const normalized = normalizeNotes(Array.isArray(parsed) ? parsed : parsed?.notes ?? []);
        setNotes(normalized);
        setActiveNoteId(resolveInitialActiveId(normalized));
      } catch (error) {
        setNotes(defaultNotes);
        setActiveNoteId(defaultNotes[0]?.id ?? null);
      }
    } else {
      setNotes(defaultNotes);
      setActiveNoteId(defaultNotes[0]?.id ?? null);
    }

    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget || typeof ResizeObserver === 'undefined') return;

    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      const width = entry?.contentRect?.width ?? widget.clientWidth ?? 0;
      setContainerCompact(width > 0 ? width < 720 : false);
    });

    observer.observe(widget);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
  }, [notes, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    localStorage.setItem(META_KEY, JSON.stringify({ activeNoteId }));
  }, [activeNoteId, isHydrated]);

  useEffect(() => {
    if (!isCompact) return;
    setCompactView((prev) => (prev === 'editor' && !activeNoteId ? 'list' : prev));
  }, [activeNoteId, isCompact]);

  useEffect(() => {
    if (!pendingFocusRef.current) return;
    if (!activeNoteId || pendingFocusRef.current !== activeNoteId) return;
    pendingFocusRef.current = null;

    window.requestAnimationFrame(() => {
      const target = titleInputRef.current?.value ? contentInputRef.current : titleInputRef.current;
      target?.focus?.();
    });
  }, [activeNoteId]);

  const sortedNotes = useMemo(() => {
    return [...notes].sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime();
    });
  }, [notes]);

  const filteredNotes = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return sortedNotes;
    return sortedNotes.filter((note) => {
      const tags = getTags(note.content);
      return (
        note.title.toLowerCase().includes(query) ||
        note.content.toLowerCase().includes(query) ||
        tags.some((tag) => tag.includes(query.replace(/^#/, '')))
      );
    });
  }, [sortedNotes, searchQuery]);

  const activeNote = notes.find((note) => note.id === activeNoteId) || null;

  const createNewNote = useCallback(() => {
    const newNote = {
      id: createId(),
      title: 'Untitled',
      content: '',
      lastModified: new Date().toISOString(),
      pinned: false,
    };

    setNotes((prevNotes) => [newNote, ...prevNotes]);
    setActiveNoteId(newNote.id);
    setSearchQuery('');
    if (isCompact) setCompactView('editor');
    pendingFocusRef.current = newNote.id;
  }, [isCompact]);

  const updateNote = (noteId, updates) => {
    const timestamp = new Date().toISOString();
    setNotes((prevNotes) =>
      prevNotes.map((note) =>
        note.id === noteId ? { ...note, ...updates, lastModified: timestamp } : note
      )
    );
  };

  const handleTitleChange = (event) => {
    if (!activeNoteId) return;
    const title = event.target.value || 'Untitled';
    updateNote(activeNoteId, { title });
  };

  const handleContentChange = (event) => {
    if (!activeNoteId) return;
    const content = event.target.value;
    const shouldDeriveTitle = !activeNote?.title || activeNote.title === 'Untitled';
    updateNote(activeNoteId, {
      content,
      title: shouldDeriveTitle ? deriveTitle(content) : activeNote.title,
    });
  };

  const selectNote = (noteId) => {
    setActiveNoteId(noteId);
    if (isCompact) setCompactView('editor');
  };

  const togglePinned = () => {
    if (!activeNoteId) return;
    const nextPinned = !activeNote?.pinned;
    updateNote(activeNoteId, { pinned: nextPinned });
  };

  const duplicateNote = () => {
    if (!activeNote) return;
    const clone = {
      ...activeNote,
      id: createId(),
      title: `${activeNote.title || 'Untitled'} Copy`,
      lastModified: new Date().toISOString(),
      pinned: false,
    };

    setNotes((prev) => [clone, ...prev]);
    setActiveNoteId(clone.id);
    if (isCompact) setCompactView('editor');
    pendingFocusRef.current = clone.id;
  };

  const shareNote = async () => {
    if (!activeNote) return;
    const text = `${activeNote.title || 'Untitled'}\n\n${activeNote.content || ''}`.trim();

    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      window.prompt('Copy note:', text);
    }
  };

  const handleDeleteNote = () => {
    if (!activeNoteId) return;
    if (!window.confirm('Delete this note?')) return;
    setNotes((prevNotes) => {
      const nextNotes = prevNotes.filter((note) => note.id !== activeNoteId);
      setActiveNoteId(nextNotes[0]?.id ?? null);
      if (nextNotes.length === 0 && isCompact) setCompactView('list');
      return nextNotes;
    });
  };

  const pinnedNotes = useMemo(() => filteredNotes.filter((note) => note.pinned), [filteredNotes]);
  const regularNotes = useMemo(() => filteredNotes.filter((note) => !note.pinned), [filteredNotes]);
  const tagsForActive = useMemo(() => getTags(activeNote?.content ?? ''), [activeNote?.content]);

  useEffect(() => {
    const onKeyDown = (event) => {
      const isCommand = event.metaKey || event.ctrlKey;
      if (!isCommand) return;
      if (event.key.toLowerCase() === 'n') {
        event.preventDefault();
        createNewNote();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [createNewNote]);

  return (
    <div className="ios-notes-app">
      <div className="ios-notes-widget" ref={widgetRef}>
        <div className="notes-widget-header" role="toolbar" aria-label="Notes toolbar">
          <div className="notes-widget-title">
            {isCompact && compactView === 'editor' ? (
              <button
                className="notes-toolbar-button notes-toolbar-back"
                onClick={() => setCompactView('list')}
                type="button"
              >
                Back
              </button>
            ) : null}
            <span className="notes-toolbar-title">Notes</span>
          </div>
          <div className="notes-toolbar-actions">
            <button
              className="notes-toolbar-button"
              onClick={createNewNote}
              type="button"
              aria-label="New note"
              title="New note (⌘N)"
            >
              New
            </button>
          </div>
        </div>
        <div className="notes-widget-body" data-compact={isCompact ? 'true' : 'false'} data-view={compactView}>
          <div className="notes-list-pane" hidden={isCompact && compactView === 'editor'}>
            <div className="notes-search-row">
              <input
                className="notes-search-input"
                type="search"
                placeholder="Search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                aria-label="Search notes"
              />
              <div className="notes-count">{filteredNotes.length} notes</div>
            </div>
            <div className="notes-list">
              {filteredNotes.length === 0 ? (
                <div className="notes-list-empty">
                  No matches. Try a different keyword or clear search.
                </div>
              ) : (
                <>
                  {pinnedNotes.length > 0 ? (
                    <div className="notes-section" aria-label="Pinned">
                      <div className="notes-section-label">Pinned</div>
                      {pinnedNotes.map((note) => {
                        const tags = getTags(note.content);
                        return (
                          <button
                            key={note.id}
                            type="button"
                            className={`notes-list-item ${note.id === activeNoteId ? 'active' : ''}`}
                            onClick={() => selectNote(note.id)}
                            aria-current={note.id === activeNoteId ? 'true' : 'false'}
                          >
                            <div className="notes-item-row">
                              <div className="notes-item-title">{note.title || 'Untitled'}</div>
                              <div className="notes-item-date">{formatDate(note.lastModified)}</div>
                            </div>
                            <div className="notes-item-preview">{getPreviewLine(note.content) || 'Start writing...'}</div>
                            {tags.length > 0 ? (
                              <div className="notes-item-tags">
                                {tags.map((tag) => (
                                  <span key={tag} className="notes-tag">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}

                  {regularNotes.length > 0 ? (
                    <div className="notes-section" aria-label="All notes">
                      {pinnedNotes.length > 0 ? <div className="notes-section-label">Notes</div> : null}
                      {regularNotes.map((note) => {
                        const tags = getTags(note.content);
                        return (
                          <button
                            key={note.id}
                            type="button"
                            className={`notes-list-item ${note.id === activeNoteId ? 'active' : ''}`}
                            onClick={() => selectNote(note.id)}
                            aria-current={note.id === activeNoteId ? 'true' : 'false'}
                          >
                            <div className="notes-item-row">
                              <div className="notes-item-title">{note.title || 'Untitled'}</div>
                              <div className="notes-item-date">{formatDate(note.lastModified)}</div>
                            </div>
                            <div className="notes-item-preview">{getPreviewLine(note.content) || 'Start writing...'}</div>
                            {tags.length > 0 ? (
                              <div className="notes-item-tags">
                                {tags.map((tag) => (
                                  <span key={tag} className="notes-tag">
                                    #{tag}
                                  </span>
                                ))}
                              </div>
                            ) : null}
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </>
              )}
            </div>
          </div>
          <div className="notes-editor-pane" hidden={isCompact && compactView === 'list'}>
            {activeNote ? (
              <div className="notes-editor">
                <div className="notes-editor-toolbar">
                  <div className="notes-editor-date">Updated {formatDate(activeNote.lastModified)}</div>
                  <div className="notes-editor-actions">
                    <button className="notes-action-button" onClick={togglePinned} type="button">
                      {activeNote.pinned ? 'Unpin' : 'Pin'}
                    </button>
                    <button className="notes-action-button" onClick={shareNote} type="button">
                      Copy
                    </button>
                    <button className="notes-action-button" onClick={duplicateNote} type="button">
                      Duplicate
                    </button>
                    <button
                      className="notes-action-button danger"
                      onClick={handleDeleteNote}
                      type="button"
                    >
                      Delete
                    </button>
                  </div>
                </div>
                {tagsForActive.length > 0 ? (
                  <div className="notes-editor-tags" aria-label="Tags">
                    {tagsForActive.map((tag) => (
                      <span key={tag} className="notes-tag">
                        #{tag}
                      </span>
                    ))}
                  </div>
                ) : null}
                <input
                  ref={titleInputRef}
                  className="notes-editor-title"
                  value={activeNote.title}
                  onChange={handleTitleChange}
                  placeholder="Title"
                  aria-label="Note title"
                />
                <textarea
                  ref={contentInputRef}
                  className="notes-editor-textarea"
                  value={activeNote.content}
                  onChange={handleContentChange}
                  placeholder="Write something..."
                  aria-label="Note content"
                />
              </div>
            ) : (
              <div className="notes-empty">
                <div className="notes-empty-title">Nothing here yet</div>
                <div className="notes-empty-subtitle">
                  Create your first note. Keep the trenches tidy.
                </div>
                <button className="notes-primary-button" onClick={createNewNote} type="button">
                  New Note
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IOSNotes;
