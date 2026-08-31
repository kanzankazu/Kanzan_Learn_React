// UserList component — fetches users from an API
import { useState, useEffect } from "react";

interface User { id: number; name: string; email: string; }

interface UserListProps {
  fetchUsers?: () => Promise<User[]>;
}

const defaultFetch = () =>
  fetch("https://jsonplaceholder.typicode.com/users?_limit=3")
    .then(r => r.json()) as Promise<User[]>;

export const UserList = ({ fetchUsers = defaultFetch }: UserListProps) => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers()
      .then(setUsers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [fetchUsers]);

  if (loading) return <p>Loading users...</p>;
  if (error)   return <p role="alert">Error: {error}</p>;
  return (
    <ul aria-label="User list">
      {users.map(u => (
        <li key={u.id}>
          <strong>{u.name}</strong> — {u.email}
        </li>
      ))}
    </ul>
  );
};
