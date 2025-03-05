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
let memory = 0;

// Подсветка кнопки
function highlightButton(value) {
  const button = [...buttons].find(btn => btn.dataset.value === value);
  if (button) {
    button.style.backgroundColor = "#3498db";
    setTimeout(() => {
      button.style.backgroundColor = "";
    }, 200);
  }
}

// Обработка нажатий
buttons.forEach(button => {
  button.addEventListener("click", async () => {
    const value = button.dataset.value;
    highlightButton(value);

    switch (value) {
      case "AC":
        currentExpression = "";
        display.textContent = "0";
        resultDisplayed = false;
        break;

      case "DEL":
        currentExpression = currentExpression.slice(0, -1);
        display.textContent = currentExpression || "0";
        break;

      case "(-)":
        currentExpression = `(-${currentExpression})`;
        display.textContent = currentExpression;
        break;

      case "M+":
        memory += parseFloat(display.textContent);
        break;

      case "=":
        try {
          const expr = currentExpression
            .replace(/×/g, "*")
            .replace(/÷/g, "/")
            .replace(/√/g, "Math.sqrt")
            .replace(/\^/g, "**")
            .replace(/sin\(/g, "Math.sin(")
            .replace(/cos\(/g, "Math.cos(")
            .replace(/tan\(/g, "Math.tan(");

          const result = eval(expr);
          currentExpression = result.toString();
          display.textContent = currentExpression;
          resultDisplayed = true;
        } catch {
          display.textContent = "Ошибка";
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

// Синхронизация
onSnapshot(calcRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    currentExpression = data.input || "";
    display.textContent = currentExpression || "0";
    
    if (data.input) {
      const lastChar = data.input.slice(-1);
      highlightButton(lastChar);
    }
  }
});