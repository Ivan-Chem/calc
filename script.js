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
let isShift = false;
let isAlpha = false;
let memory = 0;

// Состояния калькулятора
const state = {
  shift: false,
  alpha: false,
  hyp: false,
  mode: 'COMP'
};

// Математические функции
const mathMap = {
  'sin(': 'Math.sin(',
  'cos(': 'Math.cos(',
  'tan(': 'Math.tan(',
  'sin⁻¹(': 'Math.asin(',
  'cos⁻¹(': 'Math.acos(',
  'tan⁻¹(': 'Math.atan(',
  'log': 'Math.log10(',
  'ln': 'Math.log(',
  '√(': 'Math.sqrt(',
  '∛(': 'Math.cbrt(',
  '10ˣ': '10**',
  'eˣ': 'Math.exp(',
  'π': 'Math.PI',
  'e': 'Math.E',
  'Rnd': 'Math.round(',
  'Pol(': 'Math.atan2(',
  'Rec(': 'Math.hypot(',
  'nPr': 'permutation(',
  'nCr': 'combination(',
  '∫dx': 'integral(',
  'd/dx': 'derivative(',
  'sinh': 'Math.sinh(',
  'hyp': 'hypMode('
};

function handleSpecialFunctions(value) {
  switch(value) {
    case 'shift':
      state.shift = !state.shift;
      document.querySelector('.shift-indicator').style.visibility = state.shift ? 'visible' : 'hidden';
      return '';
    case 'alpha':
      state.alpha = !state.alpha;
      document.querySelector('.alpha-indicator').style.visibility = state.alpha ? 'visible' : 'hidden';
      return '';
    case 'hyp':
      state.hyp = !state.hyp;
      return '';
    case 'M+':
      memory += parseFloat(display.textContent);
      document.querySelector('.memory-indicator').style.visibility = 'visible';
      return '';
    case 'M-':
      memory -= parseFloat(display.textContent);
      return '';
    case 'RCL':
      return memory.toString();
    default:
      return value;
  }
}

buttons.forEach(button => {
  button.addEventListener('click', async () => {
    let value = button.dataset.value;
    
    // Определение значения с учетом Shift/Alpha
    if (state.shift && button.dataset.shift) {
      value = button.dataset.shift;
      state.shift = false;
      document.querySelector('.shift-indicator').style.visibility = 'hidden';
    }
    if (state.alpha && button.dataset.alpha) {
      value = button.dataset.alpha;
      state.alpha = false;
      document.querySelector('.alpha-indicator').style.visibility = 'hidden';
    }

    // Обработка специальных функций
    const specialValue = handleSpecialFunctions(value);
    if (specialValue !== undefined) value = specialValue;

    // Обработка ввода
    switch(value) {
      case 'AC':
        currentExpression = '';
        break;
      case 'DEL':
        currentExpression = currentExpression.slice(0, -1);
        break;
      case '=':
        try {
          let expr = currentExpression;
          // Замена математических функций
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
  if (num < 0) return -1;
  return num <= 1 ? 1 : num * factorial(num - 1);
}

// Слушатель изменений в Firestore
onSnapshot(calcRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    currentExpression = data.input || '';
    display.textContent = currentExpression || '0';
  }
});