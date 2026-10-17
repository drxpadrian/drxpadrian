import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Activity, ArrowDown, ArrowDownLeft, ArrowRight, ArrowUpRight, Award, CalendarDays, Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, CircleHelp, Clock3, Download, LayoutDashboard, ListFilter, Menu, Search, ShieldCheck, Sparkles, TrendingUp, Users, X } from 'lucide-react';
import { TODAY, agents, getRows, summarize, trendFor, number, duration, shortDate, toCsv } from './metrics';
import '@fontsource-variable/dm-sans';
import '@fontsource-variable/manrope';
import './styles.css';

const teams = ['All teams', 'Customer Care', 'Technical Support', 'Customer Success'];
const views = [{name:'Overview', icon: LayoutDashboard}, {name:'Agents', icon: Users}, {name:'Quality & advocacy', icon: ShieldCheck}];
function App() {
  const [days, setDays] = useState(30);
  const [team, setTeam] = useState('All teams');
  const [view, setView] = useState('Overview');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState({key:'cases', asc:false});
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState(null);
  const [help, setHelp] = useState(false);
  const [mobileNav, setMobileNav] = useState(false);
  const [toast, setToast] = useState('');
  const rows = useMemo(() => getRows(days, team), [days, team]);
  const totals = useMemo(() => summarize(rows.flatMap(a => a.records)), [rows]);
  const previous = useMemo(() => summarize(getRows(days, team, true).flatMap(a => a.records)), [days, team]);
  const points = useMemo(() => trendFor(rows, days), [rows, days]);
  const filtered = rows.filter(a => `${a.name} ${a.team}`.toLowerCase().includes(query.toLowerCase())).sort((a,b) => {
    const compare = typeof a[sort.key] === 'string' ? a[sort.key].localeCompare(b[sort.key]) : a[sort.key] - b[sort.key];
    return sort.asc ? compare : -compare;
  });
  const pageSize = view === 'Agents' ? 8 : 5;
  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const visible = filtered.slice((page-1)*pageSize, page*pageSize);
  const start = new Date(TODAY); start.setUTCDate(start.getUTCDate() - days + 1);
  const selected = rows.find(a => a.id === detail);
  useEffect(() => { setPage(1); }, [days, team, query, view, sort]);
  useEffect(() => { if (!toast) return; const timer = setTimeout(() => setToast(''), 3500); return () => clearTimeout(timer); }, [toast]);
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') { setDetail(null); setHelp(false); setMobileNav(false); } };
    window.addEventListener('keydown', onKey); return () => window.removeEventListener('keydown', onKey);
  }, []);
  function exportData() {
    const url = URL.createObjectURL(new Blob(['\uFEFF' + toCsv(filtered)], {type:'text/csv;charset=utf-8;'}));
    const a = document.createElement('a'); a.href = url; a.download = `relay-performance-${days}days.csv`; a.click(); URL.revokeObjectURL(url);
    setToast(`Exported ${filtered.length} agents for the selected period`);
  }
  function changeSort(key) { setSort(s => ({key, asc: s.key === key ? !s.asc : key === 'name' || key === 'aht'})); }
  return <div className="app-shell">
    {mobileNav && <div className="nav-scrim" onClick={() => setMobileNav(false)}/>}
    <aside id="main-sidebar" className={`sidebar ${mobileNav ? 'open' : ''}`}>
      <a className="logo" href="#" onClick={e => {e.preventDefault();setView('Overview');}}><span className="logo-mark"><Activity size={23} strokeWidth={2.6}/></span>relay<span className="logo-dot">.</span></a>
      <div className="workspace"><span className="workspace-icon">A</span><div><strong>Acme Support</strong><span>Team workspace</span></div><span className="workspace-badge">PRO</span></div>
      <div className="nav-caption">WORKSPACE</div>
      <nav aria-label="Main navigation">{views.map(({name, icon:Icon}) => <button key={name} className={`nav-item ${view===name ? 'active' : ''}`} onClick={() => {setView(name);setMobileNav(false);}}><Icon size={19}/>{name}{name==='Agents' && <span className="nav-count">{agents.length}</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-icon"><Sparkles size={18}/></span><strong>Great service starts here.</strong><p>Small improvements.<br/>Stronger customer connections.</p><span className="tip-line"/></div><button className="help-button" onClick={() => setHelp(true)}><CircleHelp size={18}/> Dashboard guide <ArrowUpRight size={15}/></button><div className="profile"><Avatar name="JD" color="purple"/><div><strong>Jamie Davis</strong><span>Support manager · Demo</span></div></div></div>
    </aside>
    <div className="main-shell"><header className="topbar"><div className="breadcrumb"><button className="mobile-menu icon-button" aria-label="Open navigation" aria-controls="main-sidebar" aria-expanded={mobileNav} onClick={() => setMobileNav(true)}><Menu size={21}/></button><span>Workspace</span><ChevronRight size={14}/><strong>{view}</strong></div><div className="topbar-right"><span className="demo-label"><span/> Demo workspace</span><button className="icon-button" aria-label="Open dashboard guide" onClick={() => setHelp(true)}><CircleHelp size={19}/></button><Avatar name="JD" color="purple" small/></div></header>
      <main><section className="page-heading"><div><div className="eyebrow">THE BIG PICTURE</div><h1>{view==='Overview' ? 'Service performance' : view==='Agents' ? 'Your people, at a glance.' : 'Every interaction matters.'}</h1><p>{view==='Overview' ? 'A clear view of your team. A better experience for every customer.' : view==='Agents' ? 'Understand individual impact and find opportunities to grow.' : 'Turn quality conversations into lasting brand advocates.'}</p></div><button className="button export-button" onClick={exportData}><Download size={16}/> Export report</button></section>
      <section className="filter-bar" aria-label="Dashboard filters"><div className="filter-left"><label className="select-wrap date-select"><CalendarDays size={16}/><select aria-label="Reporting period" value={days} onChange={e => setDays(Number(e.target.value))}><option value={7}>Last 7 days</option><option value={30}>Last 30 days</option><option value={90}>Last 90 days</option></select><ChevronDown size={14}/></label><label className="select-wrap"><Users size={16}/><select aria-label="Team" value={team} onChange={e => setTeam(e.target.value)}>{teams.map(t => <option key={t}>{t}</option>)}</select><ChevronDown size={14}/></label><span className="date-range">{shortDate(start)} – {shortDate(TODAY)}, 2026</span></div><span className="data-note"><span/> Sample data · Oct 16, 2026</span></section>
      <section className="metric-grid" aria-label="Key performance indicators">
        <Metric title="Cases solved" value={number(totals.cases)} icon={CheckCheck} change={(totals.cases/previous.cases-1)*100} caption="vs. previous period" spark={points.map(p=>p.cases)} color="orange"/>
        <Metric title="Average QA score" value={totals.qa.toFixed(1)} suffix="%" icon={ShieldCheck} change={totals.qa-previous.qa} unit="pts" caption="vs. previous period" spark={points.map(p=>p.qa)} color="purple"/>
        <Metric title="Avg. handle time" value={duration(totals.aht)} icon={Clock3} change={(totals.aht/previous.aht-1)*100} inverse caption="vs. previous period" spark={points.map(p=>p.aht)} color="blue"/>
        <Metric title="Brand advocacy" value={totals.advocacy.toFixed(1)} suffix="%" icon={Award} change={totals.advocacy-previous.advocacy} unit="pts" caption="vs. previous period" spark={points.map(p=>p.advocacy)} color="green"/>
      </section>
      {view !== 'Agents' && <div className="chart-grid"><section className="panel performance-panel"><div className="panel-heading"><div><h2>{view==='Quality & advocacy' ? 'Quality & advocacy trends' : 'Resolution activity'}</h2><p>{view==='Quality & advocacy' ? 'Consistent quality builds customer confidence.' : 'Every solved case is a customer moving forward.'}</p></div><span className="period-chip">{days} days</span></div>{view==='Quality & advocacy' ? <QualityChart points={points}/> : <VolumeChart points={points}/>}<div className="chart-footer"><span className="legend"><i/>{view==='Quality & advocacy' ? 'QA score' : 'Cases solved'}</span>{view==='Quality & advocacy' && <span className="legend advocacy"><i/>Brand advocacy</span>}<span className="chart-summary"><TrendingUp size={14}/>{view==='Quality & advocacy' ? `${number(totals.audits)} conversations reviewed` : `${number(totals.cases/days)} cases solved per day, on average`}</span></div></section>
      <section className="panel quality-panel"><div className="panel-heading"><div><h2>Quality at a glance</h2><p>Good conversations. Lasting impact.</p></div><span className="quality-icon"><Sparkles size={18}/></span></div><QualityGauge score={totals.qa}/><div className="gauge-caption"><span className={totals.qa>=95 ? "positive" : "negative"}>{totals.qa>=95 ? <Check size={13}/> : <TrendingUp size={13}/>}{totals.qa>=95 ? 'Above' : 'Below'} 95% team target</span><p>Based on {number(totals.audits)} quality reviews</p></div><div className="advocacy-summary"><span className="advocacy-icon"><Award size={20}/></span><div><strong>Customers who advocate</strong><span>{number(totals.advocates)} of {number(totals.surveys)} survey responses</span></div><b>{totals.advocacy.toFixed(1)}<small>%</small></b></div></section></div>}
      {view==='Quality & advocacy' && <div className="insight-banner"><span className="insight-star"><Sparkles size={20}/></span><div><strong>Quality is a team effort.</strong><p>{rows.filter(a => a.qa >=95).length} of {rows.length} agents are meeting the 95% QA target. Open an agent’s profile to explore their performance.</p></div><button onClick={() => {setSort({key:'qa',asc:true});setView('Agents');}}>Explore team <ArrowRight size={16}/></button></div>}
      <section className="panel agents-panel"><div className="table-top"><div><h2>Agent performance <span className="count-badge">{rows.length} agents</span></h2><p>The people behind every great customer experience.</p></div><div className="table-tools"><label className="search-wrap"><Search size={16}/><input aria-label="Search agents" placeholder="Search agents…" value={query} onChange={e => setQuery(e.target.value)}/>{query && <button aria-label="Clear search" onClick={() => setQuery('')}><X size={14}/></button>}</label><label className="sort-wrap"><ListFilter size={15}/><select aria-label="Sort agents" value={`${sort.key}:${sort.asc}`} onChange={e => {const [key, asc] = e.target.value.split(':');setSort({key,asc:asc==='true'});}}><option value="cases:false">Most cases</option><option value="qa:false">Highest QA</option><option value="aht:true">Lowest AHT</option><option value="advocacy:false">Top advocacy</option><option value="name:true">Name A–Z</option></select></label></div></div>
      <div className="table-scroll"><table><thead><tr><th aria-sort={sort.key==='name' ? sort.asc ? 'ascending' : 'descending' : 'none'}><SortButton label="Agent" column="name" sort={sort} onClick={changeSort}/></th><th>Status</th><th aria-sort={sort.key==='cases' ? sort.asc ? 'ascending' : 'descending' : 'none'}><SortButton label="Cases solved" column="cases" sort={sort} onClick={changeSort}/></th><th aria-sort={sort.key==='qa' ? sort.asc ? 'ascending' : 'descending' : 'none'}><SortButton label="QA score" column="qa" sort={sort} onClick={changeSort}/></th><th aria-sort={sort.key==='aht' ? sort.asc ? 'ascending' : 'descending' : 'none'}><SortButton label="Avg. handle time" column="aht" sort={sort} onClick={changeSort}/></th><th aria-sort={sort.key==='advocacy' ? sort.asc ? 'ascending' : 'descending' : 'none'}><SortButton label="Brand advocacy" column="advocacy" sort={sort} onClick={changeSort}/></th><th><span className="sr-only">View agent</span></th></tr></thead><tbody>{visible.map(a => <tr key={a.id}><td><button className="agent-name" onClick={() => setDetail(a.id)}><Avatar name={a.initials} color={a.color}/><span><strong>{a.name}</strong><small>{a.team}</small></span></button></td><td><span className={`status status-${a.status.toLowerCase().replaceAll(' ','-')}`}><i/>{a.status}</span></td><td><strong className="case-number">{number(a.cases)}</strong></td><td><span className={`score-pill ${a.qa>=95 ? 'good' : 'neutral'}`}>{a.qa.toFixed(1)}%</span></td><td className="aht-cell">{duration(a.aht)}</td><td><div className="advocacy-cell"><span>{a.advocacy.toFixed(1)}%</span><span className="mini-track"><i style={{width:`${a.advocacy}%`}}/></span></div></td><td><button className="icon-button row-arrow" aria-label={`View ${a.name}`} onClick={() => setDetail(a.id)}><ArrowUpRight size={18}/></button></td></tr>)}</tbody></table>{!filtered.length && <div className="empty-state"><Search size={28}/><h3>No agents found</h3><p>Try a different name or choose another team.</p><button className="button" onClick={() => {setQuery('');setTeam('All teams');}}>Clear filters</button></div>}</div>
      <div className="table-pagination"><span>{filtered.length ? `Showing ${(page-1)*pageSize+1}–${Math.min(page*pageSize,filtered.length)} of ${filtered.length} agents` : '0 agents'}</span><div><button className="page-button" disabled={page===1} onClick={() => setPage(p => p-1)} aria-label="Previous page"><ChevronLeft size={15}/></button>{Array.from({length:pages},(_,i) => <button key={i} className={`page-button ${page===i+1 ? 'current' : ''}`} onClick={() => setPage(i+1)} aria-label={`Page ${i+1}`} aria-current={page===i+1 ? 'page' : undefined}>{i+1}</button>)}<button className="page-button" disabled={page===pages} onClick={() => setPage(p => p+1)} aria-label="Next page"><ChevronRight size={15}/></button></div><button className="all-agents" onClick={() => {setView(view==='Agents' ? 'Overview' : 'Agents');setQuery('');}}>{view==='Agents' ? 'Back to overview' : 'View all agents'}<ArrowRight size={14}/></button></div></section>
      <footer className="page-footer"><span><span className="footer-mark"><Activity size={13}/></span> A little clarity. A lot of impact.</span><span>Sample dataset · No customer data connected</span></footer>
      </main>
    </div>
    {selected && <Modal title="Agent overview" onClose={() => setDetail(null)} drawer><div className="detail-profile"><Avatar name={selected.initials} color={selected.color}/><h2>{selected.name}</h2><p>{selected.role}</p><span className="detail-team">{selected.team}</span></div><div className="detail-period"><CalendarDays size={15}/>{shortDate(start)} – {shortDate(TODAY)}, 2026</div><div className="detail-metrics"><DetailMetric title="Cases solved" value={number(selected.cases)} note={`${number(selected.cases/days)} per day`}/><DetailMetric title="QA score" value={`${selected.qa.toFixed(1)}%`} note={selected.qa>=95 ? 'Meeting 95% target' : 'Below 95% target'}/><DetailMetric title="Avg. handle time" value={duration(selected.aht)} note="Total handling time ÷ cases"/><DetailMetric title="Brand advocacy" value={`${selected.advocacy.toFixed(1)}%`} note={`${selected.advocates} positive / ${selected.surveys} responses`}/></div><div className="detail-chart"><h3>Resolution activity</h3><VolumeChart points={trendFor([selected],days)}/></div><div className="detail-note"><ShieldCheck size={21}/><div><strong>{selected.qa>=95 ? 'Quality you can count on' : 'An opportunity to grow'}</strong><p>{selected.qa>=95 ? `${selected.name.split(' ')[0]} is meeting the team's quality standard across ${number(selected.audits)} reviewed conversations.` : `Review ${selected.name.split(' ')[0]}'s conversations and plan a coaching session to reach the 95% QA target.`}</p></div></div><button className="button detail-close" onClick={() => setDetail(null)}>Back to dashboard <ArrowRight size={15}/></button></Modal>}
    {help && <Modal title="Your dashboard guide" onClose={() => setHelp(false)}><p className="guide-intro">A shared understanding of what great service looks like.</p><dl className="guide-list"><dt><CheckCheck size={19}/>Cases solved</dt><dd>Cases resolved during the selected period. Compare with the preceding period of the same length.</dd><dt><ShieldCheck size={19}/>QA score</dt><dd>Average quality review score, weighted by the number of reviewed conversations. Team target: 95%.</dd><dt><Clock3 size={19}/>Average handle time (AHT)</dt><dd>Total handling time divided by resolved cases, including conversation and after-case work. Lower is better when quality stays strong.</dd><dt><Award size={19}/>Brand advocacy</dt><dd>Percentage of survey respondents who say they would recommend the brand after their support experience.</dd></dl><div className="guide-demo"><Sparkles size={18}/><p>This dashboard uses illustrative sample data through October 16, 2026. Connect a real data source in a future integration to track your own team.</p></div></Modal>}
    {toast && <div className="toast" role="status"><span><Check size={15}/></span>{toast}</div>}
  </div>;
}
function Avatar({name,color,small}) { return <span className={`avatar avatar-${color} ${small ? 'small' : ''}`}>{name}</span>; }
function SortButton({label,column,sort,onClick}) { return <button className="sort-button" onClick={() => onClick(column)}>{label}{sort.key===column && <ArrowDown size={12} style={{transform:sort.asc ? 'rotate(180deg)' : ''}}/>}</button>; }
function DetailMetric({title,value,note}) { return <div><span>{title}</span><strong>{value}</strong><small>{note}</small></div>; }
function Metric({title,value,suffix,icon:Icon,change,unit='%',inverse,caption,spark,color}) {
  const good = inverse ? change<0 : change>=0;
  const min = Math.min(...spark), span = Math.max(...spark) - min || 1;
  const path = spark.map((v,i) => `${i===0?'M':'L'} ${i * 72 / Math.max(spark.length-1,1)} ${39-(v-min)/span*30}`).join(' ');
  return <article className="metric-card"><div className="metric-top"><span>{title}</span><span className={`metric-icon ${color}`}><Icon size={17}/></span></div><div className="metric-value">{value}<small>{suffix}</small></div><div className="metric-bottom"><div><span className={`metric-change ${good ? 'positive' : 'negative'}`}>{change>=0 ? <ArrowUpRight size={14}/> : <ArrowDownLeft size={14}/>} {Math.abs(change).toFixed(1)}{unit==='pts' ? ' pts' : '%'}</span><span className="metric-caption">{caption}</span></div><svg className={`sparkline ${color}`} width="78" height="42" viewBox="0 0 78 48" aria-hidden="true"><path d={path+' L 72 48 L 0 48 Z'} fill="currentColor" opacity=".06"/><path d={path} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg></div></article>;
}
function VolumeChart({points}) {
  const [hover,setHover] = useState(null);
  const max = Math.max(...points.map(p=>p.cases),1);
  const ceiling = Math.ceil(max/100)*100;
  const w=720,h=200,left=42,right=14,top=20,bottom=32;
  const plotW=w-left-right, plotH=h-top-bottom, step=plotW/points.length;
  return <div className="volume-chart"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Cases solved by date"><title>Cases solved over the selected reporting period</title>{[0,1,2,3,4].map(i => <g key={i}><line x1={left} y1={top+i*plotH/4} x2={w-right} y2={top+i*plotH/4} className="grid-line"/><text x={left-10} y={top+i*plotH/4+4} textAnchor="end" className="chart-label">{number(ceiling*(1-i/4))}</text></g>)}{points.map((p,i) => {const height=p.cases/ceiling*plotH;return <g key={i} tabIndex="0" aria-label={`${shortDate(p.date)}: ${p.cases} cases`} onMouseEnter={()=>setHover(i)} onMouseLeave={()=>setHover(null)} onFocus={()=>setHover(i)} onBlur={()=>setHover(null)}><rect x={left+step*i+step*.21} y={top+plotH-height} width={step*.58} height={height} rx="4" fill={hover===i ? '#d9562e' : '#f28b66'}/>{(points.length<=7 || i%2===0 || i===points.length-1) && <text x={left+step*(i+.5)} y={h-9} textAnchor="middle" className="chart-label">{shortDate(p.date)}</text>}</g>;})}</svg>{hover!==null && <div className="chart-tooltip" role="status"><strong>{shortDate(points[hover].date)}</strong>{number(points[hover].cases)} cases solved{points.length<30 && <small>per chart interval</small>}</div>}</div>;
}
function QualityChart({points}) {
 const w=720,h=200,left=42,right=14,top=20,bottom=32,pw=w-left-right,ph=h-top-bottom;
 const d = key => points.map((p,i)=>`${i?'L':'M'} ${left+i*pw/Math.max(points.length-1,1)} ${top+(100-p[key])/30*ph}`).join(' ');
 return <div className="volume-chart"><svg viewBox={`0 0 ${w} ${h}`} role="img" aria-label="QA and advocacy percentage trends"><title>QA score and brand advocacy trends</title>{[70,80,90,100].map(n=><g key={n}><line x1={left} y1={top+(100-n)/30*ph} x2={w-right} y2={top+(100-n)/30*ph} className="grid-line"/><text x={left-10} y={top+(100-n)/30*ph+4} textAnchor="end" className="chart-label">{n}%</text></g>)}<path d={d('qa')} fill="none" stroke="#8e7bd8" strokeWidth="3" strokeLinejoin="round"/><path d={d('advocacy')} fill="none" stroke="#5ca68d" strokeWidth="3" strokeLinejoin="round"/>{points.map((p,i)=>(points.length<=7||i%2===0||i===points.length-1)&&<text key={i} x={left+i*pw/Math.max(points.length-1,1)} y={h-9} textAnchor="middle" className="chart-label">{shortDate(p.date)}</text>)}</svg></div>;
}
function QualityGauge({score}) {
 const angle = (score/100)*Math.PI;
 const x=130-100*Math.cos(angle), y=115-100*Math.sin(angle);
 return <div className="gauge"><svg viewBox="0 0 260 140" role="img" aria-label={`Average quality score ${score.toFixed(1)} percent`}><path d="M 30 115 A 100 100 0 0 1 230 115" fill="none" stroke="#f0f0f4" strokeWidth="17" strokeLinecap="round"/><path d={`M 30 115 A 100 100 0 ${score>100 ? 1:0} 1 ${x} ${y}`} fill="none" stroke="#a795df" strokeWidth="17" strokeLinecap="round"/><text x="130" y="96" textAnchor="middle" className="gauge-score">{score.toFixed(1)}<tspan className="gauge-percent">%</tspan></text><text x="130" y="120" textAnchor="middle" className="gauge-label">Average QA score</text></svg></div>;
}
function Modal({title,onClose,children,drawer=false}) {
 useEffect(()=>{
  const prior=document.activeElement;
  const dialog=document.querySelector('[role="dialog"]');
  const focusable=()=>Array.from(dialog.querySelectorAll('button, [href], input, select, [tabindex="0"]')).filter(el=>!el.disabled);
  focusable()[0]?.focus();
  const trap=e=>{if(e.key!=='Tab')return;const items=focusable(),first=items[0],last=items.at(-1);if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}};
  dialog.addEventListener('keydown',trap); const old=document.body.style.overflow;document.body.style.overflow='hidden';
  return()=>{dialog.removeEventListener('keydown',trap);document.body.style.overflow=old;prior?.focus();};
 },[]);
 return <div className={`modal-backdrop ${drawer ? 'drawer-backdrop' : ''}`} onClick={onClose}><section className={`modal ${drawer ? 'drawer' : ''}`} role="dialog" aria-modal="true" aria-labelledby="dialog-title" onClick={e=>e.stopPropagation()}><div className="modal-heading"><h2 id="dialog-title">{title}</h2><button className="icon-button" aria-label="Close dialog" onClick={onClose}><X size={21}/></button></div>{children}</section></div>;
}

createRoot(document.getElementById('root')).render(<App/>);
