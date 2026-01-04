import { useCallback } from "react";

type ExportFormat = 'json' | 'csv' | 'sql';

export function useExport() {
  const exportData = useCallback(async (
    data: any[], 
    fileName: string, 
    format: ExportFormat = 'json',
    tableName?: string
  ): Promise<boolean> => {
    try {
      if (!data || data.length === 0) {
        console.error('No data provided for export')
        return false
      }
      
      if (format === 'sql' && !tableName) {
        console.error('Table name is required for SQL export')
        return false
      }
      let content = '';
      let mimeType = 'text/plain';
      let fileExtension = 'txt';

      if (format === 'json') {
        content = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        fileExtension = 'json';
      } else if (format === 'csv') {
        if (data.length === 0) return false;
        
        const headers = Object.keys(data[0]);
        const csvRows = [
          headers.join(','),
          ...data.map(row => 
            headers.map(field => {
              const value = row[field] ?? '';
              return `"${value.toString().replace(/"/g, '""')}"`;
            }).join(',')
          )
        ];
        
        content = csvRows.join('\n');
        mimeType = 'text/csv';
        fileExtension = 'csv';
      } else if (format === 'sql' && tableName) {
        const columns = Object.keys(data[0] || {});
        const values = data.map(row => 
          `(${columns.map(col => {
            const val = row[col];
            if (val === null || val === undefined) return 'NULL';
            if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
            if (typeof val === 'boolean') return val ? 'TRUE' : 'FALSE';
            return val;
          }).join(', ')})`
        ).join(',\n');
        
        content = `-- SQL Export for ${tableName}\n\n`;
        content += `-- Table structure would go here\n-- CREATE TABLE IF NOT EXISTS ${tableName} (...);\n\n`;
        content += `-- Data\nINSERT INTO ${tableName} (${columns.join(', ')})\nVALUES\n${values};\n`;
        fileExtension = 'sql';
      }

      // Create and trigger download
      return new Promise<boolean>((resolve) => {
        try {
          const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          
          link.href = url;
          link.download = `${fileName}.${fileExtension}`;
          link.style.display = 'none';
          
          // Handle cleanup after download starts
          const cleanup = () => {
            if (document.body.contains(link)) {
              document.body.removeChild(link);
            }
            URL.revokeObjectURL(url);
          };
          
          // Set up event listeners
          link.onload = () => {
            cleanup();
            resolve(true);
          };
          
          link.onerror = (error) => {
            console.error('Download error:', error);
            cleanup();
            resolve(false);
          };
          
          document.body.appendChild(link);
          link.click();
          
          // Fallback cleanup in case events don't fire
          setTimeout(() => {
            cleanup();
            resolve(true);
          }, 1000);
          
        } catch (error) {
          console.error('Error during export:', error);
          resolve(false);
        }
      });
    } catch (err) {
      console.error('Export failed:', err);
      return false;
    }
  }, []);

  return { exportData };
}