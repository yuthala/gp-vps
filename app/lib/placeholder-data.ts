// This file contains placeholder data that you'll be replacing with real data in the Data Fetching chapter:
// https://nextjs.org/learn/dashboard-app/fetching-data

import type { ProductCard } from "./definitions";
const users = [
  {
    id: '410544b2-4001-4271-9855-fec4b6a6442a',
    name: 'User',
    email: 'user@nextmail.com',
    password: '123456',
  },
];

const customers = [
  {
    id: 'd6e15727-9fe1-4961-8c5b-ea44a9bd81aa',
    name: 'Evil Rabbit',
    email: 'evil@rabbit.com',
    image_url: '/customers/evil-rabbit.png',
  },
  {
    id: '3958dc9e-712f-4377-85e9-fec4b6a6442a',
    name: 'Delba de Oliveira',
    email: 'delba@oliveira.com',
    image_url: '/customers/delba-de-oliveira.png',
  },
  {
    id: '3958dc9e-742f-4377-85e9-fec4b6a6442a',
    name: 'Lee Robinson',
    email: 'lee@robinson.com',
    image_url: '/customers/lee-robinson.png',
  },
  {
    id: '76d65c26-f784-44a2-ac19-586678f7c2f2',
    name: 'Michael Novotny',
    email: 'michael@novotny.com',
    image_url: '/customers/michael-novotny.png',
  },
  {
    id: 'CC27C14A-0ACF-4F4A-A6C9-D45682C144B9',
    name: 'Amy Burns',
    email: 'amy@burns.com',
    image_url: '/customers/amy-burns.png',
  },
  {
    id: '13D07535-C59E-4157-A011-F8D2EF4E0CBB',
    name: 'Balazs Orban',
    email: 'balazs@orban.com',
    image_url: '/customers/balazs-orban.png',
  },
];

const invoices = [
  {
    customer_id: customers[0].id,
    amount: 15795,
    status: 'pending',
    date: '2022-12-06',
  },
  {
    customer_id: customers[1].id,
    amount: 20348,
    status: 'pending',
    date: '2022-11-14',
  },
  {
    customer_id: customers[4].id,
    amount: 3040,
    status: 'paid',
    date: '2022-10-29',
  },
  {
    customer_id: customers[3].id,
    amount: 44800,
    status: 'paid',
    date: '2023-09-10',
  },
  {
    customer_id: customers[5].id,
    amount: 34577,
    status: 'pending',
    date: '2023-08-05',
  },
  {
    customer_id: customers[2].id,
    amount: 54246,
    status: 'pending',
    date: '2023-07-16',
  },
  {
    customer_id: customers[0].id,
    amount: 666,
    status: 'pending',
    date: '2023-06-27',
  },
  {
    customer_id: customers[3].id,
    amount: 32545,
    status: 'paid',
    date: '2023-06-09',
  },
  {
    customer_id: customers[4].id,
    amount: 1250,
    status: 'paid',
    date: '2023-06-17',
  },
  {
    customer_id: customers[5].id,
    amount: 8546,
    status: 'paid',
    date: '2023-06-07',
  },
  {
    customer_id: customers[1].id,
    amount: 500,
    status: 'paid',
    date: '2023-08-19',
  },
  {
    customer_id: customers[5].id,
    amount: 8945,
    status: 'paid',
    date: '2023-06-03',
  },
  {
    customer_id: customers[2].id,
    amount: 1000,
    status: 'paid',
    date: '2022-06-05',
  },
];

