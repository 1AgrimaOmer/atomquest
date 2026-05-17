import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  Bell,
  Check,
  ClipboardCheck,
  Download,
  FileLock2,
  Flame,
  Gauge,
  History,
  LayoutDashboard,
  LockKeyhole,
  MessageSquareText,
  Network,
  Plus,
  RefreshCcw,
  Send,
  ShieldCheck,
  Sparkles,
  Target,
  UnlockKeyhole,
  Users
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import './styles.css';

const api = async (path, options = {}) => {
  const response = await fetch(path, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  const payload = response.headers.get('content-type')?.includes('application/json') ? await response.json() : await response.text();
  if (!response.ok) throw new Error(payload.errors?.join(' ') || payload.error || 'Request failed');
  return payload;
};

const roles = [
  { id: 'u-emp-1', label: 'Employee', hint: 'Asha Verma' },
  { id: 'u-mgr-1', label: 'Manager', hint: 'Rohan Mehta' },
  { id: 'u-admin-1', label: 'Admin / HR', hint: 'Nisha Rao' }
];

const statusOptions = ['Not Started', 'On Track', 'Completed'];
const uomOptions = [
  ['min', 'Numeric - higher is better'],
  ['min-percent', '% - higher is better'],
  ['max', 'Numeric - lower is better'],
  ['max-percent', '% - lower is better'],
  ['timeline', 'Timeline'],
  ['zero', 'Zero-based']
];

function App() {
  const [data, setData] = useState(null);
  const [currentUserId, setCurrentUserId] = useState('u-emp-1');
  const [view, setView] = useState('dashboard');
  const [toast, setToast] = useState('');

  const load = async () => setData(await api('/api/bootstrap'));

  useEffect(() => {
    load().catch((error) => setToast(error.message));
  }, []);

  const currentUser = useMemo(() => data?.users.find((user) => user.id === currentUserId), [data, currentUserId]);
  const employees = useMemo(() => data?.users.filter((user) => user.role === 'employee') || [], [data]);
  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3800);
  };
  const refreshAfter = async (promise, success) => {
    try {
      await promise;
      await load();
      showToast(success);
    } catch (error) {
      showToast(error.message);
    }
  };

  if (!data) return <div className="boot"><Sparkles /> Loading GoalOS...</div>;

  const nav = [
    ['dashboard', 'Command Center', LayoutDashboard],
    ['goals', currentUser.role === 'employee' ? 'My Goals' : 'Goal Review', Target],
    ['checkins', 'Check-ins', MessageSquareText],
    ['reports', 'Reports', BarChart3],
    ['governance', 'Governance', ShieldCheck]
  ];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark"><Target size={22} /></div>
          <div>
            <strong>GoalOS</strong>
            <span>AtomQuest Portal</span>
          </div>
        </div>
        <nav>
          {nav.map(([id, label, Icon]) => (
            <button className={view === id ? 'active' : ''} key={id} onClick={() => setView(id)}>
              <Icon size={18} /> {label}
            </button>
          ))}
        </nav>
        <div className="schedule">
          <span>Active Window</span>
          <strong>Q2 Check-in</strong>
          <small>October achievement capture</small>
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">In-house goal setting and tracking</p>
            <h1>{viewTitle(view, currentUser)}</h1>
          </div>
          <div className="role-switcher">
            {roles.map((role) => (
              <button key={role.id} className={currentUserId === role.id ? 'selected' : ''} onClick={() => setCurrentUserId(role.id)}>
                <span>{role.label}</span>
                <small>{role.hint}</small>
              </button>
            ))}
          </div>
        </header>

        {view === 'dashboard' && <Dashboard data={data} currentUser={currentUser} />}
        {view === 'goals' && (
          currentUser.role === 'employee'
            ? <EmployeeGoals data={data} user={currentUser} refreshAfter={refreshAfter} />
            : <ManagerGoals data={data} user={currentUser} refreshAfter={refreshAfter} />
        )}
        {view === 'checkins' && <Checkins data={data} user={currentUser} employees={employees} refreshAfter={refreshAfter} />}
        {view === 'reports' && <Reports data={data} />}
        {view === 'governance' && <Governance data={data} user={currentUser} employees={employees} refreshAfter={refreshAfter} />}
      </main>
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}

