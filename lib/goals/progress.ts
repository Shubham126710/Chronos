import { prisma } from "../prisma";

/**
 * Dynamically recalculates the progress percentage of a goal based on
 * its linked tasks and child milestones, and bubbles progress up to parent goals.
 */
export async function recalculateGoalProgress(goalId: string): Promise<number> {
  const goal = await prisma.goal.findUnique({
    where: { id: goalId },
    include: {
      tasks: true,
      children: {
        include: {
          tasks: true,
        }
      }
    }
  });

  if (!goal) return 0;

  let directTaskProgress: number | null = null;
  if (goal.tasks.length > 0) {
    const completed = goal.tasks.filter(t => t.isCompleted).length;
    directTaskProgress = Math.round((completed / goal.tasks.length) * 100);
  }

  let childrenProgress: number | null = null;
  if (goal.children.length > 0) {
    let totalChildProgress = 0;
    for (const child of goal.children) {
      if (child.tasks.length > 0) {
        const completed = child.tasks.filter(t => t.isCompleted).length;
        totalChildProgress += Math.round((completed / child.tasks.length) * 100);
      } else {
        totalChildProgress += child.progress || 0;
      }
    }
    childrenProgress = Math.round(totalChildProgress / goal.children.length);
  }

  let finalProgress = 0;
  if (directTaskProgress !== null && childrenProgress !== null) {
    finalProgress = Math.round((directTaskProgress + childrenProgress) / 2);
  } else if (directTaskProgress !== null) {
    finalProgress = directTaskProgress;
  } else if (childrenProgress !== null) {
    finalProgress = childrenProgress;
  } else {
    finalProgress = goal.progress || 0;
  }

  // Update this goal's progress
  await prisma.goal.update({
    where: { id: goalId },
    data: { progress: finalProgress }
  });

  // Bubble up to parent if this was a milestone
  if (goal.parentId) {
    await recalculateGoalProgress(goal.parentId);
  }

  return finalProgress;
}
