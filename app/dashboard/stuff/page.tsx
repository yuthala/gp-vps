import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import {
  deleteStaffProfile,
  fetchStaffProfiles,
} from '@/app/lib/dbActions/usersDBactions';

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

      <Link href="/dashboard/stuff/create" className="mt-6 flex h-10 w-fit items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500">Добавить <PlusIcon className="h-5 w-5" /></Link>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {staff.map((member) => <StaffCard key={member.user_id} member={member} />)}
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

function StaffForm({ member }: { member: Staff }) {
  return (
    <div className="grid gap-1">
      <p className="font-medium">{member.first_name} {member.second_name}</p>
      <p className="text-sm text-gray-500">{member.email}</p>
      <p className="text-sm text-gray-500">{member.phone_number}</p>
      <p className="text-sm text-gray-500">{member.position}</p>
      <Link href={`/dashboard/stuff/${member.user_id}/edit`} className="mt-2 inline-flex w-fit rounded-md border p-2 hover:bg-gray-100" title="Редактировать сотрудника"><PencilIcon className="w-5" /></Link>
    </div>
  );
}

function StaffRow({ member }: { member: Staff }) {
  return (
    <tr className="w-full border-b text-sm last-of-type:border-none">
      <td className="whitespace-nowrap py-3 pl-6 pr-3">{member.first_name} {member.second_name}</td>
      <td className="px-3 py-3">{member.email}</td>
      <td className="px-3 py-3">{member.phone_number}</td>
      <td className="px-3 py-3">{member.position}</td>
      <td className="px-3 py-3">{member.salary}</td>
      <td className="px-3 py-3">{new Date(member.hire_date).toLocaleDateString('ru-RU')}</td>
      <td className="px-3 py-3"><StaffActions member={member} /></td>
    </tr>
  );
}

function StaffCard({ member }: { member: Staff }) {
  return (
    <div className="mb-2 rounded-md bg-white p-4">
      <StaffForm member={member} />
      <div className="flex justify-end gap-2">
        <form action={deleteStaffProfile}><input type="hidden" name="user_id" value={member.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить сотрудника"><TrashIcon className="w-5" /></button></form>
      </div>
    </div>
  );
}

function StaffActions({ member }: { member: Staff }) {
  return <div className="flex justify-end gap-2"><Link href={`/dashboard/stuff/${member.user_id}/edit`} className="rounded-md border p-2 hover:bg-gray-100" title="Редактировать сотрудника"><PencilIcon className="w-5" /></Link><form action={deleteStaffProfile}><input type="hidden" name="user_id" value={member.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить сотрудника"><TrashIcon className="w-5" /></button></form></div>;
}