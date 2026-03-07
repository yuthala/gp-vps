import { ProductCard } from '../../lib/definitions';

export default function PackageItem({ packaging }: { packaging: ProductCard }) {
	return(
		<div className="flex flex-row gap-3 py-8">
			{packaging.packageSize
			.filter(packageSize => packageSize > 0)
			.map((packageSize, index) => {
				return(
					<div key={index} className=
						'w-32 h-10 flex flex-wrap justify-center items-center rounded-sm text-lg border font-extrabold  bg-[#F2F9ED] text-[#064929] border-[#064929]/50  hover:border-[#064929]/90 hover:border-2'>
						<span>{(packageSize * packaging.measureUnit)} г</span>
					</div>
				)
			})}
		</div>
	)
}