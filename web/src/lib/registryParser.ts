import * as cheerio from 'cheerio';

export function parseRegistryDocument(html: string) {
  const $ = cheerio.load(html, null, false);
  
  const result: any = {
    intro: [],
    fields: [],
    statistics: {},
    rules: [],
    docInfo: {},
    entries: []
  };

  // Extract Intro (paragraphs before the first heading-like strong tag)
  $('p').each((i, el) => {
    const $p = $(el);
    const text = $p.text().trim();
    // Stop at the first section heading
    if ($p.find('strong').length === 1 && $p.text() === $p.find('strong').text()) {
      return false; // Break
    }
    if (text) {
      result.intro.push(text);
    }
  });

  // Helper to find the table following a specific heading
  const extractTableFollowingHeading = (headingText: string) => {
    let targetTable: any = null;
    $('p').each((i: number, el: any) => {
      const $p = $(el);
      if ($p.text().trim() === headingText) {
        targetTable = $p.nextAll('table').first();
        return false;
      }
    });
    return targetTable;
  };

  // 1. Registry Fields
  const fieldsTable = extractTableFollowingHeading('Registry Fields');
  if (fieldsTable && fieldsTable.length) {
    fieldsTable.find('tr').each((i: number, tr: any) => {
      if (i === 0) return; // skip header
      const cells = $(tr).find('td').map((_: number, td: any) => $(td).text().trim()).get();
      if (cells.length === 2) {
        result.fields.push({ field: cells[0], description: cells[1] });
      }
    });
  }

  // 2. Registry Statistics
  const statsTable = extractTableFollowingHeading('Registry Statistics');
  if (statsTable && statsTable.length) {
    statsTable.find('tr').each((i: number, tr: any) => {
      if (i === 0) return;
      const cells = $(tr).find('td').map((_: number, td: any) => $(td).text().trim()).get();
      if (cells.length === 2) {
        result.statistics[cells[0]] = cells[1];
      }
    });
  }

  // 3. Document Information
  const docInfoTable = extractTableFollowingHeading('Document Information');
  if (docInfoTable && docInfoTable.length) {
    docInfoTable.find('tr').each((i: number, tr: any) => {
      if (i === 0) return;
      const cells = $(tr).find('td').map((_: number, td: any) => $(td).text().trim()).get();
      if (cells.length === 2) {
        result.docInfo[cells[0]] = cells[1];
      }
    });
  }

  // 4. Registry Rules
  $('p').each((i: number, el: any) => {
    const $p = $(el);
    if ($p.text().trim() === 'Registry Rules') {
      const $ol = $p.nextAll('ol').first();
      $ol.find('li').each((_: number, li: any) => {
        result.rules.push($(li).text().trim());
      });
      return false;
    }
  });

  // 5. Entries
  $('table').each((i: number, el: any) => {
    const $table = $(el);
    const headers = $table.find('th').map((_: number, th: any) => $(th).text().trim()).get();
    
    if (headers.includes('APID') && headers.includes('Human Friction')) {
      let categoryMatch = '';
      const prev = $table.prev();
      if (prev.text().includes('Category:')) {
        categoryMatch = prev.text().replace('Category:', '').trim();
      }

      $table.find('tr').each((j: number, tr: any) => {
        if (j === 0) return;
        const cells = $(tr).find('td').map((_: number, td: any) => $(td).text().trim()).get();
        if (cells.length >= 3) {
          result.entries.push({
            id: cells[0],
            title: cells[1],
            status: cells[2],
            category: categoryMatch
          });
        }
      });
    } else if (headers.includes('Category ID') && headers.includes('Prefix')) {
      $table.find('tr').each((j: number, tr: any) => {
        if (j === 0) return;
        const cells = $(tr).find('td').map((_: number, td: any) => $(td).text().trim()).get();
        if (cells.length >= 5) {
          result.entries.push({
            id: cells[0],
            prefix: cells[1],
            title: cells[2],
            domain: cells[3],
            status: cells[4],
          });
        }
      });
    } else if (headers.includes('PTID') || headers.includes('PAT ID') || headers.includes('Pattern')) {
      $table.find('tr').each((j: number, tr: any) => {
        if (j === 0) return;
        const cells = $(tr).find('td').map((_: number, td: any) => $(td).text().trim()).get();
        if (cells.length >= 3) {
          result.entries.push({
            id: cells[0],
            title: cells[1],
            status: cells[2],
            // Use 4th column if it exists, otherwise leave empty
            volume: cells.length >= 4 ? cells[3] : 'Uncategorized',
          });
        }
      });
    }
  });

  return result;
}
