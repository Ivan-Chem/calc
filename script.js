import { initializeApp } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-app.js";
import { getFirestore, doc, updateDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.1.0/firebase-firestore.js";

// Конфигурация Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA9Lw68k8CFaUuzXFLwznF-Roya3zAhkRA",
  authDomain: "synccalc.firebaseapp.com",
  projectId: "synccalc",
  storageBucket: "synccalc.firebasestorage.app",
  messagingSenderId: "652185025907",
  appId: "1:652185025907:web:c0cedf5f663371c97c5906",
  measurementId: "G-DB5Z4QYRH6"
};

// Инициализация Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Ссылка на документ Firestore
const calcRef = doc(db, "calc", "current");

// Элементы интерфейса
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

// Переменные для хранения текущего выражения и результата
let currentExpression = "";
let resultDisplayed = false;

// Обработка нажатий кнопок
buttons.forEach(button => {
  button.addEventListener("click", async () => {
    const value = button.getAttribute("data-value");

    // Обработка нажатий
    if (value === "=") {
      try {
        const result = eval(currentExpression);
        display.textContent = result;
        currentExpression = result.toString();
        resultDisplayed = true;
      } catch (error) {
        display.textContent = "Ошибка";
        currentExpression = "";
      }
    } else if (value === "C") {
      display.textContent = "0";
      currentExpression = "";
    } else {
      if (resultDisplayed) {
        currentExpression = value;
        resultDisplayed = false;
      } else {
        currentExpression += value;
      }
      display.textContent = currentExpression;
    }

    // Синхронизация с Firebase
    try {
      await updateDoc(calcRef, { input: currentExpression });
      console.log("Данные обновлены!");
    } catch (error) {
      console.error("Ошибка синхронизации:", error);
    }
  });
});

// Синхронизация данных
onSnapshot(calcRef, (doc) => {
  if (doc.exists()) {
    const data = doc.data();
    currentExpression = data.input || "";
    display.textContent = currentExpression || "0";
  } else {
    console.log("Документ не найден!");
  }
});