function viewTitle(view, user) {
  if (view === 'dashboard') return `${user.name}'s Command Center`;
  if (view === 'goals') return user.role === 'employee' ? 'My Goal Sheet' : 'L1 Approval Desk';
  if (view === 'checkins') return 'Quarterly Check-ins';
  if (view === 'reports') return 'Reports and Analytics';
  return 'Governance and Admin';
}

function Dashboard({ data, currentUser }) {
  const thrust = Object.values(data.goals.reduce((acc, goal) => {
    acc[goal.thrustArea] ||= { name: goal.thrustArea, value: 0 };
    acc[goal.thrustArea].value += 1;
    return acc;
  }, {}));
  const rows = currentUser.role === 'employee' ? data.completion.filter((row) => row.employeeId === currentUser.id) : data.completion;

  return (
    <section className="content-grid">
      <Metric icon={Users} label="Employees" value={data.metrics.employees} accent="blue" />
      <Metric icon={LockKeyhole} label="Approved Sheets" value={data.metrics.approvedSheets} accent="green" />
      <Metric icon={ClipboardCheck} label="Check-ins Done" value={data.metrics.checkinsDone} accent="amber" />
      <Metric icon={Gauge} label="Avg Progress Score" value={`${data.metrics.avgScore}%`} accent="pink" />

      <div className="panel wide">
        <div className="panel-head">
          <div>
            <p className="eyebrow">Completion dashboard</p>
            <h2>Goal and check-in visibility</h2>
          </div>
          <Activity />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Employee</th><th>Manager</th><th>Goal Sheet</th><th>Goals</th><th>Score</th><th>Check-ins</th></tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.employeeId}>
                  <td>{row.employeeName}</td>
                  <td>{row.managerName}</td>
                  <td><Badge tone={row.sheetStatus === 'approved' ? 'green' : row.sheetStatus === 'submitted' ? 'amber' : 'gray'}>{row.sheetStatus}</Badge></td>
                  <td>{row.goals}</td>
                  <td><Progress value={row.score} /></td>
                  <td>{row.completedCheckins}/4</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="panel chart-panel">
        <div className="panel-head"><h2>Goal Distribution</h2><Target /></div>
        <ResponsiveContainer width="100%" height={260}>
          <PieChart>
            <Pie data={thrust} dataKey="value" nameKey="name" innerRadius={48} outerRadius={88} paddingAngle={3}>
              {thrust.map((_, index) => <Cell key={index} fill={['#277da1', '#43aa8b', '#f9c74f', '#f3722c', '#f94144'][index % 5]} />)}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="panel wide architecture">
        <div>
          <p className="eyebrow">Architecture</p>
          <h2>MERN stack with cost-aware fallback</h2>
        </div>
        <div className="arch-line">
          <span>React + Vite</span><i /> <span>Express API</span><i /> <span>MongoDB Adapter</span><i /> <span>Audit + Reports</span>
        </div>
      </div>
    </section>
  );
}

