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
let memory = 0;

// Подсветка кнопки (анимация как у Casio)
function highlightButton(value) {
  const button = [...buttons].find(btn => btn.dataset.value === value);
  if (button) {
    button.style.backgroundColor = "#ff9500";
    setTimeout(() => {
      button.style.backgroundColor = button.classList.contains("func") ? "#f0f0f0" : "#e0e0e0";
    }, 100);
  }
}

// Обработка научных функций
function handleScientificFunctions(value) {
  switch(value) {
    case "shift":
      isShift = !isShift;
      document.querySelectorAll("[data-shift]").forEach(btn => {
        btn.textContent = isShift ? btn.dataset.shift : btn.dataset.value;
      });
      break;

    case "sin(":
      return isShift ? "sin⁻¹(" : "sin(";

    case "cos(":
      return isShift ? "cos⁻¹(" : "cos(";

    case "tan(":
      return isShift ? "tan⁻¹(" : "tan(";

    case "log":
      return isShift ? "10^" : "log(";

    case "ln":
      return isShift ? "e^" : "ln(";

    case "√(":
      return isShift ? "∛(" : "√(";
  }
  return value;
}

// Основной обработчик
buttons.forEach(button => {
  button.addEventListener("click", async () => {
    let value = button.dataset.value;
    value = handleScientificFunctions(value);
    highlightButton(value);

    // Обработка специальных кнопок
    switch(value) {
      case "AC":
        currentExpression = "";
        display.textContent = "0";
        resultDisplayed = false;
        break;

      case "DEL":
        currentExpression = currentExpression.slice(0, -1);
        display.textContent = currentExpression || "0";
        break;

      case "M+":
        memory += parseFloat(display.textContent);
        break;

      case "RCL":
        currentExpression += memory.toString();
        display.textContent = currentExpression;
        break;

      case "=":
        try {
          const expr = currentExpression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/√/g, "Math.sqrt")
            .replace(/∛/g, "Math.cbrt")
            .replace(/\^/g, "**")
            .replace(/sin/g, "Math.sin")
            .replace(/cos/g, "Math.cos")
            .replace(/tan/g, "Math.tan")
            .replace(/log/g, "Math.log10")
            .replace(/ln/g, "Math.log")
            .replace(/π/g, "Math.PI")
            .replace(/e/g, "Math.E");

          const result = eval(expr);
          currentExpression = result.toString();
          display.textContent = currentExpression;
          resultDisplayed = true;
        } catch {
          display.textContent = "Syntax ERROR";
          currentExpression = "";
        }
        break;

      default:
        currentExpression = resultDisplayed ? value : currentExpression + value;
        display.textContent = currentExpression;
        resultDisplayed = false;
    }

    await updateDoc(calcRef, { 
      input: currentExpression,
      timestamp: new Date().toISOString()
    });
  });
});

// Синхронизация с Firestore
onSnapshot(calcRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    currentExpression = data.input || "";
    display.textContent = currentExpression || "0";
  }
});