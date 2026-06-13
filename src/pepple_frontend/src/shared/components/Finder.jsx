import React, { useState, useEffect } from 'react';
import '../../css/Finder.css';

// In-app PDF / image / CSV previews are intentionally stubbed in the public
// version of this repo. The Finder still browses the file system; selecting a
// file opens it in a new tab so visitors can see the underlying asset directly.
const openInNewTab = (path) => {
  if (typeof window === 'undefined') return;
  window.open(path, '_blank', 'noopener,noreferrer');
};

const fileSystem = {
  Resume: {
    type: 'folder',
    contents: {
      'cv.pdf': { type: 'pdf', path: '/assets/docs/cv.pdf' }
    }
  },
  Experience: {
    type: 'folder',
    contents: {
      'stack-experience.csv': { type: 'csv', path: '/assets/data/stack-experience.csv' }
    }
  },
  Projects: {
    type: 'folder',
    contents: {
      'project-roadmap.png': { type: 'image', path: '/assets/images/roadmap.png' }
    }
  }
};

// Helper function to find a file by name in the file system
const findFileByName = (fileName) => {
  for (const folderName in fileSystem) {
    const folder = fileSystem[folderName];
    if (folder.type === 'folder' && folder.contents[fileName]) {
      return { 
        file: folder.contents[fileName], 
        path: [folderName] 
      };
    }
  }
  return null;
};

