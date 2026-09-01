import { createClientProfile, updateClientProfile } from '@/app/(seedDB)/users-seed/route';
import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';

type Customer = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  bonus_balance: string;
  discount_group: string;
};

export default function CustomerProfileForm({ customer }: { customer?: Customer }) {
  const isEditing = Boolean(customer);
  return (
    <form action={isEditing ? updateClientProfile : createClientProfile} className="grid gap-4">
      {customer && <input type="hidden" name="user_id" value={customer.user_id} />}
      <label className="grid gap-1 text-sm font-medium">
        Имя
        <input name="first_name" required minLength={1} maxLength={255} defaultValue={customer?.first_name} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Фамилия
        <input name="second_name" required minLength={1} maxLength={255} defaultValue={customer?.second_name} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        E-mail
        <input name="email" required type="email" maxLength={255} defaultValue={customer?.email} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Телефон
        <input name="phone_number" required minLength={5} maxLength={30} defaultValue={customer?.phone_number} className="rounded-md border border-gray-300 px-3 py-2" />
      </label>
      {customer && (
        <>
          <label className="grid gap-1 text-sm font-medium">
            Бонусы
            <input name="bonus_balance" required inputMode="decimal" pattern="^\\d+(\\.\\d{1,2})?$" defaultValue={customer.bonus_balance} className="rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label className="grid gap-1 text-sm font-medium">
            Группа
            <input name="discount_group" required maxLength={100} defaultValue={customer.discount_group} className="rounded-md border border-gray-300 px-3 py-2" />
          </label>
        </>
      )}
      <div className="flex justify-end gap-2 pt-2">
        <ModalCancelButton />
        <button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
          {isEditing ? 'Сохранить' : 'Добавить'}
        </button>
      </div>
    </form>
  );
}
