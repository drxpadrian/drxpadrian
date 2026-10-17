import test from 'node:test';
import assert from 'node:assert/strict';
import { agents, getRows, recordsFor, summarize, trendFor, duration, toCsv, TODAY } from './metrics.js';

test('reporting periods include exactly the requested dates, without overlap', () => {
  for (const days of [7,30,90]) {
    const current = recordsFor(agents[0], days);
    const previous = recordsFor(agents[0], days, true);
    assert.equal(current.length, days);
    assert.equal(current.at(-1).date.toISOString(), TODAY.toISOString());
    assert.equal(current[0].date.getTime() - previous.at(-1).date.getTime(), 86400000);
  }
});
test('team filters partition the full team and preserve cases', () => {
  const all = getRows(30);
  const partitions = ['Customer Care','Technical Support','Customer Success'].flatMap(team => getRows(30,team));
  assert.equal(partitions.length, all.length);
  assert.equal(new Set(partitions.map(a => a.id)).size, all.length);
  assert.equal(partitions.reduce((s,a)=>s+a.cases,0), summarize(all.flatMap(a=>a.records)).cases);
});
test('QA is weighted by audits, AHT by cases, and advocacy by survey responses', () => {
  const result = summarize([
    {cases:10,qa:80,aht:100,audits:1,surveys:2,advocates:1},
    {cases:30,qa:100,aht:200,audits:3,surveys:8,advocates:7},
  ]);
  assert.equal(result.qa,95);
  assert.equal(result.aht,175);
  assert.equal(result.advocacy,80);
  assert.equal(result.cases,40);
});
test('trend buckets preserve every case and survey across all reporting periods', () => {
  for(const days of [7,30,90]) {
    const rows = getRows(days);
    const trend = trendFor(rows,days);
    const all = summarize(rows.flatMap(a=>a.records));
    assert.equal(trend.reduce((s,p)=>s+p.cases,0),all.cases);
    assert.equal(trend.reduce((s,p)=>s+p.surveys,0),all.surveys);
    assert.ok(trend.every(p=>p.qa<=100 && p.advocacy<=100));
  }
});
test('formatting handles minute rollover and CSV escaping', () => {
  assert.equal(duration(359.8),'6m 00s');
  const row = {...getRows(7)[0],name:'Test "Agent", one'};
  const csv = toCsv([row]);
  assert.match(csv,/"Test ""Agent"", one"/);
  assert.equal(csv.split('\r\n').length,2);
});
test('empty datasets have defined zero values', () => {
  const result = summarize([]);
  assert.equal(result.qa,0);
  assert.equal(result.advocacy,0);
  assert.equal(result.aht,0);
});
