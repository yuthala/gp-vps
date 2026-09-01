import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { lusitana } from '@/app/ui/fonts';
import {
  createClientProfile,
  deleteClientProfile,
  fetchClientProfiles,
  updateClientProfile,
} from '@/app/(seedDB)/users-seed/route';

type Customer = Awaited<ReturnType<typeof fetchClientProfiles>>[number];

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ query?: string }>;
}) {
  const params = await searchParams;
  const query = params.query ?? '';
  const customers = await fetchClientProfiles(query);

  return (
    <div className="w-full">
      <h1 className={`${lusitana.className} text-2xl`}>Клиенты</h1>

      <form method="GET" className="mt-4 flex items-center gap-2 md:mt-8">
        <input name="query" defaultValue={query} placeholder="Поиск клиентов..." className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-blue-500 md:max-w-md" />
        <button type="submit" className="h-10 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500">Найти</button>
      </form>

      <form action={createClientProfile} className="mt-6 rounded-lg bg-gray-50 p-4 shadow-sm">
        <h2 className="mb-3 text-sm font-medium">Добавить клиента</h2>
        <div className="grid gap-3 md:grid-cols-6">
          <input name="user_id" required placeholder="ID пользователя" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm md:col-span-2" />
          <input name="first_name" required placeholder="Имя" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="second_name" required placeholder="Фамилия" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="email" required type="email" placeholder="E-mail" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
          <input name="phone_number" required placeholder="Телефон" className="rounded-md border border-gray-300 bg-white px-3 py-2 text-sm" />
        </div>
        <button type="submit" className="mt-3 flex h-10 items-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-medium text-white hover:bg-blue-500">Добавить <PlusIcon className="h-5 w-5" /></button>
      </form>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {customers.map((customer) => <CustomerCard key={customer.user_id} customer={customer} />)}
            </div>
            <div className="hidden">
              {customers.map((customer) => (
                <form key={customer.user_id} id={`customer-table-${customer.user_id}`} action={updateClientProfile}>
                  <input type="hidden" name="user_id" value={customer.user_id} />
                </form>
              ))}
            </div>
            <table className="hidden min-w-full text-gray-900 md:table">
              <thead className="text-left text-sm font-normal">
                <tr>
                  <th className="px-4 py-5 font-medium sm:pl-6">Клиент</th>
                  <th className="px-3 py-5 font-medium">E-mail</th>
                  <th className="px-3 py-5 font-medium">Телефон</th>
                  <th className="px-3 py-5 font-medium">Бонусы</th>
                  <th className="px-3 py-5 font-medium">Группа</th>
                  <th className="px-3 py-5 font-medium"><span className="sr-only">Действия</span></th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {customers.map((customer) => <CustomerRow key={customer.user_id} customer={customer} />)}
              </tbody>
            </table>
            {customers.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Клиенты не найдены</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function CustomerRow({ customer }: { customer: Customer }) {
  const formId = `customer-table-${customer.user_id}`;
  return (
    <tr className="w-full border-b text-sm last-of-type:border-none">
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <input name="first_name" defaultValue={customer.first_name} form={formId} className="w-28 rounded border border-transparent px-1 py-1 hover:border-gray-300" />
        <input name="second_name" defaultValue={customer.second_name} form={formId} className="ml-1 w-28 rounded border border-transparent px-1 py-1 hover:border-gray-300" />
      </td>
      <td className="px-3 py-3"><input name="email" defaultValue={customer.email} form={formId} className="w-48 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="phone_number" defaultValue={customer.phone_number} form={formId} className="w-36 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="bonus_balance" defaultValue={customer.bonus_balance} form={formId} className="w-20 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><input name="discount_group" defaultValue={customer.discount_group} form={formId} className="w-28 rounded border border-transparent px-1 py-1 hover:border-gray-300" /></td>
      <td className="px-3 py-3"><CustomerActions customer={customer} formId={formId} /></td>
    </tr>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  const formId = `customer-card-${customer.user_id}`;
  return (
    <div className="mb-2 rounded-md bg-white p-4">
      <form id={formId} action={updateClientProfile} className="grid gap-2">
        <input type="hidden" name="user_id" value={customer.user_id} />
        <input name="first_name" defaultValue={customer.first_name} className="rounded border px-2 py-1" />
        <input name="second_name" defaultValue={customer.second_name} className="rounded border px-2 py-1" />
        <input name="email" defaultValue={customer.email} className="rounded border px-2 py-1" />
        <input name="phone_number" defaultValue={customer.phone_number} className="rounded border px-2 py-1" />
        <input name="bonus_balance" defaultValue={customer.bonus_balance} className="rounded border px-2 py-1" />
        <input name="discount_group" defaultValue={customer.discount_group} className="rounded border px-2 py-1" />
        <button type="submit" className="flex w-fit items-center gap-2 rounded-md border p-2 hover:bg-gray-100" title="Сохранить изменения"><PencilIcon className="w-5" />Сохранить</button>
      </form>
      <form action={deleteClientProfile} className="mt-2"><input type="hidden" name="user_id" value={customer.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить клиента"><TrashIcon className="w-5" /></button></form>
    </div>
  );
}

function CustomerActions({ customer, formId }: { customer: Customer; formId: string }) {
  return (
    <div className="flex justify-end gap-2">
      <button type="submit" form={formId} className="rounded-md border p-2 hover:bg-gray-100" title="Сохранить изменения"><PencilIcon className="w-5" /></button>
      <form action={deleteClientProfile}><input type="hidden" name="user_id" value={customer.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить клиента"><TrashIcon className="w-5" /></button></form>
    </div>
  );
}