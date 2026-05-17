import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initStore, all, mutate } from './store.js';
import { quarters } from './seed.js';
import { makeAudit, scoreGoal, validateGoalSheet, weightedScore } from './domain.js';

const app = express();
const port = process.env.PORT || 5050;

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const byId = (items, id) => items.find((item) => item.id === id);
const employeeGoals = (goals, employeeId) => goals.filter((goal) => goal.employeeId === employeeId);
const sheetStatusFor = (goals) => {
  if (!goals.length) return 'draft';
  if (goals.some((goal) => goal.sheetStatus === 'submitted')) return 'submitted';
  if (goals.some((goal) => goal.sheetStatus === 'returned')) return 'returned';
  if (goals.every((goal) => goal.sheetStatus === 'approved')) return 'approved';
  return 'draft';
};

function enrich(data) {
  const users = data.users;
  const goals = data.goals.map((goal) => ({ ...goal, score: scoreGoal(goal), owner: byId(users, goal.employeeId) }));
  const checkins = data.checkins.map((item) => ({
    ...item,
    employee: byId(users, item.employeeId),
    manager: byId(users, item.managerId)
  }));

  const employees = users.filter((user) => user.role === 'employee');
  const managers = users.filter((user) => user.role === 'manager');
  const completion = employees.map((employee) => {
    const sheet = employeeGoals(goals, employee.id);
    const completedCheckins = checkins.filter((checkin) => checkin.employeeId === employee.id).length;
    return {
      employeeId: employee.id,
      employeeName: employee.name,
      managerName: byId(users, employee.managerId)?.name || 'Unassigned',
      sheetStatus: sheetStatusFor(sheet),
      goals: sheet.length,
      score: weightedScore(sheet),
      completedCheckins,
      checkinProgress: Math.round((completedCheckins / 4) * 100)
    };
  });

  return {
    ...data,
    quarters,
    goals,
    checkins,
    completion,
    metrics: {
      employees: employees.length,
      managers: managers.length,
      approvedSheets: completion.filter((row) => row.sheetStatus === 'approved').length,
      pendingApprovals: completion.filter((row) => row.sheetStatus === 'submitted').length,
      checkinsDone: checkins.length,
      avgScore: Math.round(completion.reduce((sum, row) => sum + row.score, 0) / Math.max(completion.length, 1))
    }
  };
}

app.get('/api/health', async (_req, res) => {
  res.json({ ok: true, service: 'GoalOS API' });
});

app.get('/api/bootstrap', async (_req, res) => {
  const data = {};
  for (const name of ['users', 'goals', 'checkins', 'audits', 'notifications', 'escalations']) data[name] = await all(name);
  res.json(enrich(data));
});