function EmployeeGoals({ data, user, refreshAfter }) {
  const existing = data.goals.filter((goal) => goal.employeeId === user.id);
  const [goals, setGoals] = useState(existing);
  const total = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  const locked = existing.some((goal) => goal.locked);

  useEffect(() => setGoals(existing), [data.goals, user.id]);

  const updateGoal = (id, patch) => setGoals((items) => items.map((goal) => goal.id === id ? { ...goal, ...patch } : goal));
  const addGoal = () => setGoals((items) => [...items, blankGoal(user.id)]);
  const removeGoal = (id) => setGoals((items) => items.filter((goal) => goal.id !== id));

  return (
    <section className="stack">
      <div className="workflow-banner">
        <div><p className="eyebrow">Phase 1 must-have</p><h2>Goal sheet validation</h2></div>
        <div className="rule-chips">
          <Badge tone={total === 100 ? 'green' : 'amber'}>Total {total}%</Badge>
          <Badge tone={goals.every((goal) => Number(goal.weightage) >= 10) ? 'green' : 'amber'}>Min 10%</Badge>
          <Badge tone={goals.length <= 8 ? 'green' : 'red'}>Max 8 goals</Badge>
          {locked && <Badge tone="green"><FileLock2 size={13} /> Locked after approval</Badge>}
        </div>
      </div>
      {goals.map((goal, index) => (
        <GoalEditor key={goal.id} goal={goal} index={index} locked={locked || goal.sharedGroupId} updateGoal={updateGoal} removeGoal={removeGoal} />
      ))}
      <div className="action-row">
        <button className="ghost" onClick={addGoal} disabled={locked || goals.length >= 8}><Plus size={16} /> Add Goal</button>
        <button onClick={() => refreshAfter(api('/api/goals/save', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeId: user.id, goals }) }), 'Draft saved with BRD validation.') } disabled={locked}>Save Draft</button>
        <button className="primary" onClick={() => refreshAfter(api('/api/goals/submit', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeId: user.id }) }), 'Goal sheet submitted to L1 manager.') } disabled={locked}><Send size={16} /> Submit</button>
      </div>
      <QuarterlyUpdater goals={existing} user={user} refreshAfter={refreshAfter} />
    </section>
  );
}

function GoalEditor({ goal, index, locked, updateGoal, removeGoal }) {
  const readonlyShared = Boolean(goal.sharedGroupId);
  return (
    <div className="goal-card">
      <div className="goal-card-head">
        <strong>Goal {index + 1}</strong>
        <div className="goal-actions">
          {goal.sharedGroupId && <Badge tone="blue">Shared KPI</Badge>}
          <button className="icon-button" onClick={() => removeGoal(goal.id)} disabled={locked}><span>×</span></button>
        </div>
      </div>
      <div className="form-grid">
        <label>Thrust Area<input value={goal.thrustArea || ''} disabled={locked || readonlyShared} onChange={(event) => updateGoal(goal.id, { thrustArea: event.target.value })} /></label>
        <label>Goal Title<input value={goal.title || ''} disabled={locked || readonlyShared} onChange={(event) => updateGoal(goal.id, { title: event.target.value })} /></label>
        <label className="span-2">Description<textarea value={goal.description || ''} disabled={locked || readonlyShared} onChange={(event) => updateGoal(goal.id, { description: event.target.value })} /></label>
        <label>UoM<select value={goal.uom || 'min'} disabled={locked || readonlyShared} onChange={(event) => updateGoal(goal.id, { uom: event.target.value })}>{uomOptions.map(([id, label]) => <option key={id} value={id}>{label}</option>)}</select></label>
        <label>Target<input value={goal.target || ''} disabled={locked || readonlyShared} onChange={(event) => updateGoal(goal.id, { target: event.target.value, targetLabel: event.target.value })} /></label>
        <label>Weightage %<input type="number" min="10" value={goal.weightage || 10} disabled={locked} onChange={(event) => updateGoal(goal.id, { weightage: Number(event.target.value) })} /></label>
        <label>Status<select value={goal.status || 'Not Started'} disabled={locked} onChange={(event) => updateGoal(goal.id, { status: event.target.value })}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></label>
      </div>
    </div>
  );
}

