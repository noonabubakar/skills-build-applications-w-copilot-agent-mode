import { useApiData } from '../api/useApiData.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const state = useApiData<{ teams: Team[] }>('/api/teams');

  return (
    <CapabilityCard title="Teams" description="Manage teams and members.">
      {state.status === 'loading' ? (
        <p role="status">Loading teams...</p>
      ) : state.status === 'error' ? (
        <p role="alert">Unable to load teams.</p>
      ) : state.data.teams.length === 0 ? (
        <p>No teams yet.</p>
      ) : (
        <ul>
          {state.data.teams.map((team, index) => (
            <li key={`${team.name}-${index}`}>
              {team.name} · {team.members.length} members
            </li>
          ))}
        </ul>
      )}
    </CapabilityCard>
  );
}
