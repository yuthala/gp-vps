import CustomerProfileForm from '@/app/ui/dashboard/CustomerProfileForm';

export default function CreateCustomerPage() {
  return (
    <div className="mx-auto w-full max-w-lg p-6">
      <h1 className="mb-6 text-2xl font-medium">Добавить клиента</h1>
      <CustomerProfileForm />
    </div>
  );
}
