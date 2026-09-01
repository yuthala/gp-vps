import { notFound } from 'next/navigation';
import CustomerModal from '@/app/ui/dashboard/CustomerModal';
import CustomerProfileForm from '@/app/ui/dashboard/CustomerProfileForm';
import { fetchClientProfile } from '@/app/(seedDB)/users-seed/route';

export default async function EditCustomerModalPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const customer = await fetchClientProfile(userId);
  if (!customer) notFound();

  return (
    <CustomerModal>
      <h1 className="mb-6 text-2xl font-medium">Редактировать клиента</h1>
      <CustomerProfileForm customer={customer} />
    </CustomerModal>
  );
}
