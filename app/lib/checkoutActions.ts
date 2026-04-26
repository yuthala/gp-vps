import { checkoutInfo }from '@/app/lib/definitions'



/**
 * Делает update данных checkout в local storage по ключу checkoutInfo, принимает объект с нужными значениями свойств объекта с типом checkoutInfo и записывает в local storage
 */
export function updateCheckoutInfo(checkoutInfo: checkoutInfo) {
	if (typeof window !== 'undefined') {
	localStorage.setItem('checkoutInfo', JSON.stringify(checkoutInfo))
	}
}

/**
 * Получить данные checkout из local storage
 * 
 * @returns Возвращает объект с типом checkoutInfo из local storage по ключу checkoutInfo или создаёт новый если в local starage нет объекта
 */
export const getCheckoutInfo = () => {
			const savedCheoutInfo = localStorage.getItem('checkoutInfo');
			if (savedCheoutInfo) {
				const parsed: checkoutInfo = JSON.parse(savedCheoutInfo);
				return parsed
			} else {
				return {
				goodsTotalPrice:  0,
				deliveryPrice: "", 
				userName: "",
				userSecondName: "",
				e_mail: "",
				phoneNumber: "",
				userComments: "",
				deliveryPointID: "",
				deliveryPointAdress: ""
				};
			}
}