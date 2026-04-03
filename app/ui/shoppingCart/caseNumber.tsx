//функция для установки падежа "товар" в корзине


export default function CaseNumber({qty}: { qty: number}) {
    const cases = ['товар', 'товара', 'товаров'];
    let title = '';
    const digit = qty % 10;


    if(qty > 10 && qty < 20) {
        title = cases[2];
    }
    if(digit === 1) {
        title = cases[0];
    }
    if(digit > 1 && qty < 5) {
        title = cases[1]
    } else {
        title = cases[2]
    }
    
    return (
        <>
         В корзине {qty} {title} <br />
        </>
    )
}

