import { getPatterns } from "@/lib/api";
import fs from 'fs';
import path from 'path';
import PatternDashboardClient from '@/components/PatternDashboardClient';
import { extractTablesFromHtml } from '@/lib/tableParser';

export default async function PatternMetricsPage() {
  const patterns = getPatterns();
  
  const totalPatterns = patterns.length;
  const completion = ((totalPatterns / 200) * 100).toFixed(1);
  const candidate = patterns.filter(p => p.metadata?.status?.toLowerCase() === 'candidate').length;
  const accepted = patterns.filter(p => p.metadata?.status?.toLowerCase() === 'accepted').length;
  
  // Read the markdown file (the exact file from the repository)
  const metricsFile = path.join(process.cwd(), 'content', 'metrics', 'pattern-metrics.md');
  let rawContent = fs.existsSync(metricsFile) ? fs.readFileSync(metricsFile, 'utf8') : '';

  // Extract the HTML part
  let htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim();

  // Dynamically override static numbers with live data
  htmlContent = htmlContent
    .replace(/>58</g, `>${totalPatterns}<`)
    .replace(/>29\.0%</g, `>${completion}%<`)
    .replace(/>38</g, `>${candidate}<`)
    .replace(/>20</g, `>${accepted}<`)
    .replace(/58 Entries/g, `${totalPatterns} Entries`)
    .replace(/58 Patterns/g, `${totalPatterns} Patterns`)
    .replace(/58 \/ 100/g, `${totalPatterns} / 100`)
    .replace(/58 \/ 150/g, `${totalPatterns} / 150`)
    .replace(/58 \/ 200/g, `${totalPatterns} / 200`);

  // Extract tables from the live-updated HTML string
  const tables = extractTablesFromHtml(htmlContent);

  return (
    <PatternDashboardClient tables={tables} rawHtml={htmlContent} />
  );
}
