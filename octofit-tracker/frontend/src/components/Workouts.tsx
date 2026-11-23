import { useApiData } from '../api/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type WorkoutSuggestion = { title: string; focus?: string; reason?: string };

export default function Workouts() {
  const userEmail = 'mona@example.com';
  const state = useApiData<{ suggestions: WorkoutSuggestion[] }>(
    `/api/workouts/suggestions/${encodeURIComponent(userEmail)}`,
  );

  return (
    <CapabilityCard title="Workout suggestions" description="Recommend workouts from activity patterns.">
      {state.status === 'loading' ? (
        <p role="status">Loading workout suggestions...</p>
      ) : state.status === 'error' ? (
        <p role="alert">Unable to load workout suggestions.</p>
      ) : state.data.suggestions.length === 0 ? (
        <p>No workout suggestions yet.</p>
      ) : (
        <ul>
          {state.data.suggestions.map((suggestion, index) => (
            <li key={`${suggestion.title}-${index}`}>
              {suggestion.title}
              {suggestion.focus ? ` · ${suggestion.focus}` : ''}
              {suggestion.reason ? ` — ${suggestion.reason}` : ''}
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
