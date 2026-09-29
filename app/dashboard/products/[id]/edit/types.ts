// types.ts
export interface ProductData {
  internal_id: string;
  id: string; // Добавили id, так как он используется в хлебных крошках page.tsx
  cropSort?: string;
  cropName?: string;
  price?: number;
  cropSize?: string;
  pathName?: string;
  onStockStatus?: 'available' | 'not_available' | 'expected';
  measureUnit?: number;
  estimatedOnStockDate?: string | null;
  description?: string;
  descriptionDetails?: string | null;
  
  // Делаем массивы необязательными для совместимости с типами БД
  tags?: string[];
  packageSize?: number[];
  imageSrc?: string[];
  dx?: number[];
  dy?: number[];
  dz?: number[];
  weight?: number[];
}

