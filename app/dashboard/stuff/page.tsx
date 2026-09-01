import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import {
  createStaffProfile,
  deleteStaffProfile,
  fetchStaffProfiles,
  updateStaffProfile,
} from '@/app/(seedDB)/users-seed/route';

type Staff = Awaited<ReturnType<typeof fetchStaffProfiles>>[number];

export default async function StuffPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? '';
  const staff = await fetchStaffProfiles(query);

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-2xl`}>Сотрудники</h1>

      <form method="GET" className="mt-4 flex items-center gap-2 md:mt-8">
        <input name="query" defaultValue={query} placeholder="Поиск сотрудников..." className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 md:max-w-md" />
        <button type="submit" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500">Найти</button>
      </form>

      <form action={createStaffProfile} className="mt-6 rounded-lg bg-gray-50 p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">Добавить сотрудника</h2>
        <div className="grid gap-3 md:grid-cols-4">
          <input name="user_id" required placeholder="ID пользователя" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="first_name" required placeholder="Имя" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="second_name" required placeholder="Фамилия" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="email" required type="email" placeholder="E-mail" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="phone_number" required placeholder="Телефон" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="position" required placeholder="Должность" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="salary" required type="number" min="0" step="0.01" placeholder="Зарплата" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="hire_date" type="date" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500">Добавить <PlusIcon className="h-5 w-5" /></button>
      </form>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {staff.map((member) => <StaffCard key={member.user_id} member={member} />)}
            </div>
            <div className="hidden">
              {staff.map((member) => <StaffForm key={member.user_id} member={member} prefix="table" />)}
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="text-left text-sm font-normal">
                <tr>
                  <th className="px-4 py-5 font-medium sm:pl-6">Сотрудник</th>
                  <th className="px-3 py-5 font-medium">E-mail</th>
                  <th className="px-3 py-5 font-medium">Телефон</th>
                  <th className="px-3 py-5 font-medium">Должность</th>
                  <th className="px-3 py-5 font-medium">Зарплата</th>
                  <th className="px-3 py-5 font-medium">Дата приёма</th>
                  <th className="px-3 py-5 font-medium"><span className="sr-only">Действия</span></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {staff.map((member) => <StaffRow key={member.user_id} member={member} />)}
              </tbody>
            </table>
            {staff.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Сотрудники не найдены</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function StaffForm({ member, prefix }: { member: Staff; prefix: string }) {
  return (
    <form id={`staff-${prefix}-${member.user_id}`} action={updateStaffProfile}>
      <input type="hidden" name="user_id" value={member.user_id} />
      <input name="first_name" defaultValue={member.first_name} />
      <input name="second_name" defaultValue={member.second_name} />
      <input name="email" defaultValue={member.email} />
      <input name="phone_number" defaultValue={member.phone_number} />
      <input name="position" defaultValue={member.position} />
      <input name="salary" defaultValue={member.salary} />
      <input name="hire_date" defaultValue={new Date(member.hire_date).toISOString().slice(0, 10)} />
    </form>
  );
}

function StaffRow({ member }: { member: Staff }) {
  const formId = `staff-table-${member.user_id}`;
  return (
    <tr className="w-full border-b text-sm last-of-type:border-none">
      <td className="whitespace-nowrap py-3 pl-6 pr-3"><input name="first_name" defaultValue={member.first_name} form={formId} className="w-28 rounded border border-transparent px-1 py-1 hover:border-gray-300" /> <input name="second_name" defaultValue={member.second_name} form={formId} className="w-28 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="email" defaultValue={member.email} form={formId} className="w-44 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="phone_number" defaultValue={member.phone_number} form={formId} className="w-32 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="position" defaultValue={member.position} form={formId} className="w-32 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="salary" defaultValue={member.salary} form={formId} className="w-24 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="hire_date" type="date" defaultValue={new Date(member.hire_date).toISOString().slice(0, 10)} form={formId} className="rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><StaffActions member={member} formId={formId} /></td>
    </tr>
  );
}

function StaffCard({ member }: { member: Staff }) {
  const formId = `staff-card-${member.user_id}`;
  return (
    <div className="mb-2 rounded-md bg-white p-4">
      <StaffForm member={member} prefix="card" />
      <div className="flex justify-between gap-2">
        <button type="submit" form={formId} className="flex items-center gap-2 rounded-md border p-2 hover:bg-gray-100" title="Сохранить изменения"><PencilIcon className="w-5" />Сохранить</button>
        <form action={deleteStaffProfile}><input type="hidden" name="user_id" value={member.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить сотрудника"><TrashIcon className="w-5" /></button></form>
      </div>
    </div>
  );
}

function StaffActions({ member, formId }: { member: Staff; formId: string }) {
  return <div className="flex justify-end gap-2"><button type="submit" form={formId} className="rounded-md border p-2 hover:bg-gray-100" title="Сохранить изменения"><PencilIcon className="w-5" /></button><form action={deleteStaffProfile}><input type="hidden" name="user_id" value={member.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить сотрудника"><TrashIcon className="w-5" /></button></form></div>;
}