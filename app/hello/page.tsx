export default async function Page() {
  const res = await fetch('http://localhost:3000/api/hello')
  const data = await res.json()
	console.log(data)
  return (
    <ul>
        {data.map((data: any) => (
        <li key={data.id}>{data.name} - {data.email}</li>
      ))}
    </ul>
  )
}