// initialData.ts
export const initialProductState = {
  cropSort: 'Любаша',
  cropName: 'lyubasha',
  price: '100',
  cropSize: 'мелкая',
  pathName: 'zubok',
  onStockStatus: 'expected' as 'available' | 'not_available' | 'expected',
  measureUnit: '100',
  estimatedOnStockDate: '2026-08-10',
  description: 'Описание Любаша зубок',
  descriptionDetails: 'Высокоурожайный сорт озимого чеснока...',
  tags: '#чеснок, #зубок, #Любаша',
  packageSize: '2.5, 0, 10',
  imageSrc: '/products/lyubasha_zubok.webp',
  
  // Дефолтная логистика для Яндекс Доставки
  dx: '15, 15, 20',
  dy: '10, 15, 20',
  dz: '5, 10, 15',
  weight: '300, 500, 1100',
};
