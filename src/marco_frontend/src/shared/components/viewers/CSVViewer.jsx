import React, { useEffect, useMemo, useState } from 'react';
import Papa from 'papaparse';

const CSVViewer = ({ file }) => {
  const [data, setData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'ascending' });
  const [fitWidth, setFitWidth] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadCSV = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(file);
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV file: ${response.status} ${response.statusText}`);
        }

        const csvString = await response.text();

        Papa.parse(csvString, {
          header: true,
          skipEmptyLines: true,
          complete: (result) => {
            if (result.errors && result.errors.length > 0) {
              setError(`CSV parse error: ${result.errors[0].message}`);
            } else {
              setHeaders(result.meta.fields || []);
              setData(result.data || []);
            }
            setLoading(false);
          },
          error: (parseError) => {
            setError(`CSV parse error: ${parseError.message}`);
            setLoading(false);
          },
        });
      } catch (err) {
        setError(`Error loading CSV: ${err.message}`);
        setLoading(false);
      }
    };

    loadCSV();
  }, [file]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    if (!sortConfig.key) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];

      const aNum = Number(aValue);
      const bNum = Number(bValue);

      if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) {
        return sortConfig.direction === 'ascending' ? aNum - bNum : bNum - aNum;
      }

      if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
      return 0;
    });
  }, [data, sortConfig.direction, sortConfig.key]);

  if (loading) return <div className="csv-loading">Loading CSV data...</div>;
  if (error) return <div className="csv-error">{error}</div>;
  if (headers.length === 0) return <div className="csv-error">No data found in CSV file</div>;

  const minTableWidth = Math.max(headers.length * 150, 900);

  return (
    <div className={`csv-viewer ${fitWidth ? 'fit-width' : 'wide-width'}`}>
      <div className="csv-meta-bar">
        <div className="csv-meta-info">
          <span>{sortedData.length} rows</span>
          <span>{headers.length} columns</span>
        </div>
        <div className="csv-meta-actions">
          <button
            className={`csv-meta-button ${fitWidth ? 'active' : ''}`}
            onClick={() => setFitWidth(true)}
            type="button"
          >
            Fit Width
          </button>
          <button
            className={`csv-meta-button ${!fitWidth ? 'active' : ''}`}
            onClick={() => setFitWidth(false)}
            type="button"
          >
            Wide
          </button>
        </div>
      </div>
      <div className="csv-table-container">
        <div className="csv-table-surface">
          <table className="csv-table" style={{ minWidth: `${minTableWidth}px` }}>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th
                    key={header}
                    onClick={() => requestSort(header)}
                    className={sortConfig.key === header ? `sorted-${sortConfig.direction}` : ''}
                    scope="col"
                  >
                    {header}
                    {sortConfig.key === header && (
                      <span className="sort-indicator" aria-hidden="true">
                        {sortConfig.direction === 'ascending' ? ' ▲' : ' ▼'}
                      </span>
                    )}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, index) => (
                  <tr key={index}>
                    {headers.map((header) => (
                      <td key={header}>{row[header]}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length} className="csv-no-data">
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CSVViewer;
