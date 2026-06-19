import React, { useState, useEffect, useCallback, useRef } from 'react';
import '../styles/IOSPhotos.css';

const PORTFOLIO_TITLE = 'Portfolio';

// ── Project definitions ─────────────────────────────────────────────────────
// screenshot: local /public path, or null for GitHub-only repos
// liveUrl: optional deployed URL (null = no web UI)
const PROJECTS = [
  {
    id: 'prysm',
    name: 'PRYSM',
    tagline: 'Full-stack token platform on the Internet Computer',
    description:
      'ICPSwap aggregator frontend with real-time blockchain indexer and token routing canister. Features portfolio tracking, rewards, and multi-token support.',
    screenshot: '/assets/portfolio-projects/prysm-screenshot.png',
    liveUrl: 'https://prysm-cc.vercel.app',
    githubUrl: 'https://github.com/cordova7/prysm',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stack: ['Next.js', 'Rust', 'Internet Computer', 'ICPSwap', 'PostgreSQL'],
    stars: null, // fetched live
    topics: ['defi', 'web3', 'icp', 'token-platform'],
  },
  {
    id: 'temple-os-tribute-icp',
    name: 'TempleOS Tribute',
    tagline: 'Browser-based tribute to Terry Davis\'s TempleOS',
    description:
      'A faithful recreation of the TempleOS desktop environment in the browser. Renders the classic 640x480 16-color display with HolyC terminal, interactive windows, and keyboard-driven navigation.',
    screenshot: '/assets/portfolio-projects/templeos-screenshot.png',
    liveUrl: 'https://temple-os-tribute-icp.vercel.app',
    githubUrl: 'https://github.com/cordova7/temple-os-tribute-icp',
    language: 'HTML/CSS/JS',
    languageColor: '#e34c26',
    stack: ['Vanilla HTML', 'CSS', 'JavaScript'],
    stars: null,
    topics: ['browser', 'retro', 'os-tribute'],
  },
  {
    id: 'telegram-economy-engine',
    name: 'Telegram Economy Engine',
    tagline: 'Virtual gambling economy bot for Telegram groups',
    description:
      'A configurable Telegram bot that gives every group its own gambling economy. Supports Points mode (free, instant) or ICRC-1 mode (real ICP/ckBTC on the Internet Computer). Ships 75+ tests and a full CI pipeline.',
    screenshot: null,
    liveUrl: null,
    githubUrl: 'https://github.com/cordova7/telegram-economy-engine',
    language: 'Rust',
    languageColor: '#dea584',
    stack: ['Rust', 'teloxide', 'PostgreSQL', 'ICRC-1', 'Docker'],
    stars: null,
    topics: ['telegram', 'bot', 'economy', 'icrc-1', 'icp'],
  },
  {
    id: 'icp-gamebot',
    name: 'icp_gamebot',
    tagline: 'Rust game bot for the Internet Computer',
    description:
      'A lightweight Rust-based game bot running on the Internet Computer. Handles game logic, player state, and ICP transfers for in-game economies.',
    screenshot: null,
    liveUrl: null,
    githubUrl: 'https://github.com/cordova7/icp_gamebot',
    language: 'Rust',
    languageColor: '#dea584',
    stack: ['Rust', 'Internet Computer', 'Canister'],
    stars: null,
    topics: ['icp', 'game', 'bot', 'rust'],
  },
];

// ── GitHub API ───────────────────────────────────────────────────────────────
async function fetchGithubMeta(repo) {
  try {
    const res = await fetch(`https://api.github.com/repos/cordova7/${repo}`, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      // Next.js edge cache for 5 minutes
      next: { revalidate: 300 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return { stars: data.stargazers_count ?? 0, forks: data.forks_count ?? 0 };
  } catch {
    return null;
  }
}

// ── Sub-components ───────────────────────────────────────────────────────────
const StarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
  </svg>
);

const GithubIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.6.11.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
  </svg>
);

const ExternalLinkIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
    <polyline points="15 3 21 3 21 9" />
    <line x1="10" y1="14" x2="21" y2="3" />
  </svg>
);

const CodeIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="16 18 22 12 16 6" />
    <polyline points="8 6 2 12 8 18" />
  </svg>
);