const Finder = () => {
  const [isMobile, setIsMobile] = useState(() => (typeof window !== 'undefined' ? window.innerWidth <= 768 : false));
  const [selectedFile, setSelectedFile] = useState(null);
  const [currentPath, setCurrentPath] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  if (isMobile) {
    return (
      <div className="finder-mobile-placeholder">
        <p>The Finder is desktop-only in this build.</p>
        <button type="button" onClick={() => openInNewTab('/assets/docs/cv.pdf')}>
          Open CV
        </button>
      </div>
    );
  }

  const renderFileViewer = () => {
    if (!selectedFile) return null;

    // Public-build shortcut: open the file in a new tab. Recruiters who want
    // a richer preview can host a build with the full viewer suite.
    return (
      <div className="finder-preview-stub">
        <p>
          <strong>{selectedFile.name || selectedFile.path}</strong>
        </p>
        <button type="button" onClick={() => openInNewTab(selectedFile.path)}>
          Open in new tab
        </button>
      </div>
    );
  };

  const getFolderContent = () => {
    let current = fileSystem;
    for (const folder of currentPath) {
      current = current[folder].contents;
    }
    return current;
  };

  const buildGlobalIndex = () => {
    const results = [];

    Object.entries(fileSystem).forEach(([folderName, folder]) => {
      results.push({
        name: folderName,
        ...folder,
        isFolder: true,
        location: [folderName],
      });

      Object.entries(folder.contents || {}).forEach(([fileName, file]) => {
        results.push({
          name: fileName,
          ...file,
          isFolder: false,
          location: [folderName],
        });
      });
    });

    return results;
  };

  const buildCurrentViewItems = () => {
    const content = currentPath.length === 0 ? fileSystem : getFolderContent();

    return Object.entries(content).map(([name, item]) => {
      const isFolder = item.type === 'folder';
      return {
        name,
        ...item,
        isFolder,
        location: isFolder ? [...currentPath, name] : currentPath,
      };
    });
  };

  const handleFileSelect = (file, name) => {
    setSelectedFile({ ...file, name });
  };

  const renderFolderContent = () => {
    const query = searchQuery.trim().toLowerCase();
    const isGlobalSearch = query && currentPath.length === 0;
    const items = isGlobalSearch ? buildGlobalIndex() : buildCurrentViewItems();
    const filteredItems = query
      ? items.filter((item) => {
          const nameMatch = item.name.toLowerCase().includes(query);
          const typeMatch = item.type ? item.type.toLowerCase().includes(query) : false;
          return nameMatch || typeMatch;
        })
      : items;

    if (filteredItems.length === 0) {
      return (
        <div className="finder-empty">
          <div className="finder-empty-title">No matches found</div>
          <div className="finder-empty-subtitle">Try a different keyword or clear the search.</div>
        </div>
      );
    }

    return filteredItems.map((item) => {
      const metaCount = item.isFolder ? Object.keys(item.contents || {}).length : null;
      const metaLabel = item.isFolder ? `${metaCount} items` : item.type?.toUpperCase();
      const locationLabel = isGlobalSearch && item.location?.length
        ? item.location.join(' / ')
        : null;
      const detailLabel = locationLabel ? `${metaLabel} • ${locationLabel}` : metaLabel;

      return (
      <div
        key={`${item.name}-${item.location?.join('-') || 'root'}`}
        className="finder-item"
         onClick={() => {
           if (item.isFolder) {
             setCurrentPath(item.location);
             setSelectedFile(null);
             setSearchQuery('');
             return;
           }

           setCurrentPath(item.location || currentPath);
           handleFileSelect(item, item.name);
         }}
      >
        <img
          src={`/assets/icons/${item.isFolder ? 'folder' : item.type}-icon.png`}
          alt={item.name}
          className="finder-icon"
          width="52"
          height="52"
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
          <div className="finder-item-text">
            <span className="finder-name">{item.name}</span>
            {detailLabel && <span className="finder-item-meta">{detailLabel}</span>}
          </div>
      </div>
      );
    });
  };

  const handleBack = () => {
    if (currentPath.length > 0) {
      setCurrentPath(currentPath.slice(0, -1));
      setSelectedFile(null);
      setSearchQuery('');
    }
  };

  const handleHome = () => {
    setCurrentPath([]);
    setSelectedFile(null);
    setSearchQuery('');
  };

  const handleCloseViewer = () => {
    setSelectedFile(null);
  };

  return (
    <div className="finder-widget-shell">
      <div className="finder-container">
        <div className="finder-sidebar">
          <div className="finder-locations">
            {Object.entries(fileSystem).map(([name, folder]) => (
              <div
                key={name}
                className={`location-item ${currentPath[0] === name ? 'active' : ''}`}
                onClick={() => {
                  setCurrentPath([name]);
                  setSelectedFile(null);
                  setSearchQuery('');
                }}
              >
                <img
                  src="/assets/icons/folder-icon.png"
                  alt={name}
                  className="location-icon"
                  width="20"
                  height="20"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                />
                <span className="location-name">{name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="finder-main">
          <div className="finder-toolbar">
            <div className="finder-toolbar-left">
              <button className="finder-toolbar-button" onClick={handleHome}>
                Home
              </button>
              {currentPath.length > 0 && (
                <button className="finder-toolbar-button" onClick={handleBack}>
                  Back
                </button>
              )}
              {selectedFile && (
                <button className="finder-toolbar-button" onClick={handleCloseViewer}>
                  Close
                </button>
              )}
            </div>
            <div className="current-path">
              <div className="finder-breadcrumbs">
                <button className="finder-breadcrumb" onClick={handleHome}>
                  Library
                </button>
                {currentPath.map((segment, index) => {
                  const pathSlice = currentPath.slice(0, index + 1);
                  return (
                    <button
                      key={segment}
                      className="finder-breadcrumb"
                      onClick={() => {
                        setCurrentPath(pathSlice);
                        setSelectedFile(null);
                        setSearchQuery('');
                      }}
                    >
                      {segment}
                    </button>
                  );
                })}
                {selectedFile?.name && (
                  <span className="finder-breadcrumb-current">{selectedFile.name}</span>
                )}
              </div>
            </div>
            <div className="finder-toolbar-right">
              <div className="finder-view-toggle" role="group" aria-label="View mode">
                <button
                  className={`finder-view-button ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  aria-pressed={viewMode === 'grid'}
                  type="button"
                >
                  Grid
                </button>
                <button
                  className={`finder-view-button ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  aria-pressed={viewMode === 'list'}
                  type="button"
                >
                  List
                </button>
              </div>
              <div className="finder-search">
                <input
                  className="finder-search-input"
                  type="search"
                  placeholder="Search files, folders, formats..."
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="finder-content">
            {selectedFile ? (
              <div className={`file-viewer${selectedFile.type ? ` file-viewer-${selectedFile.type}` : ''}`}>
                {renderFileViewer()}
              </div>
            ) : (
              <div className={`folder-content ${viewMode === 'list' ? 'list-view' : 'grid-view'}`}>
                {renderFolderContent()}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finder; 
