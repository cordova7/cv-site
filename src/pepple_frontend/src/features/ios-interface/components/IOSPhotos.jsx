import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import '../styles/IOSPhotos.css';

const PORTFOLIO_TITLE = (process.env.NEXT_PUBLIC_PORTFOLIO_TITLE || 'Portfolio').trim() || 'Portfolio';

const DEFAULT_PROJECTS = [
  {
    id: 'project-1',
    title: 'Trading Bot Suite',
    image: '/assets/memes-app/meme1.png',
    code: `// Example project code\nexport function runBot() {\n  return 'ready';\n}\n`,
    codeLanguage: 'ts',
  },
  {
    id: 'prysm',
    title: 'Prysm',
    image: '/projects/prysm/website.png',
    link: 'https://prysm-cc.vercel.app/',
    files: [
      { label: 'app/page.js', url: '/projects/prysm/app/page.js' },
      { label: 'app/layout.js', url: '/projects/prysm/app/layout.js' },
      { label: 'components/TokenCardTabs.jsx', url: '/projects/prysm/components/TokenCardTabs.jsx' },
      { label: 'components/TokenChart.js', url: '/projects/prysm/components/TokenChart.js' },
      { label: 'components/Header.js', url: '/projects/prysm/components/Header.js' },
      { label: 'lib/icpswap-transactions.js', url: '/projects/prysm/lib/icpswap-transactions.js' },
      { label: 'lib/portfolio-store.ts', url: '/projects/prysm/lib/portfolio-store.txt' },
      { label: 'lib/validate-env.ts', url: '/projects/prysm/lib/validate-env.txt' },
      { label: 'design-system/colors.css', url: '/projects/prysm/design-system/colors.css' },
      { label: 'middleware.js', url: '/projects/prysm/middleware.js' },
    ],
  },
  {
    id: 'project-2',
    title: 'On-chain Analytics',
    image: '/assets/memes-app/meme2.png',
    codeUrl: '/projects/onchain-analytics.txt',
    codeLanguage: 'txt',
  },
  {
    id: 'project-3',
    title: 'Frontend Dashboard',
    image: '/assets/memes-app/meme3.png',
    code: `// Add your project files here\nconst app = {\n  name: 'Dashboard',\n};\n`,
    codeLanguage: 'js',
  },
];

