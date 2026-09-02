// import { PencilIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
// import Link from 'next/link';
// import { lusitana } from '@/app/ui/fonts';
// import {
//   deleteClientProfile,
//   fetchClientProfiles,
// } from '@/app/lib/dbActions/usersDBactions';

// type Customer = Awaited<ReturnType<typeof fetchClientProfiles>>[number];

// export default async function CustomersPage({
//   searchParams,
// }: {
//   searchParams: Promise<{ query?: string }>;
// }) {
//   const params = await searchParams;
//   const query = params.query ?? '';
//   const customers = await fetchClientProfiles(query);

//   return (
//     <div className="w-full">
//       <h1 className={`${lusitana.className} text-2xl`}>Клиенты</h1>

//       <form method="GET" className="mt-4 flex items-center gap-2 md:mt-8">
//         <input name="query" defaultValue={query} placeholder="Поиск клиентов..." className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-green-500 md:max-w-md" />
//         <button type="submit" className="h-10 rounded-lg bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-500">Найти</button>
//       </form>

//       <Link href="/dashboard/customers/create" className="mt-6 flex h-10 w-fit items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-500">Добавить <PlusIcon className="h-5 w-5" /></Link>

//       <div className="mt-6 flow-root">
//         <div className="inline-block min-w-full align-middle">
//           <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
//             <div className="md:hidden">
//               {customers.map((customer) => <CustomerCard key={customer.user_id} customer={customer} />)}
//             </div>
//             <table className="hidden min-w-full text-gray-900 md:table">
//               <thead className="text-left text-sm font-normal">
//                 <tr>
//                   <th className="px-4 py-5 font-medium sm:pl-6">Клиент</th>
//                   <th className="px-3 py-5 font-medium">E-mail</th>
//                   <th className="px-3 py-5 font-medium">Телефон</th>
//                   <th className="px-3 py-5 font-medium">Бонусы</th>
//                   <th className="px-3 py-5 font-medium">Группа</th>
//                   <th className="px-3 py-5 font-medium"><span className="sr-only">Действия</span></th>
//                 </tr>
//               </thead>
//               <tbody className="bg-white">
//                 {customers.map((customer) => <CustomerRow key={customer.user_id} customer={customer} />)}
//               </tbody>
//             </table>
//             {customers.length === 0 && <p className="p-8 text-center text-sm text-gray-500">Клиенты не найдены</p>}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

// function CustomerRow({ customer }: { customer: Customer }) {
//   return (
//     <tr className="w-full border-b text-sm last-of-type:border-none">
//       <td className="whitespace-nowrap py-3 pl-6 pr-3">
//         <p>{customer.first_name} {customer.second_name}</p>
//       </td>
//       <td className="px-3 py-3">{customer.email}</td>
//       <td className="px-3 py-3">{customer.phone_number}</td>
//       <td className="px-3 py-3">{customer.bonus_balance}</td>
//       <td className="px-3 py-3">{customer.discount_group}</td>
//       <td className="px-3 py-3"><CustomerActions customer={customer} /></td>
//     </tr>
//   );
// }

// function CustomerCard({ customer }: { customer: Customer }) {
//   return (
//     <div className="mb-2 rounded-md bg-white p-4">
//       <p className="font-medium">{customer.first_name} {customer.second_name}</p>
//       <p className="text-sm text-gray-500">{customer.email}</p>
//       <p className="text-sm text-gray-500">{customer.phone_number}</p>
//       <Link href={`/dashboard/customers/${customer.user_id}/edit`} className="mt-3 inline-flex rounded-md border p-2 hover:bg-gray-100" title="Редактировать клиента"><PencilIcon className="w-5" /></Link>
//       <form action={deleteClientProfile} className="mt-2"><input type="hidden" name="user_id" value={customer.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить клиента"><TrashIcon className="w-5" /></button></form>
//     </div>
//   );
// }

// function CustomerActions({ customer }: { customer: Customer }) {
//   return (
//     <div className="flex justify-end gap-2">
//       <Link href={`/dashboard/customers/${customer.user_id}/edit`} className="rounded-md border p-2 hover:bg-gray-100" title="Редактировать клиента"><PencilIcon className="w-5" /></Link>
//       <form action={deleteClientProfile}><input type="hidden" name="user_id" value={customer.user_id} /><button type="submit" className="rounded-md border p-2 hover:bg-gray-100" title="Удалить клиента"><TrashIcon className="w-5" /></button></form>
//     </div>
//   );
// }

import { PencilIcon, PlusIcon } from '@heroicons/react/24/outline';
import Link from 'next/link';
import { lusitana } from '@/app/ui/fonts';
import { fetchClientProfiles } from '@/app/lib/dbActions/usersDBactions';
// Импортируем нашу новую кнопку
import DeleteCustomerButton from '@/app/ui/dashboard/DeleteButton';

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
        <input name="query" defaultValue={query} placeholder="Поиск клиентов..." className="h-10 w-full rounded-lg border border-gray-300 px-3 text-sm outline-none focus:border-green-500 md:max-w-md" />
        <button type="submit" className="h-10 rounded-lg bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-500">Найти</button>
      </form>

      <Link href="/dashboard/customers/create" className="mt-6 flex h-10 w-fit items-center gap-2 rounded-lg bg-green-600 px-4 text-sm font-medium text-white hover:bg-green-500">Добавить <PlusIcon className="h-5 w-5" /></Link>

      <div className="mt-6 flow-root">
        <div className="inline-block min-w-full align-middle">
          <div className="rounded-lg bg-gray-50 p-2 md:pt-0">
            <div className="md:hidden">
              {customers.map((customer) => <CustomerCard key={customer.user_id} customer={customer} />)}
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
  return (
    <tr className="w-full border-b text-sm last-of-type:border-none">
      <td className="whitespace-nowrap py-3 pl-6 pr-3">
        <p>{customer.first_name} {customer.second_name}</p>
      </td>
      <td className="px-3 py-3">{customer.email}</td>
      <td className="px-3 py-3">{customer.phone_number}</td>
      <td className="px-3 py-3">{customer.bonus_balance}</td>
      <td className="px-3 py-3">{customer.discount_group}</td>
      <td className="px-3 py-3"><CustomerActions customer={customer} /></td>
    </tr>
  );
}

function CustomerCard({ customer }: { customer: Customer }) {
  return (
    <div className="mb-2 rounded-md bg-white p-4">
      <p className="font-medium">{customer.first_name} {customer.second_name}</p>
      <p className="text-sm text-gray-500">{customer.email}</p>
      <p className="text-sm text-gray-500">{customer.phone_number}</p>
      <div className="mt-3 flex items-center gap-2">
        <Link href={`/dashboard/customers/${customer.user_id}/edit`} className="inline-flex rounded-md border p-2 hover:bg-gray-100" title="Редактировать клиента"><PencilIcon className="w-5" /></Link>
        {/* ИСПОЛЬЗУЕМ НОВУЮ КНОПКУ ТУТ */}
        <DeleteCustomerButton userId={customer.user_id} />
      </div>
    </div>
  );
}

function CustomerActions({ customer }: { customer: Customer }) {
  return (
    <div className="flex justify-end gap-2">
      <Link href={`/dashboard/customers/${customer.user_id}/edit`} className="rounded-md border p-2 hover:bg-gray-100" title="Редактировать клиента"><PencilIcon className="w-5" /></Link>
      {/* ИСПОЛЬЗУЕМ НОВУЮ КНОПКУ ТУТ */}
      <DeleteCustomerButton userId={customer.user_id} />
    </div>
  );
}