const revenue = [
  { month: 'Jan', revenue: 2000 },
  { month: 'Feb', revenue: 1800 },
  { month: 'Mar', revenue: 2200 },
  { month: 'Apr', revenue: 2500 },
  { month: 'May', revenue: 2300 },
  { month: 'Jun', revenue: 3200 },
  { month: 'Jul', revenue: 3500 },
  { month: 'Aug', revenue: 3700 },
  { month: 'Sep', revenue: 2500 },
  { month: 'Oct', revenue: 2800 },
  { month: 'Nov', revenue: 3000 },
  { month: 'Dec', revenue: 4800 },
];

 const products: ProductCard[] = [
    {imageSrc: ['/products/lyubasha_zubok.webp', '/products/lyubasha.webp'], description: 'Описание Любаша зубок Описание Любаша зубок', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
      cropSort: 'Любаша', cropName: 'lyubasha', tags: ['#чеснок', '#зубок', '#Любаша'], packageSize: [2.5, 0, 10], cropSize: 'мелкая', pathName: 'zubok', onStockStatus: 'expected', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026',id: 1},
    {imageSrc: ['/products/bogatyr_zubok.webp', '/products/bogatyr.webp'], description: 'описание Богатырь зубок', descriptionDetails: 'Сорт “Богатырь” - озимый стрелкующийся сорт чеснока с особо крупной головкой. Сорт подмосковной селекции. Масса головки в среднем 90-100  г при соблюдении агротехники. Самые крупные головки имеют вес 130-150 г.<br/>Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
      cropName: 'bogatyr', cropSort: 'Богатырь', tags: ['#чеснок', '#зубок', '#Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'zubok', onStockStatus: 'available', price: 120, measureUnit: 100, id: 2},
    {imageSrc: ['/products/bogatyr_odnozubok.webp', '/products/bogatyr.webp'], description: 'Однозубок чеснока, сорт Богатырь, размер средний', descriptionDetails: 'Сорт “Богатырь” - озимый стрелкующийся сорт чеснока с особо крупной головкой. Сорт подмосковной селекции. Масса головки в среднем 90-100  г при соблюдении агротехники. Самые крупные головки имеют вес 130-150 г.<br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
      cropName: 'bogatyr', cropSort: 'Богатырь', tags: ['#чеснок', '#однозубок', '#Богатырь'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'odnozubok', onStockStatus: 'available', price: 140, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 3},
    {imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'описание Шадейка однозубок', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
      cropName: 'shadeyka', cropSort: 'Шадейка', tags: ['#чеснок', '#однозубок', '#Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'not_available', price: 160, measureUnit: 100, id: 4},
    {imageSrc: ['/products/lyubasha_bulb.webp', '/products/lyubasha.webp'], description: 'описание Любаша бульбочки', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Рекомендуется раз в 3-4 года обновлять посевной материал путем размножения чеснока через бульбочки, чтобы избежать “вырождения” чеснока  и каждый год получать крупные и здоровые головки.', 
      cropSort: 'Любаша', cropName: 'lyubasha', tags: ['#чеснок', '#бульбочка', '#Любаша'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'available', price: 300, measureUnit: 100, id: 5},
    {imageSrc: ['/products/shadeyka_bulb.webp', '/products/shadeyka.webp'], description: 'описание Шадейка бульбочки', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Рекомендуется раз в 3-4 года обновлять посевной материал путем размножения чеснока через бульбочки, чтобы избежать “вырождения” чеснока  и каждый год получать крупные и здоровые головки.', 
      cropSort: 'Шадейка', cropName: 'shadeyka', tags: ['#чеснок', '#бульбочка', '#Шадейка'], packageSize: [0.5, 1, 2], cropSize: '4-9 мм', pathName: 'bulb', onStockStatus: 'expected', price: 400, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 6},
    {imageSrc: ['/products/lyubasha_odnozubok.webp', '/products/lyubasha.webp'], description: 'описание Любаша однозубок', descriptionDetails: '"Любаша" - высокоурожайный, неприхотливый сорт озимого чеснока. Срок созревания 100-110  дней. Головка крупная, весом до 120 г, состоит из 5-7 крупных зубчиков. <br/> Меньше хлопот и мусора, больше посевного материала! Зубки чеснока отборного качества: без мусора, повреждений и некондиции - то, что нужно для осенней посадки. Экономит ваше время и деньги.', 
      cropName: 'lyubasha', cropSort: 'Любаша', tags: ['#чеснок', '#однозубок', '#Любаша'], packageSize: [2.5, 5, 10], cropSize: 'крупная', pathName: 'odnozubok', onStockStatus: 'available', price: 120, measureUnit: 100, id: 7},
    {imageSrc: ['/products/komarov_odnozubok.webp', '/products/komarov.webp'], description: 'Однозубок чеснока, сорт Григорий Комаров, размер средний', descriptionDetails: 'Сорт “Григорий Комаров” - озимый стрелкующийся сорт чеснока с крупной головкой. Ароматный, вкус умеренно острый. Масса головки в среднем 90-100 г. Генетически устойчив к болезням. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
      cropName: 'komarov', cropSort: 'Григорий Комаров', tags: ['#чеснок', '#однозубок', '#ГригорийКомаров'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'odnozubok', onStockStatus: 'available', price: 150, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 8},
    {imageSrc: ['/products/shadeyka_odnozubok.webp', '/products/shadeyka.webp'], description: 'Однозубок чеснока, сорт Шадейка, размер средний', descriptionDetails: 'Сорт “Шадейка” - высокоурожайный и неприхотливый озимый сорт чеснока. Один из самых современных сортов чеснока, генетически устойчив к болезням. Сорт специально  выведен  для сурового российского климата.  Срок созревания 110-120 дней. <br/> Однозубок - элитный посевной материал для обновления сорта. Представляет собой небольшую луковку, выращенную из воздушных луковиц чеснока.', 
      cropName: 'shadeyka', cropSort: 'Шадейка', tags: ['#чеснок', '#однозубок', '#Шадейка'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'odnozubok', onStockStatus: 'expected', price: 150, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 9},
    {imageSrc: ['/products/hercules_medium.webp', '/products/hercules.webp'], description: 'Лук-севок, сорт Геркулес, средняя фракция', descriptionDetails: 'Сорт “Геркулес” - сорт лука красивого золотисто-желтого цвета. Обладает великолепным, чуть сладковатым вкусом без горечи. Раннеспелый - вегетационный период 75-90 дней. <br/> Лук-севок средней фракции универсального применения - из него можно получить как луковицу, так и зеленое перо.', 
      cropName: 'hercules', cropSort: 'Геркулес', tags: ['#лук', '#Геркулес'], packageSize: [2.5, 5, 10], cropSize: 'средняя', pathName: 'luksevok', onStockStatus: 'available', price: 100, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 10},
    {imageSrc: ['/products/redbaron_small.webp', '/products/redbaron.webp'], description: 'Лук-севок, сорт Ред Барон, мелкая фракция', descriptionDetails: 'Сорт “Ред Барон” - сорт салатного лука голландской селекции. Обладает великолепным, чуть сладковатым вкусом и красивым красно-фиолетовым цветом. Используется в салатах и для гриля. Раннеспелый - вегетационный период 75-90 дней. <br/> Лук-севок мелкой фракции используется для выращивания лука на головку. Можно сажать как осенью, так и весной.', 
      cropName: 'redbaron', cropSort: 'Ред Барон', tags: ['#лук', '#РедБарон'], packageSize: [2.5, 5, 10], cropSize: 'мелкая', pathName: 'luksevok', onStockStatus: 'expected', price: 110, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 11},
    {imageSrc: ['/products/kwochka.webp'], description: 'Лук шалот, сорт Квочка, луковицы для размножения', descriptionDetails: 'Сорт “Квочка” - высокоурожайный раннеспелый сорт шалота, приспособленный для россиского климата. Обладает великолепным, чуть сладковатым вкусом. Растет "гнездом", многозачатковый. Для всех регионов. <br/> Крупные луковицы шалота используются для размножения шалота, так как из крупной луковицы вырастает "гнездо" с большим количеством луковичек. Можно сажать как осенью, так и весной.', 
      cropName: 'kwochka', cropSort: 'Квочка', tags: ['#шалот', '#Квочка'], packageSize: [2.5, 5, 10], cropSize: 'крупная',  pathName: 'shalotsevok', onStockStatus: 'available', price: 200, measureUnit: 100, estimatedOnStockDate: '10.08.2026', id: 12},
    {imageSrc: ['/products/cebrune_seeds.webp'], description: 'Лук шалот, сорт Цебруне, семена', descriptionDetails: 'Сорт “Цебруне” - высокоурожайный раннеспелый сорт шалота. Луковицы вытянутые, идеальны для салатов и гриля. Обладает великолепным, чуть сладковатым вкусом. Растет "гнездом", многозачатковый. Для выращивани в южных и центральных регионах. В северных широтах выращивают через рассаду.<br/> В первый год после посадки из семян вырастают небольшие луковички шалота. В 1 г содержится около 350 штук семян.', 
      cropName: 'cebrune', cropSort: 'Цебруне', tags: ['#шалот', '#Цебруне'], packageSize: [2, 4, 10], pathName: 'shalotchernushka', onStockStatus: 'available', price: 50, measureUnit: 1, estimatedOnStockDate: '10.08.2026', id: 13},
  ];

export { users, customers, invoices, revenue, products };
