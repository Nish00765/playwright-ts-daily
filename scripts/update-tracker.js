// Scans days/day-* folders, counts test files, and (if available)
// reads test-results/results.json from the latest Playwright run
// to build a simple progress dashboard (tracker.json + public/index.html).

const fs = require('fs');
const path = require('path');

const daysDir = path.join(__dirname, '..', 'days');
const resultsPath = path.join(__dirname, '..', 'test-results', 'results.json');
const publicDir = path.join(__dirname, '..', 'public');

function countTestsInFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const matches = content.match(/\btest\(/g);
  return matches ? matches.length : 0;
}

function scanDays() {
  if (!fs.existsSync(daysDir)) return [];
  const dayFolders = fs
    .readdirSync(daysDir)
    .filter((d) => fs.statSync(path.join(daysDir, d)).isDirectory())
    .sort();

  return dayFolders.map((day) => {
    const dayPath = path.join(daysDir, day);
    const specFiles = fs
      .readdirSync(dayPath)
      .filter((f) => f.endsWith('.spec.ts'));

    const testCount = specFiles.reduce((sum, f) => {
      return sum + countTestsInFile(path.join(dayPath, f));
    }, 0);

    return { day, files: specFiles.length, tests: testCount };
  });
}

function readPlaywrightSummary() {
  if (!fs.existsSync(resultsPath)) return null;
  try {
    const raw = JSON.parse(fs.readFileSync(resultsPath, 'utf-8'));
    const stats = raw.stats || {};
    return {
      expected: stats.expected || 0,
      unexpected: stats.unexpected || 0,
      skipped: stats.skipped || 0,
      duration: stats.duration || 0,
    };
  } catch {
    return null;
  }
}

function buildHtml(days, summary) {
  const totalTests = days.reduce((s, d) => s + d.tests, 0);
  const rows = days
    .map(
      (d) =>
        `<tr><td>${d.day}</td><td>${d.files}</td><td>${d.tests}</td></tr>`
    )
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<title>Playwright + TS Daily Tracker</title>
<style>
  body { font-family: system-ui, sans-serif; max-width: 720px; margin: 40px auto; padding: 0 16px; color: #1a1a1a; }
  h1 { font-size: 1.5rem; }
  table { width: 100%; border-collapse: collapse; margin-top: 16px; }
  th, td { text-align: left; padding: 8px 12px; border-bottom: 1px solid #ddd; }
  th { background: #f4f4f5; }
  .summary { display: flex; gap: 24px; margin-top: 24px; }
  .card { background: #f4f4f5; padding: 12px 16px; border-radius: 8px; }
  .card b { display: block; font-size: 1.4rem; }
</style>
</head>
<body>
  <h1>Playwright + TypeScript Daily Tracker</h1>
  <div class="summary">
    <div class="card"><b>${days.length}</b>Days logged</div>
    <div class="card"><b>${totalTests}</b>Total tests written</div>
    ${
      summary
        ? `<div class="card"><b>${summary.expected}</b>Last run passed</div>
           <div class="card"><b>${summary.unexpected}</b>Last run failed</div>`
        : ''
    }
  </div>
  <table>
    <thead><tr><th>Day</th><th>Files</th><th>Tests</th></tr></thead>
    <tbody>
      ${rows || '<tr><td colspan="3">No days logged yet</td></tr>'}
    </tbody>
  </table>
  <p style="margin-top:32px;color:#666;font-size:0.9rem;">Generated automatically by Jenkins on every push.</p>
</body>
</html>`;
}

function main() {
  const days = scanDays();
  const summary = readPlaywrightSummary();

  fs.writeFileSync(
    path.join(__dirname, '..', 'tracker.json'),
    JSON.stringify({ days, summary, generatedAt: new Date().toISOString() }, null, 2)
  );

  if (!fs.existsSync(publicDir)) fs.mkdirSync(publicDir);
  fs.writeFileSync(path.join(publicDir, 'index.html'), buildHtml(days, summary));

  console.log(`Tracker updated: ${days.length} day(s), ${days.reduce((s, d) => s + d.tests, 0)} test(s) total.`);
}

main();
