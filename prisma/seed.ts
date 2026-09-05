import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding Chronos OS Canvas database...');

  // Clean existing data
  await prisma.activityLog.deleteMany();
  await prisma.weatherCache.deleteMany();
  await prisma.pomodoroSession.deleteMany();
  await prisma.focusSession.deleteMany();
  await prisma.aIConversation.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.integration.deleteMany();
  await prisma.widgetPreference.deleteMany();
  await prisma.dashboardWidget.deleteMany();
  await prisma.dashboardLayout.deleteMany();
  await prisma.habitLog.deleteMany();
  await prisma.habit.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.project.deleteMany();
  await prisma.calendarEvent.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Create User
  const user = await prisma.user.create({
    data: {
      email: 'alex.vance@chronos.ai',
      name: 'Alex Vance',
      passwordHash,
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      productivityScore: 94,
      habitStreak: 14,
      focusHoursThisWeek: 28.5,
    },
  });
  console.log('👤 Created User:', user.name);

  // 2. Create Projects
  const chronosProject = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Chronos AI Operating System',
      description: 'Building a luxury, modular AI productivity OS with fluid shaders and intelligent recommendations.',
      progress: 85,
      status: 'ACTIVE',
      color: '#FF8C61',
      deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      files: JSON.stringify([
        { name: 'Architecture_RFC.pdf', url: '#', size: '2.4 MB' },
        { name: 'OS_Canvas_Widget_Specs.fig', url: '#', size: '14.1 MB' },
        { name: 'AI_Heuristic_Engine.ts', url: '#', size: '48 KB' },
      ]),
    },
  });

  const osProject = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Operating Systems Exam Prep',
      description: 'Comprehensive 10-day revision schedule covering memory management, synchronization, and file systems.',
      progress: 40,
      status: 'ACTIVE',
      color: '#4A8B9C',
      deadline: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      files: JSON.stringify([
        { name: 'Silberschatz_OS_Notes.pdf', url: '#', size: '18.5 MB' },
        { name: 'Practice_Exam_1_Solutions.pdf', url: '#', size: '1.2 MB' },
      ]),
    },
  });

  const portfolioProject = await prisma.project.create({
    data: {
      userId: user.id,
      title: 'Portfolio Revamp & Animations',
      description: 'Upgrading personal site with React Bits glassmorphism and Framer Motion micro-interactions.',
      progress: 90,
      status: 'ACTIVE',
      color: '#81C3D7',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  // 3. Create Hierarchical Goals
  const rootGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Crack Top Tier Placements',
      description: 'Secure a Senior Product Engineer role at a top AI / Luxury SaaS tech company.',
      progress: 65,
      status: 'ACTIVE',
    },
  });

  const dsaGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Master DSA & Graph Algorithms',
      description: 'Complete 150 curated LeetCode problems focusing on DP, Trees, and Graphs.',
      progress: 80,
      status: 'ACTIVE',
      parentId: rootGoal.id,
    },
  });

  const projectsGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Build 3 Flagship AI Projects',
      description: 'Create Chronos AI OS, an LLM evaluation suite, and a distributed caching engine.',
      progress: 70,
      status: 'ACTIVE',
      parentId: rootGoal.id,
    },
  });

  const resumeGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Craft ATS-Optimized Resume',
      description: 'Highlight measurable impact, system design trade-offs, and production deployments.',
      progress: 50,
      status: 'ACTIVE',
      parentId: rootGoal.id,
    },
  });

  const mockGoal = await prisma.goal.create({
    data: {
      userId: user.id,
      title: 'Conduct 10 Mock Interviews',
      description: 'Practice live coding and system design with Staff Engineers on Pramp and Exponent.',
      progress: 30,
      status: 'ACTIVE',
      parentId: rootGoal.id,
    },
  });

  console.log('🎯 Created Goal Hierarchy under:', rootGoal.title);

  // 4. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'DSA: Dynamic Programming & Graphs Practice',
      description: 'Solve 3 medium/hard problems on trees and graph shortest paths (Dijkstra / Bellman-Ford).',
      priority: 'HIGH',
      estimatedMinutes: 120,
      dueDate: new Date(),
      isCompleted: false,
      labels: 'DSA,Algorithms,Focus',
      projectId: chronosProject.id,
      goalId: dsaGoal.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'OS Exam Revision: Process Synchronization & Deadlocks',
      description: 'Review Mutex, Semaphores, Monitors, and Banker\'s Algorithm. Complete 20 practice questions.',
      priority: 'HIGH',
      estimatedMinutes: 90,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isCompleted: false,
      labels: 'OS,Exams,University',
      projectId: osProject.id,
    },
  });

  const task3 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Review Resume with Senior Engineering Mentor',
      description: 'Focus on quantifying achievements in Chronos AI project section.',
      priority: 'MEDIUM',
      estimatedMinutes: 45,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      labels: 'Career,Resume',
      goalId: resumeGoal.id,
    },
  });

  const task4 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'Implement LiquidEther WebGL Background',
      description: 'Integrate React Bits shader component with dark purple gradient overlays.',
      priority: 'HIGH',
      estimatedMinutes: 60,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      isCompleted: true,
      labels: 'Frontend,Shaders,UI',
      projectId: chronosProject.id,
      goalId: projectsGoal.id,
    },
  });

  const task5 = await prisma.task.create({
    data: {
      userId: user.id,
      title: 'System Design Mock Interview Prep',
      description: 'Design a distributed rate limiter and real-time collaborative editing backend.',
      priority: 'MEDIUM',
      estimatedMinutes: 60,
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      isCompleted: false,
      labels: 'SystemDesign,Interview',
      goalId: mockGoal.id,
    },
  });

  await prisma.task.update({
    where: { id: task3.id },
    data: { dependsOnId: task4.id },
  });

  console.log('📋 Created Tasks and linked to Goals & Projects.');

  // 5. Create Habits & Logs
  const codingHabit = await prisma.habit.create({
    data: {
      userId: user.id,
      title: 'Deep Coding & Architecture',
      category: 'CODING',
      currentStreak: 14,
      bestStreak: 21,
      completionRate: 98.0,
      targetDays: 7,
    },
  });

  const readingHabit = await prisma.habit.create({
    data: {
      userId: user.id,
      title: 'Read Tech & Philosophy (30 mins)',
      category: 'READING',
      currentStreak: 10,
      bestStreak: 15,
      completionRate: 90.0,
      targetDays: 7,
    },
  });

  const exerciseHabit = await prisma.habit.create({
    data: {
      userId: user.id,
      title: 'HIIT & Weightlifting',
      category: 'EXERCISE',
      currentStreak: 6,
      bestStreak: 12,
      completionRate: 85.0,
      targetDays: 5,
    },
  });

  const sleepHabit = await prisma.habit.create({
    data: {
      userId: user.id,
      title: '7.5+ Hours Quality Sleep',
      category: 'SLEEP',
      currentStreak: 8,
      bestStreak: 19,
      completionRate: 95.0,
      targetDays: 7,
    },
  });

  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    await prisma.habitLog.create({
      data: {
        habitId: codingHabit.id,
        date: dateStr,
        completed: true,
        value: 4.5,
      },
    });

    await prisma.habitLog.create({
      data: {
        habitId: readingHabit.id,
        date: dateStr,
        completed: i !== 3,
        value: i !== 3 ? 30 : 0,
      },
    });

    await prisma.habitLog.create({
      data: {
        habitId: exerciseHabit.id,
        date: dateStr,
        completed: i % 2 === 0,
        value: i % 2 === 0 ? 45 : 0,
      },
    });

    await prisma.habitLog.create({
      data: {
        habitId: sleepHabit.id,
        date: dateStr,
        completed: true,
        value: 7.8,
      },
    });
  }
  console.log('🔥 Created Habits with 14-day streak logs.');

  // 6. Create Calendar Events
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 11, 0, 0);

  await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: 'Deep Work Focus: DSA Graphs',
      description: 'Time blocked session for tackling dynamic programming & graph algorithms.',
      startTime: todayStart,
      endTime: todayEnd,
      category: 'FOCUS',
      isTimeBlock: true,
      color: '#FF8C61',
    },
  });

  await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: 'AI System Architecture Sync',
      description: 'Meeting with co-creators on heuristic scheduling algorithms.',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 14, 0, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 15, 0, 0),
      category: 'MEETING',
      isTimeBlock: false,
      color: '#4A8B9C',
    },
  });

  await prisma.calendarEvent.create({
    data: {
      userId: user.id,
      title: 'Evening Walk & Audiobook',
      description: 'Scheduled outdoor exercise.',
      startTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0, 0),
      endTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 17, 0, 0),
      category: 'PERSONAL',
      isTimeBlock: true,
      color: '#FFAC81',
    },
  });

  console.log('📅 Created Calendar Events.');

  // 7. Create Notes
  await prisma.note.create({
    data: {
      userId: user.id,
      title: 'Operating Systems Exam 10-Day Strategy',
      content: `# Exam Prep Strategy\n\n1. **Days 1-3**: Process Synchronization & Deadlocks\n2. **Days 4-6**: Memory Management & Virtual Memory\n3. **Days 7-8**: File Systems & I/O Hardware\n4. **Days 9-10**: Full Mock Exams & Buffer Review`,
      tags: 'OS,Exams,Strategy',
      projectId: osProject.id,
      taskId: task2.id,
    },
  });

  await prisma.note.create({
    data: {
      userId: user.id,
      title: 'DSA: Dynamic Programming Patterns to Master',
      content: `# Key DP Patterns\n\n- **0/1 Knapsack**: Partition equal subset sum\n- **Unbounded Knapsack**: Coin change\n- **Fibonacci Numbers**: House robber\n- **Palindromic Subsequences**: LPS\n- **Longest Common Substring**: Edit distance, LCS`,
      tags: 'DSA,Algorithms,Coding',
      projectId: chronosProject.id,
      taskId: task1.id,
      goalId: dsaGoal.id,
    },
  });

  // 8. Create Focus Sessions
  await prisma.focusSession.createMany({
    data: [
      { userId: user.id, durationMinutes: 120, taskName: 'DSA: Dynamic Programming Practice', category: 'DSA', completedAt: new Date(Date.now() - 3600000) },
      { userId: user.id, durationMinutes: 90, taskName: 'OS Exam Revision: Synchronization', category: 'STUDY', completedAt: new Date(Date.now() - 86400000) },
      { userId: user.id, durationMinutes: 180, taskName: 'LiquidEther WebGL Background', category: 'CODING', completedAt: new Date(Date.now() - 172800000) },
    ],
  });

  // 9. Create Dashboard Layout
  const layout = await prisma.dashboardLayout.create({
    data: {
      userId: user.id,
      name: 'Chronos Default OS',
      isDefault: true,
    },
  });

  const widgets = [
    { widgetType: 'FOCUS_TIMER', order: 0, colSpan: 1, rowSpan: 1, theme: 'orange' },
    { widgetType: 'CALENDAR', order: 1, colSpan: 2, rowSpan: 2, theme: 'default' },
    { widgetType: 'TASKS', order: 2, colSpan: 2, rowSpan: 2, theme: 'default' },
    { widgetType: 'PROJECTS', order: 3, colSpan: 2, rowSpan: 1, theme: 'teal' },
    { widgetType: 'HABITS', order: 4, colSpan: 2, rowSpan: 1, theme: 'purple' },
    { widgetType: 'GOALS', order: 5, colSpan: 2, rowSpan: 1, theme: 'orange' },
    { widgetType: 'NOTES', order: 6, colSpan: 2, rowSpan: 1, theme: 'default' },
  ];

  for (const w of widgets) {
    await prisma.dashboardWidget.create({
      data: {
        layoutId: layout.id,
        widgetType: w.widgetType,
        order: w.order,
        colSpan: w.colSpan,
        rowSpan: w.rowSpan,
        theme: w.theme,
      },
    });
  }

  console.log('✅ Chronos OS Canvas Database Seeding Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
