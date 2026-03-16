interface PricingProps {
  value?: number;
  prefix?: string;
  className?: string;
  containerClassName?: string; // Optional class for the flex container
	classNameValue?: string; //Optional class for value span
}

export default function Pricing({ 
  value,
  prefix,
  className = '',
  containerClassName = '',
	classNameValue = '',
}: PricingProps) {

  return (
    <div className={`flex items-center ${containerClassName}`}>
      {prefix && 
        <span className={className}>{prefix}</span>
      }
      {value !== undefined && 
        <span className={classNameValue}>{value} р</span>
      }
    </div>
  );
}

//Образец использования:
	// <Pricing
	// 	className="text-2xl font-semibold"
	//containerClassName="justify-between"
	// 	value={product.price} 
	// 	prefix="Цена:" 
	// >
	// </Pricing>