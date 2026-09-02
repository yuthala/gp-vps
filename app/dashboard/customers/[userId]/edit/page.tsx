import { notFound } from 'next/navigation';
import CustomerProfileForm from '@/app/ui/dashboard/CustomerProfileForm';
import { fetchClientProfile } from '@/app/lib/dbActions/usersDBactions';

export default async function EditCustomerPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const customer = await fetchClientProfile(userId);
  if (!customer) notFound();

  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-medium">Редактировать клиента</h1>
      <CustomerProfileForm customer={customer} />
    </div>
  );
}
