// ... предыдущий код ...

// Обработка памяти
function handleMemory(value) {
  switch(value) {
    case "M+":
      memory += parseFloat(display.textContent);
      break;
    case "M-":
      memory -= parseFloat(display.textContent);
      break;
    case "MR":
      currentExpression += memory.toString();
      display.textContent = currentExpression;
      break;
    case "MC":
      memory = 0;
      break;
  }
}

buttons.forEach(button => {
  button.addEventListener("click", async () => {
    // ... предыдущий код ...

    // Обработка памяти
    if (["M+", "M-", "MR", "MC"].includes(value)) {
      handleMemory(value);
    }

    // ... остальной код ...
  });
});
