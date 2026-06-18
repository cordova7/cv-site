import React, { useState, useEffect } from 'react';

// Import from react-pdf-viewer
import { Viewer, Worker } from '@react-pdf-viewer/core';

const PDFViewer = ({ file }) => {
  const [errorMessage, setErrorMessage] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const workerUrl = 'https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js';
  
  // Ensure the file path is correctly formed
  const getPdfUrl = () => {
    // If the file path already contains the full URL, use it directly
    if (file.startsWith('http://') || file.startsWith('https://') || file.startsWith('/')) {
      return file;
    }
    
    // Otherwise, prepend a path to locate the file correctly
    return `/${file}`;
  };
  
  useEffect(() => {
    // Check if file exists
    const checkFile = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(getPdfUrl(), { method: 'HEAD' });
        if (!response.ok) {
          setErrorMessage(`Could not access PDF file (${response.status}: ${response.statusText})`);
        } else {
          setErrorMessage(null);
        }
        setIsLoading(false);
      } catch (err) {
        setErrorMessage(`Error checking file: ${err.message}`);
        setIsLoading(false);
      }
    };
    
    checkFile();
  }, [file]);

  if (isLoading) {
    return (
      <div className="pdf-viewer">
        <div className="loading">Loading PDF document...</div>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="pdf-viewer">
        <div className="pdf-error">
          <p>{errorMessage}</p>
          <p>File path: {getPdfUrl()}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pdf-viewer">
      <Worker workerUrl={workerUrl}>
        <Viewer
          fileUrl={getPdfUrl()}
          className="pdf-viewer-container"
        />
      </Worker>
    </div>
  );
};

export default PDFViewer; 
