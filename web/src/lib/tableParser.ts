export function extractTablesFromHtml(html: string) {
  const tables = [];
  const tableRegex = /<table>(.*?)<\/table>/g;
  let match;
  while ((match = tableRegex.exec(html)) !== null) {
    const tableHtml = match[1];
    
    // Extract headers
    const headers = [];
    const headerRegex = /<th>(.*?)<\/th>/g;
    let hMatch;
    while ((hMatch = headerRegex.exec(tableHtml)) !== null) {
      headers.push(hMatch[1].replace(/<[^>]+>/g, '').trim());
    }
    
    // Extract rows
    const rows = [];
    const rowRegex = /<tr>(.*?)<\/tr>/g;
    let rMatch;
    while ((rMatch = rowRegex.exec(tableHtml)) !== null) {
      if (rMatch[1].includes('<th>')) continue; // skip header row
      
      const cells = [];
      const cellRegex = /<td>(.*?)<\/td>/g;
      let cMatch;
      while ((cMatch = cellRegex.exec(rMatch[1])) !== null) {
        cells.push(cMatch[1].replace(/<[^>]+>/g, '').trim());
      }
      rows.push(cells);
    }
    
    tables.push({ headers, rows });
  }
  return tables;
}