function ManagerGoals({ data, user, refreshAfter }) {
  const team = data.users.filter((item) => item.managerId === user.id);
  const [selectedId, setSelectedId] = useState(team[0]?.id);
  const selected = data.users.find((item) => item.id === selectedId) || team[0];
  const sheet = data.goals.filter((goal) => goal.employeeId === selected?.id);
  const [reviewGoals, setReviewGoals] = useState(sheet);

  useEffect(() => setReviewGoals(sheet), [selectedId, data.goals]);
  const update = (id, patch) => setReviewGoals((items) => items.map((goal) => goal.id === id ? { ...goal, ...patch } : goal));

  return (
    <section className="split">
      <div className="panel side-list">
        <p className="eyebrow">Team</p>
        {team.map((member) => {
          const row = data.completion.find((item) => item.employeeId === member.id);
          return (
            <button className={selectedId === member.id ? 'selected-row' : ''} key={member.id} onClick={() => setSelectedId(member.id)}>
              <span>{member.name}</span><Badge tone={row?.sheetStatus === 'approved' ? 'green' : 'amber'}>{row?.sheetStatus || 'draft'}</Badge>
            </button>
          );
        })}
      </div>
      <div className="stack">
        <div className="workflow-banner">
          <div><p className="eyebrow">L1 Approval Workflow</p><h2>{selected?.name}</h2></div>
          <Badge tone="blue">Inline target and weightage edits enabled</Badge>
        </div>
        {reviewGoals.map((goal, index) => (
          <div className="goal-card compact" key={goal.id}>
            <div className="goal-card-head"><strong>{index + 1}. {goal.title}</strong><Badge tone={goal.locked ? 'green' : 'amber'}>{goal.sheetStatus}</Badge></div>
            <p>{goal.description}</p>
            <div className="form-grid manager-grid">
              <label>Target<input value={goal.targetLabel || goal.target} onChange={(event) => update(goal.id, { target: event.target.value, targetLabel: event.target.value })} /></label>
              <label>Weightage<input type="number" min="10" value={goal.weightage} onChange={(event) => update(goal.id, { weightage: Number(event.target.value) })} /></label>
              <label>Score<input value={`${goal.score}%`} readOnly /></label>
            </div>
          </div>
        ))}
        <div className="action-row">
          <button className="ghost" onClick={() => refreshAfter(api('/api/goals/approve', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeId: selected.id, goals: reviewGoals, decision: 'return', comment: 'Please revise targets and resubmit.' }) }), 'Goal sheet returned for rework.')}>Return for Rework</button>
          <button className="primary" onClick={() => refreshAfter(api('/api/goals/approve', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeId: selected.id, goals: reviewGoals, decision: 'approve', comment: 'Approved by L1 manager.' }) }), 'Goals approved and locked.') }><Check size={16} /> Approve & Lock</button>
        </div>
      </div>
    </section>
  );
}

