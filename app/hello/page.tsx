export default async function Page() {
  type User = { id: string | number; name: string; email?: string };

  const res = await fetch('http://localhost:3000/api/hello');
  const data = (await res.json()) as User[];
  console.log(data);
  return (
    <ul>
      {data.map((user) => (
        <li key={user.id}>{user.name} - {user.email}</li>
      ))}
    </ul>
  );
}