// ── Main component ────────────────────────────────────────────────────────────
const IOSPortfolio = ({ title = PORTFOLIO_TITLE }) => {
  const [projects, setProjects] = useState(PROJECTS);
  const [activeIndex, setActiveIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const modalRef = useRef(null);

  // Fetch GitHub stars for all repos in parallel
  useEffect(() => {
    const load = async () => {
      const ids = PROJECTS.filter((p) => !p.screenshot).map((p) => p.id);
      const results = await Promise.all(ids.map((id) => fetchGithubMeta(id)));
      setProjects((prev) =>
        prev.map((p) => {
          const idx = ids.indexOf(p.id);
          const meta = results[idx];
          return meta ? { ...p, stars: meta.stars } : p;
        }),
      );
      setIsLoading(false);
    };
    load();
  }, []);

  const openModal = useCallback((index) => {
    setActiveIndex(index);
    setModalOpen(true);
    setTimeout(() => modalRef.current?.focus(), 80);
  }, []);

  const closeModal = useCallback(() => {
    setModalOpen(false);
    document.querySelector('.ios-photos')?.focus();
  }, []);

  const prev = useCallback(() => {
    setActiveIndex((i) => (i - 1 + projects.length) % projects.length);
  }, [projects.length]);

  const next = useCallback(() => {
    setActiveIndex((i) => (i + 1) % projects.length);
  }, [projects.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!modalOpen) return;
    const handler = (e) => {
      if (e.key === 'Escape') closeModal();
      if (e.key === 'ArrowLeft') prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [modalOpen, closeModal, prev, next]);

  const project = projects[activeIndex];

  return (
    <div className="ios-photos" role="main">
      {/* Header */}
      <div className="photos-header">
        <h1>{title}</h1>
        <div className="photos-pagination" aria-live="polite">
          {isLoading ? 'Loading…' : `${projects.length} projects`}
        </div>
      </div>

      {/* Project grid */}
      <div className="photos-grid" role="grid" aria-label="Project gallery">
        {projects.map((proj, i) => (
          <div
            key={proj.id}
            className="photo-item"
            role="gridcell"
            tabIndex={0}
            onClick={() => openModal(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openModal(i);
              }
            }}
            aria-label={`${proj.name}. ${proj.tagline}`}
          >
            {proj.screenshot ? (
              <img
                src={proj.screenshot}
                alt={`${proj.name} screenshot`}
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="photo-item-no-screenshot">
                <div className="photo-item-no-screenshot-inner">
                  <CodeIcon />
                  <span>{proj.name}</span>
                </div>
              </div>
            )}
            <div className="photo-caption">{proj.name}</div>
          </div>
        ))}
      </div>

      {/* Detail modal */}
      {modalOpen && project && (
        <div
          className="photo-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`${project.name} detail`}
          ref={modalRef}
          tabIndex={-1}
        >
          {/* Modal header */}
          <div className="photo-detail-header">
            <button className="nav-button" onClick={prev} aria-label="Previous project" type="button">
              ←
            </button>
            <div className="photo-detail-title">{project.name}</div>
            <div className="photo-detail-actions">
              {project.githubUrl && (
                <a
                  className="photo-detail-link"
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View on GitHub"
                  type="button"
                >
                  <GithubIcon />
                  <span>GitHub</span>
                </a>
              )}
              {project.liveUrl && (
                <a
                  className="photo-detail-link"
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="View live site"
                  type="button"
                >
                  <ExternalLinkIcon />
                  <span>Live</span>
                </a>
              )}
            </div>
            <button className="close-button" onClick={closeModal} aria-label="Close" type="button">
              ×
            </button>
            <button className="nav-button" onClick={next} aria-label="Next project" type="button">
              →
            </button>
          </div>

          {/* Modal content */}
          <div className="photo-detail-content">
            {project.screenshot ? (
              <img
                src={project.screenshot}
                alt={`${project.name} screenshot`}
                className="photo-detail-image"
              />
            ) : (
              <div className="photo-detail-no-image">
                <div className="photo-detail-no-image-inner">
                  <CodeIcon />
                  <span>{project.name}</span>
                </div>
                <p>No live deployment — view on GitHub for source</p>
              </div>
            )}
            <div className="photo-count" aria-live="polite">
              {activeIndex + 1} / {projects.length}
            </div>
          </div>

          {/* Project info */}
          <div className="photo-code-block">
            <div className="photo-code-header">
              <span className="photo-code-title">About</span>
              <div className="project-meta-badges">
                <span
                  className="language-badge"
                  style={{ backgroundColor: project.languageColor + '33', color: project.languageColor }}
                >
                  <span className="language-dot" style={{ backgroundColor: project.languageColor }} />
                  {project.language}
                </span>
                {project.stars !== null && (
                  <span className="stars-badge">
                    <StarIcon />
                    {project.stars.toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            <div className="portfolio-about-body">
              <p className="portfolio-tagline">{project.tagline}</p>
              <p className="portfolio-description">{project.description}</p>

              <div className="portfolio-stack">
                <span className="portfolio-stack-label">Stack</span>
                <div className="portfolio-stack-tags">
                  {project.stack.map((tech) => (
                    <span key={tech} className="portfolio-stack-tag">{tech}</span>
                  ))}
                </div>
              </div>

              <div className="portfolio-topics">
                {project.topics.map((topic) => (
                  <span key={topic} className="portfolio-topic">#{topic}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSPortfolio;
