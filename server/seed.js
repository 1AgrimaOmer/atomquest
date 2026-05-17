export const quarters = [
  { id: 'phase1', label: 'Phase 1 - Goal Setting', window: '1 May', action: 'Goal Creation, Submission & Approval' },
  { id: 'q1', label: 'Q1 Check-in', window: 'July', action: 'Progress Update - Planned vs. Actual' },
  { id: 'q2', label: 'Q2 Check-in', window: 'October', action: 'Progress Update - Planned vs. Actual' },
  { id: 'q3', label: 'Q3 Check-in', window: 'January', action: 'Progress Update - Planned vs. Actual' },
  { id: 'q4', label: 'Q4 / Annual', window: 'March / April', action: 'Final Achievement Capture' }
];

export const seedData = {
  users: [
    { id: 'u-emp-1', name: 'Asha Verma', role: 'employee', title: 'Sales Executive', department: 'Enterprise Sales', managerId: 'u-mgr-1', avatar: 'AV' },
    { id: 'u-emp-2', name: 'Kabir Menon', role: 'employee', title: 'Customer Success Lead', department: 'Enterprise Sales', managerId: 'u-mgr-1', avatar: 'KM' },
    { id: 'u-emp-3', name: 'Mira Shah', role: 'employee', title: 'Operations Analyst', department: 'Operations', managerId: 'u-mgr-1', avatar: 'MS' },
    { id: 'u-mgr-1', name: 'Rohan Mehta', role: 'manager', title: 'L1 Manager', department: 'Enterprise Sales', managerId: 'u-admin-1', avatar: 'RM' },
    { id: 'u-admin-1', name: 'Nisha Rao', role: 'admin', title: 'HR Business Partner', department: 'People Success', managerId: null, avatar: 'NR' }
  ],
  goals: [
    {
      id: 'g-1',
      employeeId: 'u-emp-1',
      thrustArea: 'Revenue Growth',
      title: 'Grow strategic account revenue',
      description: 'Expand existing enterprise accounts through mapped upsell motions and quarterly executive reviews.',
      uom: 'min',
      target: 1200000,
      targetLabel: 'INR 12L',
      weightage: 30,
      status: 'On Track',
      sheetStatus: 'approved',
      sharedGroupId: null,
      primaryOwnerId: 'u-emp-1',
      locked: true,
      achievements: { q1: 275000, q2: 610000, q3: 0, q4: 0 },
      updatedAt: '2026-05-12T09:10:00.000Z'
    },
    {
      id: 'g-2',
      employeeId: 'u-emp-1',
      thrustArea: 'Customer Success',
      title: 'Improve renewal readiness',
      description: 'Complete adoption reviews for all tier-1 customers before renewal window.',
      uom: 'min-percent',
      target: 92,
      targetLabel: '92%',
      weightage: 20,
      status: 'On Track',
      sheetStatus: 'approved',
      sharedGroupId: null,
      primaryOwnerId: 'u-emp-1',
      locked: true,
      achievements: { q1: 38, q2: 71, q3: 0, q4: 0 },
      updatedAt: '2026-05-11T09:10:00.000Z'
    },
    {
      id: 'g-3',
      employeeId: 'u-emp-1',
      thrustArea: 'Process Excellence',
      title: 'Reduce quote turnaround time',
      description: 'Partner with finance and legal to reduce average quote turnaround time.',
      uom: 'max',
      target: 24,
      targetLabel: '24 hours',
      weightage: 20,
      status: 'Completed',
      sheetStatus: 'approved',
      sharedGroupId: null,
      primaryOwnerId: 'u-emp-1',
      locked: true,
      achievements: { q1: 31, q2: 22, q3: 0, q4: 0 },
      updatedAt: '2026-05-11T09:10:00.000Z'
    },
    {
      id: 'g-4',
      employeeId: 'u-emp-1',
      thrustArea: 'Governance',
      title: 'Zero compliance misses',
      description: 'Maintain zero policy exceptions across discounting, contracting, and revenue recognition checkpoints.',
      uom: 'zero',
      target: 0,
      targetLabel: '0 misses',
      weightage: 15,
      status: 'Completed',
      sheetStatus: 'approved',
      sharedGroupId: 'sg-1',
      primaryOwnerId: 'u-emp-1',
      locked: true,
      achievements: { q1: 0, q2: 0, q3: 0, q4: 0 },
      updatedAt: '2026-05-10T08:30:00.000Z'
    },
    {
      id: 'g-5',
      employeeId: 'u-emp-1',
      thrustArea: 'Capability Building',
      title: 'Complete product certification',
      description: 'Finish advanced platform certification before Q2 manager review.',
      uom: 'timeline',
      target: '2026-10-15',
      targetLabel: '15 Oct 2026',
      weightage: 15,
      status: 'On Track',
      sheetStatus: 'approved',
      sharedGroupId: null,
      primaryOwnerId: 'u-emp-1',
      locked: true,
      achievements: { q1: '', q2: '2026-10-10', q3: '', q4: '' },
      updatedAt: '2026-05-11T09:10:00.000Z'
    },
    {
      id: 'g-6',
      employeeId: 'u-emp-2',
      thrustArea: 'Governance',
      title: 'Zero compliance misses',
      description: 'Maintain zero policy exceptions across discounting, contracting, and revenue recognition checkpoints.',
      uom: 'zero',
      target: 0,
      targetLabel: '0 misses',
      weightage: 25,
      status: 'Completed',
      sheetStatus: 'approved',
      sharedGroupId: 'sg-1',
      primaryOwnerId: 'u-emp-1',
      locked: true,
      achievements: { q1: 0, q2: 0, q3: 0, q4: 0 },
      updatedAt: '2026-05-10T08:30:00.000Z'
    },
    {
      id: 'g-7',
      employeeId: 'u-emp-2',
      thrustArea: 'Customer Success',
      title: 'Raise onboarding NPS',
      description: 'Improve onboarding satisfaction through proactive milestones and training.',
      uom: 'min-percent',
      target: 88,
      targetLabel: '88%',
      weightage: 35,
      status: 'On Track',
      sheetStatus: 'submitted',
      sharedGroupId: null,
      primaryOwnerId: 'u-emp-2',
      locked: false,
      achievements: { q1: 42, q2: 64, q3: 0, q4: 0 },
      updatedAt: '2026-05-14T12:00:00.000Z'
    },
    {
      id: 'g-8',
      employeeId: 'u-emp-2',
      thrustArea: 'Adoption',
      title: 'Drive active user adoption',
      description: 'Increase weekly active users across managed accounts.',
      uom: 'min-percent',
      target: 78,
      targetLabel: '78%',
      weightage: 40,
      status: 'On Track',
      sheetStatus: 'submitted',
      sharedGroupId: null,
      primaryOwnerId: 'u-emp-2',
      locked: false,
      achievements: { q1: 31, q2: 49, q3: 0, q4: 0 },
      updatedAt: '2026-05-14T12:00:00.000Z'
    }
  ],
  checkins: [
    {
      id: 'c-1',
      employeeId: 'u-emp-1',
      managerId: 'u-mgr-1',
      quarter: 'q1',
      comment: 'Strong start on strategic accounts. Keep attention on renewal readiness documentation.',
      completedAt: '2026-07-20T10:30:00.000Z'
    },
    {
      id: 'c-2',
      employeeId: 'u-emp-1',
      managerId: 'u-mgr-1',
      quarter: 'q2',
      comment: 'Quote turnaround is ahead of plan. Certification completed before deadline.',
      completedAt: '2026-10-18T11:15:00.000Z'
    }
  ],
  audits: [
    {
      id: 'a-1',
      actorId: 'u-mgr-1',
      entity: 'Goal',
      entityId: 'g-3',
      action: 'Inline approval edit',
      before: 'Target: 30 hours, Weightage: 15%',
      after: 'Target: 24 hours, Weightage: 20%',
      createdAt: '2026-05-09T14:15:00.000Z'
    }
  ],
  notifications: [
    { id: 'n-1', channel: 'Email', audience: 'Asha Verma', message: 'Your Q2 check-in has been completed by Rohan.', createdAt: '2026-10-18T11:20:00.000Z' },
    { id: 'n-2', channel: 'Teams', audience: 'Rohan Mehta', message: 'Kabir submitted goals and is waiting for approval.', createdAt: '2026-05-14T12:01:00.000Z' }
  ],
  escalations: [
    { id: 'e-1', severity: 'High', owner: 'Rohan Mehta', rule: 'Manager has not approved goals within 3 days', subject: 'Kabir Menon goal sheet pending approval', status: 'Open' },
    { id: 'e-2', severity: 'Medium', owner: 'Nisha Rao', rule: 'Q2 check-in not completed inside active window', subject: 'Mira Shah check-in missing', status: 'Watching' }
  ]
};
