import { fetchAllProducts } from '@/app/lib/dbActions/productsDBactions'; // Укажите ваш точный путь к файлу с функцией

export default async function PureProductsPage() {
  // Получаем массив товаров напрямую из базы данных
  const products = await fetchAllProducts();

  if (!products || products.length === 0) {
    return <div>Товары не найдены в базе данных.</div>;
  }

  return (
    <div>
      <h1>Список товаров</h1>
      
      <ul>
        {products.map((product) => (
          <li key={product.internal_id}>
            <h3>{product.crop_sort} ({product.crop_name_eng})</h3>
            <p>SKU ID: {product.id}</p>
            <p>Цена: {product.price} руб.</p>
            <p>Статус: {product.on_stock_status}</p>
            <p>Дата поступления: {product.estimated_on_stock_date || 'Не указана'}</p>
            <p>Ссылки на изображения: {product.image_src?.join(', ') || 'Нет картинок'}</p>
            <hr />
          </li>
        ))}
      </ul>
    </div>
  );
}

  // type User = { id: string | number; name: string; email?: string };

  // const res = await fetch('http://localhost:3000/api/hello');
  // const data = (await res.json()) as User[];
  // console.log(data);
  // return (
  //   <ul>
  //     {data.map((user) => (
  //       <li key={user.id}>{user.name} - {user.email}</li>
  //     ))}
  //   </ul>
  // );

