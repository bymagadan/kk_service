document.querySelectorAll('.operator').forEach(operator => {
    operator.addEventListener('click', function () {
        document.querySelectorAll('.operator').forEach(op => op.classList.remove('selected'));
        this.classList.add('selected');
        document.getElementById('selected-operator').value = this.getAttribute('data-operator');
    });
});

document.getElementById('amount-rub').addEventListener('input', async function () {
    const rubAmount = this.value;
    if (rubAmount > 0) {
        try {
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=tether&vs_currencies=rub');
            const data = await response.json();
            const rate = data.tether.rub;
            const usdtAmount = (rubAmount / rate).toFixed(2);
            document.getElementById('amount-usdt').value = usdtAmount;
        } catch (error) {
            console.error('Ошибка получения курса:', error);
        }
    } else {
        document.getElementById('amount-usdt').value = '';
    }
});

document.getElementById('next-button').addEventListener('click', function () {
    const operator = document.getElementById('selected-operator').value;
    const phoneNumber = document.getElementById('phone-number').value;
    const rubAmount = document.getElementById('amount-rub').value;
    const usdtAmount = document.getElementById('amount-usdt').value;

    if (!operator || !phoneNumber || !rubAmount || !usdtAmount) {
        alert('Пожалуйста, заполните все поля!');
        return;
    }

    localStorage.setItem('operator', operator);
    localStorage.setItem('usdtAmount', usdtAmount);
    window.location.href = 'oplata.html';
});

// Проверка платежа на странице оплаты
if (window.location.pathname.includes('oplata.html')) {
    document.getElementById('payment-amount').textContent = localStorage.getItem('usdtAmount');

    async function checkPayment() {
        const wallet = 'TPXXXXXXXXXXXXXXX';
        try {
            const response = await fetch(`https://apilist.tronscan.org/api/account?address=${wallet}`);
            const data = await response.json();
            const transactions = data.trc20token_transfers;

            const amount = parseFloat(localStorage.getItem('usdtAmount'));
            const found = transactions.find(tx => 
                tx.to_address === wallet &&
                parseFloat(tx.amount_str) / Math.pow(10, 6) === amount
            );

            if (found) {
                document.getElementById('status').textContent = 'Заявка в процессе оплаты';
                clearInterval(paymentCheck);
            }
        } catch (error) {
            console.error('Ошибка проверки платежа:', error);
        }
    }

    const paymentCheck = setInterval(checkPayment, 15000);
}