const IOSPhotos = ({ projects: initialProjects = DEFAULT_PROJECTS, title = PORTFOLIO_TITLE }) => {
  const [projects, setProjects] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [codeById, setCodeById] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const modalRef = useRef(null);

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        const processedProjects = initialProjects.map((project, index) => ({
          ...project,
          id: project.id || `project-${index}`,
          alt: project.alt || project.title || `Project ${index + 1}`,
          error: false,
        }));

        setProjects(processedProjects);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, [initialProjects]);

  const handlePhotoClick = useCallback((index) => {
    setCurrentIndex(index);
    setIsModalOpen(true);
    setIsZoomed(false);

    setTimeout(() => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    }, 100);
  }, []);

  const handleImageError = useCallback((id) => {
    setProjects((prevProjects) =>
      prevProjects.map((project) =>
        project.id === id ? { ...project, error: true } : project
      )
    );
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setIsZoomed(false);
    const photoGrid = document.querySelector('.photos-grid');
    if (photoGrid) {
      photoGrid.focus();
    }
  }, []);

  const handlePrevPhoto = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : projects.length - 1
    );
    setIsZoomed(false);
  }, [projects.length]);

  const handleNextPhoto = useCallback(() => {
    setCurrentIndex((prevIndex) =>
      prevIndex < projects.length - 1 ? prevIndex + 1 : 0
    );
    setIsZoomed(false);
  }, [projects.length]);

  const handleZoomToggle = useCallback(() => {
    setIsZoomed((prevZoom) => !prevZoom);
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (!isModalOpen) return;

    switch (e.key) {
      case 'Escape':
        handleCloseModal();
        break;
      case 'ArrowLeft':
        handlePrevPhoto();
        break;
      case 'ArrowRight':
        handleNextPhoto();
        break;
      case ' ':
        e.preventDefault();
        handleZoomToggle();
        break;
      default:
        break;
    }
  }, [isModalOpen, handleCloseModal, handlePrevPhoto, handleNextPhoto, handleZoomToggle]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const currentProject = projects[currentIndex] || {};
  const projectFiles = currentProject?.files ?? [];
  const activeFile = selectedFile || projectFiles[0] || null;
  const currentCode = useMemo(() => {
    if (activeFile?.url && currentProject?.id) {
      const key = `${currentProject.id}:${activeFile.url}`;
      return codeById[key] || '';
    }
    if (currentProject?.code) return currentProject.code;
    if (currentProject?.id && codeById[currentProject.id]) return codeById[currentProject.id];
    return '';
  }, [activeFile, codeById, currentProject]);

  useEffect(() => {
    if (!isModalOpen) return;
    if (!projectFiles.length) {
      setSelectedFile(null);
      return;
    }
    setSelectedFile((prev) => prev || projectFiles[0]);
  }, [isModalOpen, projectFiles]);

  useEffect(() => {
    if (!isModalOpen || !currentProject?.id) return;

    if (activeFile?.url) {
      const key = `${currentProject.id}:${activeFile.url}`;
      if (codeById[key]) return;
      const loadCode = async () => {
        try {
          const res = await fetch(activeFile.url, { cache: 'no-store' });
          const text = await res.text();
          setCodeById((prev) => ({ ...prev, [key]: text }));
        } catch {
          setCodeById((prev) => ({ ...prev, [key]: 'Unable to load code.' }));
        }
      };
      loadCode();
      return;
    }

    if (!currentProject?.codeUrl) return;
    if (codeById[currentProject.id]) return;

    const loadCode = async () => {
      try {
        const res = await fetch(currentProject.codeUrl, { cache: 'no-store' });
        const text = await res.text();
        setCodeById((prev) => ({ ...prev, [currentProject.id]: text }));
      } catch {
        setCodeById((prev) => ({ ...prev, [currentProject.id]: 'Unable to load code.' }));
      }
    };

    loadCode();
  }, [activeFile, codeById, currentProject, isModalOpen]);

  const copyCode = async () => {
    if (!currentCode) return;
    try {
      await navigator.clipboard.writeText(currentCode);
    } catch {
      window.prompt('Copy code:', currentCode);
    }
  };

  return (
    <div className="ios-photos">
      <div className="photos-header">
        <h1>{title}</h1>
        <div className="photos-pagination" aria-live="polite">
          {isLoading ? 'Loading...' : `${projects.length}`}
        </div>
      </div>

      <div
        className="photos-grid"
        role="grid"
        aria-label="Project gallery"
        tabIndex="0"
      >
        {isLoading ? (
          <div className="loading-indicator" aria-live="polite">Loading...</div>
        ) : projects.length > 0 ? (
          projects.map((project, index) => (
            <div
              key={project.id}
              className="photo-item"
              role="gridcell"
              tabIndex="0"
              onClick={() => handlePhotoClick(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handlePhotoClick(index);
                }
              }}
              aria-label={`${project.title || `Project ${index + 1}`}. Press Enter to view details.`}
            >
              {project.error ? (
                <div className="photo-error">Unable to load image</div>
              ) : (
                <img
                  src={project.image}
                  alt={project.alt}
                  loading="lazy"
                  decoding="async"
                  onError={() => handleImageError(project.id)}
                />
              )}
              <div className="photo-caption">{project.title || `Project ${index + 1}`}</div>
            </div>
          ))
        ) : (
          <div className="no-photos" role="status">No projects to display</div>
        )}
      </div>

      {isModalOpen && currentProject && (
        <div
          className="photo-detail-modal"
          role="dialog"
          aria-modal="true"
          aria-label="Project detail view"
          ref={modalRef}
          tabIndex="-1"
        >
          <div className="photo-detail-header">
            <button
              className="nav-button"
              onClick={handlePrevPhoto}
              aria-label="Previous project"
            >
              ←
            </button>
            <div className="photo-detail-title">{currentProject.title || `Project ${currentIndex + 1}`}</div>
            {currentProject.link ? (
              <a
                className="photo-detail-link"
                href={currentProject.link}
                target="_blank"
                rel="noreferrer"
                aria-label="Open website"
              >
                Website
              </a>
            ) : null}
            <button
              className="close-button"
              onClick={handleCloseModal}
              aria-label="Close project view"
            >
              ×
            </button>
            <button
              className="nav-button"
              onClick={handleNextPhoto}
              aria-label="Next project"
            >
              →
            </button>
          </div>

          <div className="photo-detail-content">
            {currentProject.error ? (
              <div className="photo-error">Unable to load image</div>
            ) : (
              <img
                src={currentProject.image}
                alt={currentProject.alt}
                className={isZoomed ? 'zoomed' : ''}
                onClick={handleZoomToggle}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleZoomToggle();
                  }
                }}
                tabIndex="0"
                aria-label={`${currentProject.title || `Project ${currentIndex + 1}`}. Press Space to ${isZoomed ? 'zoom out' : 'zoom in'}.`}
              />
            )}
            <div className="photo-count" aria-live="polite">
              {currentIndex + 1} / {projects.length}
            </div>
          </div>

          <div className="photo-controls">
            <div className="control-hint">
              Use arrow keys to navigate, space to zoom, ESC to close
            </div>
          </div>

          <div className="photo-code-block" aria-label="Project code">
            <div className="photo-code-header">
              <div className="photo-code-title">Project files</div>
              <button type="button" className="photo-code-copy" onClick={copyCode}>
                Copy
              </button>
            </div>
            {projectFiles.length > 0 ? (
              <div className="photo-code-body">
                <div className="photo-code-files" role="list">
                  {projectFiles.map((file) => {
                    const isActive = selectedFile?.url === file.url;
                    return (
                      <button
                        key={file.url}
                        type="button"
                        className={`photo-code-file ${isActive ? 'active' : ''}`}
                        onClick={() => setSelectedFile(file)}
                        role="listitem"
                      >
                        {file.label}
                      </button>
                    );
                  })}
                </div>
                <div className="photo-code-preview">
                  {currentCode ? (
                    <pre className="photo-code-pre">
                      <code>{currentCode}</code>
                    </pre>
                  ) : (
                    <div className="photo-code-empty">Select a file to preview</div>
                  )}
                </div>
              </div>
            ) : currentCode ? (
              <pre className="photo-code-pre">
                <code>{currentCode}</code>
              </pre>
            ) : (
              <div className="photo-code-empty">No code attached</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default IOSPhotos;
