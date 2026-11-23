import { useApiData } from '../api/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = {
  _id?: string;
  type: string;
  minutes: number;
  points: number;
};

export default function Activities() {
  const state = useApiData<{ activities: Activity[] }>('/api/activities');

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points.">
      {state.status === 'loading' ? (
        <p role="status">Loading activities...</p>
      ) : state.status === 'error' ? (
        <p role="alert">Unable to load activities.</p>
      ) : state.data.activities.length === 0 ? (
        <p>No activities yet.</p>
      ) : (
        <ul>
          {state.data.activities.map((activity, index) => (
            <li key={activity._id ?? index}>
              {activity.type} · {activity.minutes} min · {activity.points} points
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