app.post('/api/goals/save', async (req, res) => {
  const { actorId, employeeId, goals } = req.body;
  const validation = validateGoalSheet(goals);
  if (!validation.valid) return res.status(422).json(validation);

  const result = await mutate(async (data) => {
    const current = employeeGoals(data.goals, employeeId);
    if (current.some((goal) => goal.locked)) return { error: 'Approved goals are locked. Ask Admin/HR to unlock before editing.' };
    data.goals = data.goals.filter((goal) => goal.employeeId !== employeeId);
    data.goals.push(...goals.map((goal) => ({
      ...goal,
      id: goal.id || `g-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      employeeId,
      sheetStatus: 'draft',
      locked: false,
      primaryOwnerId: goal.primaryOwnerId || employeeId,
      achievements: goal.achievements || { q1: '', q2: '', q3: '', q4: '' },
      updatedAt: new Date().toISOString()
    })));
    data.audits.unshift(makeAudit(actorId, 'GoalSheet', employeeId, 'Saved draft goals', `${current.length} goals`, `${goals.length} goals`));
    return { ok: true };
  });
  if (result.error) return res.status(409).json(result);
  res.json(result);
});

app.post('/api/goals/submit', async (req, res) => {
  const { actorId, employeeId } = req.body;
  const result = await mutate(async (data) => {
    const sheet = employeeGoals(data.goals, employeeId);
    const validation = validateGoalSheet(sheet);
    if (!validation.valid) return { validation };
    sheet.forEach((goal) => { goal.sheetStatus = 'submitted'; goal.updatedAt = new Date().toISOString(); });
    data.notifications.unshift({
      id: `n-${Date.now()}`,
      channel: 'Teams',
      audience: byId(data.users, byId(data.users, employeeId)?.managerId)?.name || 'Manager',
      message: `${byId(data.users, employeeId)?.name} submitted goals for approval.`,
      createdAt: new Date().toISOString()
    });
    data.audits.unshift(makeAudit(actorId, 'GoalSheet', employeeId, 'Submitted for approval', 'Draft', 'Submitted'));
    return { ok: true };
  });
  if (result.validation) return res.status(422).json(result.validation);
  res.json(result);
});

app.post('/api/goals/approve', async (req, res) => {
  const { actorId, employeeId, goals, decision, comment } = req.body;
  const validation = validateGoalSheet(goals);
  if (!validation.valid && decision === 'approve') return res.status(422).json(validation);

  await mutate(async (data) => {
    const status = decision === 'approve' ? 'approved' : 'returned';
    goals.forEach((incoming) => {
      const goal = byId(data.goals, incoming.id);
      if (!goal) return;
      const before = `Target: ${goal.targetLabel || goal.target}, Weightage: ${goal.weightage}%`;
      goal.target = incoming.target;
      goal.targetLabel = incoming.targetLabel || String(incoming.target);
      goal.weightage = Number(incoming.weightage);
      goal.sheetStatus = status;
      goal.locked = status === 'approved';
      goal.updatedAt = new Date().toISOString();
      const after = `Target: ${goal.targetLabel || goal.target}, Weightage: ${goal.weightage}%`;
      if (before !== after) data.audits.unshift(makeAudit(actorId, 'Goal', goal.id, 'Inline approval edit', before, after));
    });
    data.audits.unshift(makeAudit(actorId, 'GoalSheet', employeeId, status === 'approved' ? 'Approved and locked' : 'Returned for rework', 'Submitted', comment || status));
    data.notifications.unshift({
      id: `n-${Date.now()}`,
      channel: 'Email',
      audience: byId(data.users, employeeId)?.name || 'Employee',
      message: status === 'approved' ? 'Your goals are approved and locked.' : `Your goals were returned for rework: ${comment || 'Please review.'}`,
      createdAt: new Date().toISOString()
    });
  });
  res.json({ ok: true });
});

app.post('/api/goals/achievement', async (req, res) => {
  const { actorId, goalId, quarter, actual, status } = req.body;
  await mutate(async (data) => {
    const goal = byId(data.goals, goalId);
    if (!goal) return;
    const linked = goal.sharedGroupId && goal.primaryOwnerId === actorId
      ? data.goals.filter((item) => item.sharedGroupId === goal.sharedGroupId)
      : [goal];
    linked.forEach((item) => {
      const before = `${quarter}: ${item.achievements?.[quarter] ?? ''}, ${item.status}`;
      item.achievements = { ...item.achievements, [quarter]: actual };
      item.status = status;
      item.updatedAt = new Date().toISOString();
      data.audits.unshift(makeAudit(actorId, 'Goal', item.id, 'Updated achievement', before, `${quarter}: ${actual}, ${status}`));
    });
  });
  res.json({ ok: true });
});

app.post('/api/checkins', async (req, res) => {
  const { actorId, employeeId, quarter, comment } = req.body;
  await mutate(async (data) => {
    data.checkins = data.checkins.filter((item) => !(item.employeeId === employeeId && item.quarter === quarter));
    data.checkins.unshift({ id: `c-${Date.now()}`, employeeId, managerId: actorId, quarter, comment, completedAt: new Date().toISOString() });
    data.audits.unshift(makeAudit(actorId, 'Check-in', employeeId, `Completed ${quarter.toUpperCase()} check-in`, 'Open', comment));
    data.notifications.unshift({
      id: `n-${Date.now()}`,
      channel: 'Email',
      audience: byId(data.users, employeeId)?.name || 'Employee',
      message: `Your ${quarter.toUpperCase()} check-in comment has been logged.`,
      createdAt: new Date().toISOString()
    });
  });
  res.json({ ok: true });
});

app.post('/api/admin/share-goal', async (req, res) => {
  const { actorId, employeeIds, goal } = req.body;
  const groupId = `sg-${Date.now()}`;
  await mutate(async (data) => {
    employeeIds.forEach((employeeId, index) => {
      data.goals.push({
        ...goal,
        id: `g-${Date.now()}-${employeeId}`,
        employeeId,
        sharedGroupId: groupId,
        primaryOwnerId: employeeIds[0],
        weightage: index === 0 ? Number(goal.weightage || 10) : 10,
        sheetStatus: 'draft',
        locked: false,
        status: 'Not Started',
        achievements: { q1: '', q2: '', q3: '', q4: '' },
        updatedAt: new Date().toISOString()
      });
    });
    data.audits.unshift(makeAudit(actorId, 'SharedGoal', groupId, 'Pushed departmental KPI', 'None', `${goal.title} to ${employeeIds.length} employees`));
  });
  res.json({ ok: true });
});

app.post('/api/admin/unlock', async (req, res) => {
  const { actorId, employeeId, reason } = req.body;
  await mutate(async (data) => {
    employeeGoals(data.goals, employeeId).forEach((goal) => {
      goal.locked = false;
      goal.sheetStatus = 'draft';
    });
    data.audits.unshift(makeAudit(actorId, 'GoalSheet', employeeId, 'Admin unlock', 'Locked', reason || 'Unlocked for exception handling'));
  });
  res.json({ ok: true });
});

app.get('/api/reports/achievements.csv', async (_req, res) => {
  const users = await all('users');
  const goals = await all('goals');
  const rows = [
    ['Employee', 'Manager', 'Department', 'Thrust Area', 'Goal', 'UoM', 'Planned Target', 'Weightage', 'Q1 Actual', 'Q2 Actual', 'Q3 Actual', 'Q4 Actual', 'Status', 'Progress Score']
  ];
  goals.forEach((goal) => {
    const employee = byId(users, goal.employeeId);
    const manager = byId(users, employee?.managerId);
    rows.push([
      employee?.name,
      manager?.name,
      employee?.department,
      goal.thrustArea,
      goal.title,
      goal.uom,
      goal.targetLabel || goal.target,
      `${goal.weightage}%`,
      goal.achievements?.q1 ?? '',
      goal.achievements?.q2 ?? '',
      goal.achievements?.q3 ?? '',
      goal.achievements?.q4 ?? '',
      goal.status,
      scoreGoal(goal)
    ]);
  });
  const csv = rows.map((row) => row.map((cell) => `"${String(cell ?? '').replaceAll('"', '""')}"`).join(',')).join('\n');
  res.header('Content-Type', 'text/csv');
  res.attachment('achievement-report.csv');
  res.send(csv);
});

const mode = await initStore();
app.listen(port, () => {
  console.log(`GoalOS API running on http://127.0.0.1:${port} using ${mode} storage`);
});
