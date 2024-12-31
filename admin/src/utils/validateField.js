export const VND = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
});


// export const convertToNumber = (formattedValue) => {
//   const numericValue = Number(formattedValue.replace(/[^\d.-]/g, ''));

//   return numericValue;
// };
export const convertToNumber=new Intl.NumberFormat();