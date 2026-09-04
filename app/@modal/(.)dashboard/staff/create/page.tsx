import CustomerModal from '@/app/ui/dashboard/CustomerModal';
import StaffProfileForm from '@/app/ui/dashboard/StaffProfileForm';

export default function CreateStaffModalPage() {
  return <CustomerModal><h1 className="mb-6 text-2xl font-medium">Добавить сотрудника</h1><StaffProfileForm /></CustomerModal>;
}
