import { createStaffProfile, updateStaffProfile } from '@/app/lib/dbActions/usersDBactions';
import ModalCancelButton from '@/app/ui/dashboard/ModalCancelButton';

type Staff = {
  user_id: string;
  first_name: string;
  second_name: string;
  email: string;
  phone_number: string;
  position: string;
  salary: string;
  hire_date: Date;
};

export default function StaffProfileForm({ member }: { member?: Staff }) {
  const isEditing = Boolean(member);
  return (
    <form action={isEditing ? updateStaffProfile : createStaffProfile} className="grid gap-4">
      <label className="grid gap-1 text-sm font-medium">
        ID пользователя
        <input name="user_id" required defaultValue={member?.user_id} readOnly={isEditing} className="rounded-md border border-gray-300 px-3 py-2 read-only:bg-gray-100" />
      </label>
      <label className="grid gap-1 text-sm font-medium">
        Роль
        <select name="role" defaultValue="stuff" className="rounded-md border border-gray-300 px-3 py-2">
          <option value="stuff">Сотрудник</option>
          <option value="admin">Администратор</option>
        </select>
      </label>
      <label className="grid gap-1 text-sm font-medium">Имя<input name="first_name" required minLength={1} maxLength={255} defaultValue={member?.first_name} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <label className="grid gap-1 text-sm font-medium">Фамилия<input name="second_name" required minLength={1} maxLength={255} defaultValue={member?.second_name} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <label className="grid gap-1 text-sm font-medium">E-mail<input name="email" required type="email" maxLength={255} defaultValue={member?.email} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <label className="grid gap-1 text-sm font-medium">Телефон<input name="phone_number" required minLength={5} maxLength={30} defaultValue={member?.phone_number} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <label className="grid gap-1 text-sm font-medium">Должность<input name="position" required minLength={1} maxLength={255} defaultValue={member?.position} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <label className="grid gap-1 text-sm font-medium">Зарплата<input name="salary" required type="number" min="0" step="0.01" defaultValue={member?.salary} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <label className="grid gap-1 text-sm font-medium">Дата приёма<input name="hire_date" required type="date" defaultValue={member ? new Date(member.hire_date).toISOString().slice(0, 10) : undefined} className="rounded-md border border-gray-300 px-3 py-2" /></label>
      <div className="flex justify-end gap-2 pt-2"><ModalCancelButton /><button type="submit" className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">{isEditing ? 'Сохранить' : 'Добавить'}</button></div>
    </form>
  );
}
