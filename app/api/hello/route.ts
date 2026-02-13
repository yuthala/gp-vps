import { fetchCustomers } from '@/app/lib/data';

// app/api/hello/route.js
export async function GET(request: any) {
	// сначала получи данные из БД и помести их в Response.json
	const customers = await fetchCustomers();

  return Response.json(customers);
}