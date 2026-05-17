export const uomLabels = {
  min: 'Numeric - higher is better',
  'min-percent': '% - higher is better',
  max: 'Numeric - lower is better',
  'max-percent': '% - lower is better',
  timeline: 'Timeline',
  zero: 'Zero-based'
};

export function scoreGoal(goal, quarter = 'q2') {
  const actual = goal.achievements?.[quarter];
  if (actual === undefined || actual === null || actual === '') return 0;

  if (goal.uom === 'timeline') {
    const deadline = new Date(goal.target).getTime();
    const completion = new Date(actual).getTime();
    if (Number.isNaN(deadline) || Number.isNaN(completion)) return 0;
    return completion <= deadline ? 100 : Math.max(0, 100 - Math.ceil((completion - deadline) / 86400000) * 2);
  }

  if (goal.uom === 'zero') return Number(actual) === 0 ? 100 : 0;

  const target = Number(goal.target);
  const numericActual = Number(actual);
  if (!target || !Number.isFinite(numericActual)) return 0;

  const raw = goal.uom.startsWith('max') ? (target / numericActual) * 100 : (numericActual / target) * 100;
  return Math.max(0, Math.min(150, Math.round(raw)));
}

export function weightedScore(goals, quarter = 'q2') {
  if (!goals.length) return 0;
  const total = goals.reduce((sum, goal) => sum + scoreGoal(goal, quarter) * (Number(goal.weightage) / 100), 0);
  return Math.round(total);
}

export function validateGoalSheet(goals) {
  const errors = [];
  if (goals.length > 8) errors.push('A goal sheet can contain a maximum of 8 goals.');
  goals.forEach((goal, index) => {
    if (Number(goal.weightage) < 10) errors.push(`Goal ${index + 1} must carry at least 10% weightage.`);
    if (!goal.title?.trim()) errors.push(`Goal ${index + 1} needs a title.`);
    if (!goal.thrustArea?.trim()) errors.push(`Goal ${index + 1} needs a thrust area.`);
    if (goal.target === '' || goal.target === null || goal.target === undefined) errors.push(`Goal ${index + 1} needs a target.`);
  });
  const totalWeightage = goals.reduce((sum, goal) => sum + Number(goal.weightage || 0), 0);
  if (totalWeightage !== 100) errors.push(`Total weightage must equal 100%. Current total is ${totalWeightage}%.`);
  return { valid: errors.length === 0, errors, totalWeightage };
}

export function makeAudit(actorId, entity, entityId, action, before, after) {
  return {
    id: `a-${Date.now()}-${Math.random().toString(16).slice(2)}`,
    actorId,
    entity,
    entityId,
    action,
    before,
    after,
    createdAt: new Date().toISOString()
  };
}
