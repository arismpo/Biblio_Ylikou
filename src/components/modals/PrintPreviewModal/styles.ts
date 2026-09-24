// C:\Biblio_Ylikou_NEW\src\components\modals\PrintPreviewModal\styles.ts

export const printStyles = `
  /* ✅ Πλήρης επαναφορά - μόνο light mode */
  * {
    filter: none !important;
    -webkit-filter: none !important;
    backdrop-filter: none !important;
    opacity: 1 !important;
    color: #000000 !important;
    background-color: #ffffff !important;
    border-color: #000000 !important;
  }
  
  @media print {
    /* ✅ Όλα light mode στην εκτύπωση */
    * {
      color: #000000 !important;
      background-color: #ffffff !important;
      background: #ffffff !important;
      border-color: #000000 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
      color-adjust: exact !important;
      filter: none !important;
      -webkit-filter: none !important;
      backdrop-filter: none !important;
      opacity: 1 !important;
    }
    
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      background: #ffffff !important;
      color: #000000 !important;
    }
    
    /* ✅ Σταθερά χρώματα για το header */
    thead th,
    thead td {
      background-color: #1976d2 !important;
      color: #ffffff !important;
      border-color: #1565c0 !important;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    
    /* ✅ Σώμα πίνακα - light mode */
    tbody td,
    tbody th {
      background-color: #ffffff !important;
      color: #000000 !important;
      border-color: #000000 !important;
    }
    
    /* ✅ Εναλλακτικά χρώματα γραμμών */
    tbody tr:nth-child(even) td {
      background-color: #f5f5f5 !important;
    }
    
    /* ✅ Totals rows */
    tbody tr:last-child td,
    tbody tr:last-child th {
      background-color: #e8e8e8 !important;
    }
    
    .print-content { 
      padding: 0 !important; 
      margin: 0 !important; 
      background: #ffffff !important;
    }
    
    .print\\:hidden { 
      display: none !important; 
    }
    
    table { 
      page-break-inside: auto !important;
      break-inside: auto !important;
      width: 100%;
      background: #ffffff !important;
    }
    
    tr { 
      page-break-inside: avoid !important; 
      break-inside: avoid !important;
    }
    
    thead {
      display: table-header-group !important;
    }
    
    @page { 
      size: landscape;
      margin: 0.3cm;
      background: #ffffff !important;
    }
    
    @page {
      @bottom-center {
        content: "σελίδα " counter(page) !important;
        font-size: 8px !important;
        font-family: Arial, sans-serif !important;
        color: #000000 !important;
      }
    }
  }
`

export const getPrintModeStyles = (printMode: boolean = false) => ({
    rowHeight: printMode ? '8px' : '24px',
    fontSize: printMode ? '4px' : '6px',
    cellPadding: printMode ? '1px' : '2px',
    headerRowHeight: printMode ? '10px' : '20px',
    subHeaderHeight: printMode ? '6px' : '12px',
    onomastikaHeight: printMode ? '45px' : '75px',
    totalsRowHeight: printMode ? '10px' : '16px',
    descriptionHeight: printMode ? '10px' : '20px',
    previousYearHeight: printMode ? '8px' : '16px'
})