//функция для установки падежа "товар" в корзине


export default function CaseNumber({qty}: { qty: number}) {
    const cases = ['товар', 'товара', 'товаров'];
    let title = '';
    const digit = qty % 10;

     if(qty === 0) {
        title = cases[0];
        console.log('zero title', title)
    }

    if(qty > 10 && qty < 20) {
        title = cases[2];
    }

   
    if(digit === 1) {
        title = cases[0];
        console.log('one title', title)
    }
    if(digit > 1 && qty < 5) {
        title = cases[1]
    } else {
        //title = cases[2]
    }

    console.log('qty = ', qty, 'title = ', title)
    
    return (
        <>
         В корзине {qty} {title} <br />
        </>
    )
}

