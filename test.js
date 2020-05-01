let candAtt = 'IT P'
    .replace(/ \/ [0-9]+/gm, '')
    .replace(/\.[0-9]+[ ]*$/gm, '')
    .replace(/\.[0-9]+[ ]*[A]{0,2}$/gm, '')
    .replace(/ [AIP]{1}[ ]*$/gm, '');
console.log('!' + candAtt);