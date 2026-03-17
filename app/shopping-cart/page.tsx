import ShoppingCartComponent from '@/app/ui/shoppingCart/ShoppingCartComponent';
import {getProductCard, getRecommendedProducts} from '@/app/lib/actions';

export default async function ShoppingCartPage() {
	// const productCards = (await getProductCard('')).products
	// const recProducts = await getRecommendedProducts(productCards)
  return(
    <div className="max-w-7xl w-full mx-auto">
      <ShoppingCartComponent />
    </div>
  )
}