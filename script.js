import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  updateDoc, 
  onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyA9Lw68k8CFaUuzXFLwznF-Roya3zAhkRA",
  authDomain: "synccalc.firebaseapp.com",
  projectId: "synccalc",
  storageBucket: "synccalc.firebasestorage.app",
  messagingSenderId: "652185025907",
  appId: "1:652185025907:web:c0cedf5f663371c97c5906",
  measurementId: "G-DB5Z4QYRH6"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const calcRef = doc(db, "calc", "current");

const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");
let currentExpression = "";
let resultDisplayed = false;
let state = {
  shift: false,
  alpha: false,
  hyp: false,
  memory: 0
};

const mathMap = {
  'sin(': 'Math.sin(',
  'cos(': 'Math.cos(',
  'tan(': 'Math.tan(',
  'sin⁻¹(': 'Math.asin(',
  'cos⁻¹(': 'Math.acos(',
  'tan⁻¹(': 'Math.atan(',
  '√(': 'Math.sqrt(',
  '∛': 'Math.cbrt(',
  'log': 'Math.log10(',
  'ln': 'Math.log(',
  'π': 'Math.PI',
  'eˣ': 'Math.exp(',
  '10ˣ': '10**',
  'Rnd': 'Math.round(',
  'Pol(': 'Math.atan2(',
  'Rec(': 'Math.hypot(',
  'nPr': 'permutation(',
  'nCr': 'combination('
};

buttons.forEach(button => {
  button.addEventListener('click', async () => {
    let value = button.dataset.value;
    let shiftValue = button.dataset.shift;

    // Обработка состояний
    if (value === 'shift') {
      state.shift = !state.shift;
      document.querySelector('.shift-indicator').classList.toggle('visible', state.shift);
      return;
    }
    
    if (state.shift && shiftValue) {
      value = shiftValue;
      state.shift = false;
      document.querySelector('.shift-indicator').classList.remove('visible');
    }

    // Обработка специальных кнопок
    switch(value) {
      case 'AC':
        currentExpression = '';
        break;
      case 'DEL':
        currentExpression = currentExpression.slice(0, -1);
        break;
      case 'M+':
        state.memory += parseFloat(display.textContent);
        document.querySelector('.memory-indicator').classList.add('visible');
        break;
      case 'M-':
        state.memory -= parseFloat(display.textContent);
        break;
      case 'RCL':
        currentExpression += state.memory;
        break;
      case '=':
        try {
          let expr = currentExpression.replace(/×/g, '*').replace(/÷/g, '/');
          Object.entries(mathMap).forEach(([key, val]) => {
            expr = expr.replace(new RegExp(key, 'g'), val);
          });
          currentExpression = eval(expr).toString();
        } catch {
          currentExpression = 'Error';
        }
        break;
      default:
        currentExpression += mathMap[value] || value;
    }

    // Обновление дисплея
    display.textContent = currentExpression || '0';

    // Синхронизация с Firebase
    await updateDoc(calcRef, {
      input: currentExpression,
      timestamp: new Date().toISOString()
    });
  });
});

// Математические функции
function combination(n, k) {
  return factorial(n) / (factorial(k) * factorial(n - k));
}

function permutation(n, k) {
  return factorial(n) / factorial(n - k);
}

function factorial(num) {
  return num <= 1 ? 1 : num * factorial(num - 1);
}

// Синхронизация
onSnapshot(calcRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    currentExpression = data.input || '';
    display.textContent = currentExpression || '0';
  }
});