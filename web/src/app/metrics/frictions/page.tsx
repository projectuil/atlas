import { getFrictions, getCategories } from "@/lib/api";
import fs from 'fs';
import path from 'path';
import FrictionDashboardClient from '@/components/FrictionDashboardClient';
import { extractTablesFromHtml } from '@/lib/tableParser';

export default async function FrictionMetricsPage() {
  const frictions = getFrictions();
  const categories = getCategories();
  
  const totalFrictions = frictions.length;
  const completion = ((totalFrictions / 1000) * 100).toFixed(1);
  const activeCategories = categories.filter(c => c.count > 0).length;
  
  // Read the markdown file (the exact file from the repository)
  const metricsFile = path.join(process.cwd(), 'content', 'metrics', 'human-friction-metrics.md');
  let rawContent = fs.existsSync(metricsFile) ? fs.readFileSync(metricsFile, 'utf8') : '';

  // Extract the HTML part
  let htmlContent = rawContent.replace(/---[\s\S]*?---/, '').trim();

  // Dynamically override static numbers with live data
  htmlContent = htmlContent
    .replace(/>375</g, `>${totalFrictions}<`)
    .replace(/>37\.5%</g, `>${completion}%<`)
    .replace(/375 Entries/g, `${totalFrictions} Entries`)
    .replace(/375 \/ 500/g, `${totalFrictions} / 500`)
    .replace(/375 \/ 750/g, `${totalFrictions} / 750`)
    .replace(/375 \/ 1000/g, `${totalFrictions} / 1000`)
    .replace(/7 \(/g, `${activeCategories} (`)
    .replace(/>7 Active Categories/g, `>${activeCategories} Active Categories`)
    .replace(/>7 Active,/g, `>${activeCategories} Active,`);

  // Extract the tables from the live-updated HTML string
  const tables = extractTablesFromHtml(htmlContent);

  return (
    <FrictionDashboardClient tables={tables} rawHtml={htmlContent} />
  );
}
