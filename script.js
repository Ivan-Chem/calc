// Начало файла script.js
// Вставьте свои данные из Firebase здесь!
const firebaseConfig = {

  apiKey: "AIzaSyA9Lw68k8CFaUuzXFLwznF-Roya3zAhkRA",

  authDomain: "synccalc.firebaseapp.com",

  projectId: "synccalc",

  storageBucket: "synccalc.firebasestorage.app",

  messagingSenderId: "652185025907",

  appId: "1:652185025907:web:c0cedf5f663371c97c5906",

  measurementId: "G-DB5Z4QYRH6"

};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();

// Создание кнопок калькулятора
const buttons = [
    '7', '8', '9', '÷', 
    '4', '5', '6', '×', 
    '1', '2', '3', '-', 
    '0', '.', '=', '+'
];

const container = document.querySelector('.calculator');
buttons.forEach(btn => {
    const button = document.createElement('button');
    button.textContent = btn;
    button.onclick = () => handleButton(btn);
    container.appendChild(button);
});

// Синхронизация
db.ref('calc').on('value', (snapshot) => {
    const data = snapshot.val();
    document.getElementById('expression').textContent = data.expression || '';
    document.getElementById('result').textContent = data.result || '0';
});

function handleButton(value) {
    const button = event.target;
    button.classList.add('active');
    setTimeout(() => button.classList.remove('active'), 200);

    db.ref('calc').transaction(data => {
        // Логика вычислений
        if (value === '=') {
            try {
                data.result = eval(data.expression.replace(/×/g, '*').replace(/÷/g, '/'));
                data.expression = '';
            } catch {
                data.result = 'Error';
            }
        } else {
            data.expression = (data.expression || '') + value;
        }
        return data;
    });
}
// Конец файла script.js