// Конфигурация Firebase (ваши данные)
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
firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

// Ссылка на документ Firestore
const calcRef = db.collection("calc").doc("current");

// Элементы интерфейса
const display = document.getElementById("display");
const buttons = document.querySelectorAll("button");

// Переменные для хранения текущего выражения и результата
let currentExpression = "";
let resultDisplayed = false;

// Обработка нажатий кнопок
buttons.forEach(button => {
  button.addEventListener("click", () => {
    const value = button.getAttribute("data-value");

    // Обработка нажатий
    if (value === "=") {
      // Вычисление результата
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
      // Очистка экрана
      display.textContent = "0";
      currentExpression = "";
    } else {
      // Добавление символов к выражению
      if (resultDisplayed) {
        currentExpression = value;
        resultDisplayed = false;
      } else {
        currentExpression += value;
      }
      display.textContent = currentExpression;
    }

    // Синхронизация с Firebase
    calcRef.update({ input: currentExpression });
  });
});

// Синхронизация данных
calcRef.onSnapshot((doc) => {
  const data = doc.data();
  if (data) {
    currentExpression = data.input || "";
    display.textContent = currentExpression || "0";
  }
});