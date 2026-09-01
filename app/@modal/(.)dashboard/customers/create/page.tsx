import CustomerModal from '@/app/ui/dashboard/CustomerModal';
import CustomerProfileForm from '@/app/ui/dashboard/CustomerProfileForm';

export default function CreateCustomerModalPage() {
  return (
    <CustomerModal>
      <h1 className="mb-6 text-2xl font-medium">Добавить клиента</h1>
      <CustomerProfileForm />
    </CustomerModal>
  );
}
