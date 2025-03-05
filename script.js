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

// Функция для подсветки кнопки
function highlightButton(value) {
  const button = [...buttons].find(btn => btn.dataset.value === value);
  if (button) {
    button.style.backgroundColor = "#666";
    setTimeout(() => {
      button.style.backgroundColor = "#444";
    }, 300);
  }
}

buttons.forEach(button => {
  button.addEventListener("click", async () => {
    const value = button.dataset.value;
    
    // Подсветка нажатой кнопки
    highlightButton(value);

    if (value === "=") {
      try {
        const result = eval(currentExpression);
        currentExpression = result.toString();
        display.textContent = currentExpression;
        resultDisplayed = true;
      } catch {
        display.textContent = "Ошибка";
        currentExpression = "";
      }
    } else if (value === "C") {
      currentExpression = "";
      display.textContent = "0";
      resultDisplayed = false;
    } else {
      currentExpression = resultDisplayed ? value : currentExpression + value;
      display.textContent = currentExpression;
      resultDisplayed = false;
    }

    try {
      await updateDoc(calcRef, {
        input: currentExpression,
        timestamp: new Date().toISOString() // Для принудительного обновления
      });
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
    }
  });
});

// Слушатель изменений в Firestore
onSnapshot(calcRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    currentExpression = data.input || "";
    display.textContent = currentExpression || "0";
    
    // Подсветка последней нажатой кнопки
    if (data.input && data.input.length > 0) {
      const lastChar = data.input.slice(-1);
      highlightButton(lastChar);
    }
  }
});