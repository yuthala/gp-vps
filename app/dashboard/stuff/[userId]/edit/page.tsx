import { notFound } from 'next/navigation';
import StaffProfileForm from '@/app/ui/dashboard/StaffProfileForm';
import { fetchStaffProfile } from '@/app/(seedDB)/users-seed/route';

export default async function EditStaffPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const member = await fetchStaffProfile(userId);
  if (!member) notFound();
  return <div className="mx-auto w-full max-w-lg p-6"><h1 className="mb-6 text-2xl font-medium">Редактировать сотрудника</h1><StaffProfileForm member={member} /></div>;
}