function QuarterlyUpdater({ goals, user, refreshAfter }) {
  const [quarter, setQuarter] = useState('q2');
  return (
    <div className="panel wide">
      <div className="panel-head">
        <div><p className="eyebrow">Phase 2 must-have</p><h2>Quarterly achievement capture</h2></div>
        <select value={quarter} onChange={(event) => setQuarter(event.target.value)}>
          <option value="q1">Q1</option><option value="q2">Q2</option><option value="q3">Q3</option><option value="q4">Q4</option>
        </select>
      </div>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Goal</th><th>Planned Target</th><th>Actual</th><th>Status</th><th>Score</th><th></th></tr></thead>
          <tbody>
            {goals.map((goal) => <AchievementRow key={goal.id} goal={goal} quarter={quarter} user={user} refreshAfter={refreshAfter} />)}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AchievementRow({ goal, quarter, user, refreshAfter }) {
  const [actual, setActual] = useState(goal.achievements?.[quarter] ?? '');
  const [status, setStatus] = useState(goal.status);
  useEffect(() => setActual(goal.achievements?.[quarter] ?? ''), [goal.id, quarter]);
  return (
    <tr>
      <td>{goal.title}{goal.sharedGroupId && <small className="muted"> synced shared KPI</small>}</td>
      <td>{goal.targetLabel || goal.target}</td>
      <td><input className="table-input" value={actual} onChange={(event) => setActual(event.target.value)} /></td>
      <td><select className="table-input" value={status} onChange={(event) => setStatus(event.target.value)}>{statusOptions.map((item) => <option key={item}>{item}</option>)}</select></td>
      <td>{goal.score}%</td>
      <td><button className="mini" onClick={() => refreshAfter(api('/api/goals/achievement', { method: 'POST', body: JSON.stringify({ actorId: user.id, goalId: goal.id, quarter, actual, status }) }), 'Achievement updated. Shared owner updates sync automatically.')}>Update</button></td>
    </tr>
  );
}

function Checkins({ data, user, employees, refreshAfter }) {
  const managed = user.role === 'employee' ? employees.filter((employee) => employee.id === user.id) : user.role === 'manager' ? employees.filter((employee) => employee.managerId === user.id) : employees;
  const [employeeId, setEmployeeId] = useState(managed[0]?.id);
  const [quarter, setQuarter] = useState('q2');
  const [comment, setComment] = useState('');
  const selectedGoals = data.goals.filter((goal) => goal.employeeId === employeeId);

  return (
    <section className="split">
      <div className="panel side-list">
        <p className="eyebrow">Check-in schedule</p>
        {data.quarters.slice(1).map((item) => <div className="schedule-row" key={item.id}><strong>{item.label}</strong><span>{item.window}</span><small>{item.action}</small></div>)}
      </div>
      <div className="stack">
        <div className="panel">
          <div className="form-grid manager-grid">
            <label>Employee<select value={employeeId} onChange={(event) => setEmployeeId(event.target.value)}>{managed.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></label>
            <label>Quarter<select value={quarter} onChange={(event) => setQuarter(event.target.value)}><option value="q1">Q1</option><option value="q2">Q2</option><option value="q3">Q3</option><option value="q4">Q4</option></select></label>
          </div>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Goal</th><th>Planned</th><th>Achievement</th><th>Status</th><th>Progress</th></tr></thead>
              <tbody>{selectedGoals.map((goal) => <tr key={goal.id}><td>{goal.title}</td><td>{goal.targetLabel || goal.target}</td><td>{goal.achievements?.[quarter] || '-'}</td><td>{goal.status}</td><td><Progress value={goal.score} /></td></tr>)}</tbody>
            </table>
          </div>
          {user.role !== 'employee' && (
            <>
              <label className="full-label">Structured Check-in Comment<textarea value={comment} onChange={(event) => setComment(event.target.value)} placeholder="Document discussion, blockers, and next commitments." /></label>
              <button className="primary" onClick={() => refreshAfter(api('/api/checkins', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeId, quarter, comment }) }), 'Structured check-in comment logged.') }><MessageSquareText size={16} /> Complete Check-in</button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}

function Reports({ data }) {
  const chart = data.completion.map((row) => ({ name: row.employeeName.split(' ')[0], score: row.score, checkins: row.completedCheckins * 25 }));
  return (
    <section className="content-grid">
      <div className="panel wide">
        <div className="panel-head">
          <div><p className="eyebrow">Achievement Report</p><h2>Planned target vs actual achievement</h2></div>
          <a className="button-link" href="/api/reports/achievements.csv"><Download size={16} /> Export CSV</a>
        </div>
        <div className="table-wrap">
          <table>
            <thead><tr><th>Employee</th><th>Goal</th><th>Target</th><th>Q1</th><th>Q2</th><th>Status</th><th>Score</th></tr></thead>
            <tbody>{data.goals.map((goal) => <tr key={goal.id}><td>{goal.owner?.name}</td><td>{goal.title}</td><td>{goal.targetLabel || goal.target}</td><td>{goal.achievements?.q1 || '-'}</td><td>{goal.achievements?.q2 || '-'}</td><td>{goal.status}</td><td>{goal.score}%</td></tr>)}</tbody>
          </table>
        </div>
      </div>
      <div className="panel wide chart-panel">
        <div className="panel-head"><h2>QoQ readiness and manager effectiveness</h2><BarChart3 /></div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chart}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="score" fill="#277da1" radius={[6, 6, 0, 0]} />
            <Bar dataKey="checkins" fill="#43aa8b" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}

function Governance({ data, user, employees, refreshAfter }) {
  const [unlockEmployee, setUnlockEmployee] = useState(employees[0]?.id);
  const [shareEmployees, setShareEmployees] = useState(employees.slice(0, 2).map((employee) => employee.id));
  const [sharedGoal, setSharedGoal] = useState({ thrustArea: 'Governance', title: 'Zero audit exceptions', description: 'Maintain zero major audit exceptions across the department.', uom: 'zero', target: 0, targetLabel: '0 exceptions', weightage: 10 });

  const toggleShare = (id) => setShareEmployees((items) => items.includes(id) ? items.filter((item) => item !== id) : [...items, id]);

  return (
    <section className="content-grid">
      <div className="panel">
        <div className="panel-head"><h2>Admin exception handling</h2><UnlockKeyhole /></div>
        <label>Employee<select value={unlockEmployee} onChange={(event) => setUnlockEmployee(event.target.value)}>{employees.map((employee) => <option value={employee.id} key={employee.id}>{employee.name}</option>)}</select></label>
        <button className="primary" disabled={user.role === 'employee'} onClick={() => refreshAfter(api('/api/admin/unlock', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeId: unlockEmployee, reason: 'Admin exception approved for goal correction.' }) }), 'Goal sheet unlocked and audit trail updated.')}>Unlock Goal Sheet</button>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Push shared departmental KPI</h2><Network /></div>
        <div className="form-grid single">
          <label>Title<input value={sharedGoal.title} onChange={(event) => setSharedGoal({ ...sharedGoal, title: event.target.value })} /></label>
          <label>Target<input value={sharedGoal.targetLabel} onChange={(event) => setSharedGoal({ ...sharedGoal, target: event.target.value, targetLabel: event.target.value })} /></label>
        </div>
        <div className="check-list">{employees.map((employee) => <label key={employee.id}><input type="checkbox" checked={shareEmployees.includes(employee.id)} onChange={() => toggleShare(employee.id)} /> {employee.name}</label>)}</div>
        <button className="primary" disabled={user.role === 'employee'} onClick={() => refreshAfter(api('/api/admin/share-goal', { method: 'POST', body: JSON.stringify({ actorId: user.id, employeeIds: shareEmployees, goal: sharedGoal }) }), 'Shared KPI pushed. Recipients can adjust weightage only.')}>Push KPI</button>
      </div>
      <div className="panel wide">
        <div className="panel-head"><h2>Audit Trail</h2><History /></div>
        <div className="timeline">{data.audits.map((audit) => <div key={audit.id}><span>{new Date(audit.createdAt).toLocaleString()}</span><strong>{audit.action}</strong><p>{audit.before} → {audit.after}</p></div>)}</div>
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Escalation Queue</h2><AlertTriangle /></div>
        {data.escalations.map((item) => <div className="alert-card" key={item.id}><Badge tone={item.severity === 'High' ? 'red' : 'amber'}>{item.severity}</Badge><strong>{item.subject}</strong><small>{item.rule}</small></div>)}
      </div>
      <div className="panel">
        <div className="panel-head"><h2>Notifications</h2><Bell /></div>
        {data.notifications.map((item) => <div className="notice" key={item.id}><Badge tone="blue">{item.channel}</Badge><p>{item.message}</p><small>{item.audience}</small></div>)}
      </div>
    </section>
  );
}

function Metric({ icon: Icon, label, value, accent }) {
  return <div className={`metric ${accent}`}><Icon /><span>{label}</span><strong>{value}</strong></div>;
}

function Badge({ children, tone = 'gray' }) {
  return <span className={`badge ${tone}`}>{children}</span>;
}

function Progress({ value }) {
  return <div className="progress"><span style={{ width: `${Math.min(value, 100)}%` }} /><strong>{value}%</strong></div>;
}

function blankGoal(employeeId) {
  return {
    id: `draft-${Date.now()}`,
    employeeId,
    thrustArea: '',
    title: '',
    description: '',
    uom: 'min',
    target: '',
    targetLabel: '',
    weightage: 10,
    status: 'Not Started',
    achievements: { q1: '', q2: '', q3: '', q4: '' }
  };
}

createRoot(document.getElementById('root')).render(<App />);
