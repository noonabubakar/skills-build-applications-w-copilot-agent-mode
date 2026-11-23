import mongoose from 'mongoose';
import { Activity, Team, User, Workout } from '../models/index.js';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export async function listActivities() {
  return Activity.find().lean();
}

export async function createActivity(input: unknown) {
  if (!isRecord(input)) {
    throw Object.assign(new Error('Activity input must be an object'), { status: 400 });
  }

  const { userId, teamId, type, minutes } = input;
  if (
    typeof userId !== 'string' ||
    typeof teamId !== 'string' ||
    typeof type !== 'string' ||
    !type.trim() ||
    typeof minutes !== 'number' ||
    !Number.isFinite(minutes) ||
    minutes <= 0
  ) {
    throw Object.assign(new Error('Activity requires valid userId, teamId, type, and minutes'), { status: 400 });
  }

  if (!mongoose.isObjectIdOrHexString(userId) || !mongoose.isObjectIdOrHexString(teamId)) {
    throw Object.assign(new Error('Activity userId and teamId must be valid IDs'), { status: 400 });
  }

  const [user, team] = await Promise.all([
    User.exists({ _id: userId }),
    Team.exists({ _id: teamId }),
  ]);
  if (!user || !team) {
    throw Object.assign(new Error('Activity user or team was not found'), { status: 404 });
  }

  return Activity.create({
    user: userId,
    team: teamId,
    type: type.trim(),
    minutes,
    points: minutes,
    occurredAt: new Date(),
  });
}

export async function listTeams() {
  return Team.find().lean();
}

export async function createTeam(input: unknown) {
  if (!isRecord(input) || typeof input.name !== 'string' || !input.name.trim()) {
    throw Object.assign(new Error('Team name is required'), { status: 400 });
  }

  const members = input.members ?? [];
  if (!Array.isArray(members)) {
    throw Object.assign(new Error('Team members must be an array'), { status: 400 });
  }

  return Team.create({
    name: input.name,
    mascot: input.mascot,
    members,
  });
}

export async function getLeaderboard() {
  const teams = await Team.aggregate([
    {
      $lookup: {
        from: Activity.collection.name,
        localField: '_id',
        foreignField: 'team',
        as: 'activities',
      },
    },
    {
      $project: {
        _id: 0,
        teamName: '$name',
        totalPoints: { $sum: '$activities.points' },
      },
    },
    { $sort: { totalPoints: -1, teamName: 1 } },
  ]);

  return teams.map((team, index) => ({ ...team, rank: index + 1 }));
}

export async function suggestWorkouts(userEmail: string) {
  const user = await User.findOne({ email: userEmail }).lean();
  if (!user) {
    throw Object.assign(new Error('User was not found'), { status: 404 });
  }

  const [recentActivity, workouts] = await Promise.all([
    Activity.findOne({ user: user._id }).sort({ occurredAt: -1 }).lean(),
    Workout.find().lean(),
  ]);
  const goal = user.fitnessGoal.toLowerCase();
  const goalMatches = workouts.filter((workout) => workout.focus.toLowerCase() === goal);
  const activityType = recentActivity?.type.toLowerCase();
  const activityMatches = activityType
    ? workouts.filter((workout) => workout.focus.toLowerCase() === activityType)
    : [];
  const suggestions = goalMatches.length > 0 ? goalMatches : activityMatches;

  return suggestions.map((workout) => ({
    ...workout,
    reason: goalMatches.length > 0
      ? `Recommended for your ${user.fitnessGoal} goal${recentActivity ? ` and recent ${recentActivity.type} activity` : ''}.`
      : `Recommended based on your recent ${recentActivity?.type} activity.`,
  }));
}

export { User };
