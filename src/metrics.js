export const agents = [
  { id: 1, name: 'Olivia Rhye', role: 'Senior support specialist', team: 'Customer Care', initials: 'OR', color: 'peach', status: 'Available', volume: 22, qa: 97.2, aht: 348, advocacy: 96.1 },
  { id: 2, name: 'Phoenix Baker', role: 'Support specialist', team: 'Customer Care', initials: 'PB', color: 'purple', status: 'On a case', volume: 20, qa: 94.5, aht: 385, advocacy: 93.2 },
  { id: 3, name: 'Lana Steiner', role: 'Senior support specialist', team: 'Technical Support', initials: 'LS', color: 'rose', status: 'Available', volume: 19, qa: 98.1, aht: 411, advocacy: 97.4 },
  { id: 4, name: 'Demi Wilkinson', role: 'Support specialist', team: 'Customer Care', initials: 'DW', color: 'blue', status: 'Available', volume: 23, qa: 95.7, aht: 339, advocacy: 94.6 },
  { id: 5, name: 'Drew Cano', role: 'Technical specialist', team: 'Technical Support', initials: 'DC', color: 'green', status: 'On a case', volume: 17, qa: 91.3, aht: 472, advocacy: 89.1 },
  { id: 6, name: 'Natali Craig', role: 'Support specialist', team: 'Customer Care', initials: 'NC', color: 'yellow', status: 'Away', volume: 21, qa: 96.4, aht: 362, advocacy: 95.2 },
  { id: 7, name: 'Orlando Diggs', role: 'Technical specialist', team: 'Technical Support', initials: 'OD', color: 'purple', status: 'Available', volume: 18, qa: 93.8, aht: 428, advocacy: 91.7 },
  { id: 8, name: 'Andi Lane', role: 'Retention specialist', team: 'Customer Success', initials: 'AL', color: 'peach', status: 'On a case', volume: 20, qa: 97.8, aht: 357, advocacy: 98.1 },
  { id: 9, name: 'Kate Morrison', role: 'Retention specialist', team: 'Customer Success', initials: 'KM', color: 'green', status: 'Available', volume: 19, qa: 96.2, aht: 373, advocacy: 97.2 },
  { id: 10, name: 'Alex Morgan', role: 'Support specialist', team: 'Customer Care', initials: 'AM', color: 'blue', status: 'Away', volume: 18, qa: 92.7, aht: 405, advocacy: 91.6 },
  { id: 11, name: 'Sienna Park', role: 'Senior retention specialist', team: 'Customer Success', initials: 'SP', color: 'rose', status: 'Available', volume: 21, qa: 98.4, aht: 344, advocacy: 98.5 },
  { id: 12, name: 'Noah Williams', role: 'Technical specialist', team: 'Technical Support', initials: 'NW', color: 'yellow', status: 'On a case', volume: 16, qa: 94.1, aht: 452, advocacy: 93.4 },
];
export const TODAY = new Date('2026-10-16T12:00:00Z');
const noise = (a, d, salt = 0) => ((a * 37 + d * 19 + salt * 13) % 29) / 28;
export function recordsFor(agent, days, previous = false) {
  return Array.from({ length: days }, (_, i) => {
    const offset = (previous ? days : 0) + days - 1 - i;
    const date = new Date(TODAY); date.setUTCDate(date.getUTCDate() - offset);
    const n = noise(agent.id, offset);
    const demand = .92 + Math.sin(offset * .67) * .13 + Math.cos(offset * .24) * .07;
    const weekend = [0, 6].includes(date.getUTCDay());
    const cases = Math.round(agent.volume * (weekend ? .56 : 1) * demand * (.82 + n * .38) * (previous ? .91 : 1));
    const qa = Math.min(100, agent.qa - 1.5 + noise(agent.id, offset, 2) * 3 - (previous ? 1.4 : 0));
    const aht = agent.aht - 25 + n * 50 + (previous ? 23 : 0);
    const surveys = Math.max(1, Math.round(cases * .65));
    const advocates = Math.min(surveys, Math.round(surveys * (agent.advocacy - 2 + n * 4 - (previous ? 3 : 0)) / 100));
    return { date, cases, qa, aht, surveys, advocates, audits: Math.max(1, Math.round(cases * .18)) };
  });
}
export function summarize(records) {
  const cases = records.reduce((s, r) => s + r.cases, 0);
  const surveys = records.reduce((s, r) => s + r.surveys, 0);
  const advocates = records.reduce((s, r) => s + r.advocates, 0);
  const audits = records.reduce((s, r) => s + r.audits, 0);
  return { cases, surveys, advocates, audits, qa: audits ? records.reduce((s, r) => s + r.qa * r.audits, 0) / audits : 0, aht: cases ? records.reduce((s, r) => s + r.aht * r.cases, 0) / cases : 0, advocacy: surveys ? advocates / surveys * 100 : 0 };
}
export function getRows(days, team = 'All teams', previous = false) {
  return agents.filter(a => team === 'All teams' || a.team === team).map(a => ({ ...a, records: recordsFor(a, days, previous), ...summarize(recordsFor(a, days, previous)) }));
}
export function trendFor(rows, days) {
  const size = days > 30 ? 7 : days > 7 ? 3 : 1;
  const points = [];
  for (let i = 0; i < days; i += size) {
    const records = rows.flatMap(row => row.records.slice(i, Math.min(i + size, days)));
    points.push({ ...summarize(records), date: rows[0]?.records[i].date });
  }
  return points;
}
export const number = n => Math.round(n).toLocaleString('en-US');
export const duration = seconds => `${Math.floor(Math.round(seconds) / 60)}m ${String(Math.round(seconds) % 60).padStart(2, '0')}s`;
export const shortDate = date => date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
export function toCsv(rows) {
  return [['Agent', 'Team', 'Cases solved', 'QA score (%)', 'AHT (seconds)', 'Brand advocacy (%)', 'Responses'], ...rows.map(a => [a.name, a.team, a.cases, a.qa.toFixed(1), Math.round(a.aht), a.advocacy.toFixed(1), a.surveys])].map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\r\n');
}
