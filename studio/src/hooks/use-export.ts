import { useCallback } from "react";

type ExportFormat = 'json' | 'csv' | 'sql';

export function useExport() {
  const exportData = useCallback((
    data: any[], 
    fileName: string, 
    format: ExportFormat = 'json',
    tableName?: string
  ) => {
    try {
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
      const blob = new Blob([content], { type: `${mimeType};charset=utf-8;` });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      
      link.href = url;
      link.download = `${fileName}.${fileExtension}`;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }, 0);

      return true;
    } catch (err) {
      console.error('Export failed:', err);
      return false;
    }
  }, []);

  return { exportData };
}