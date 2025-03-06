// Остается прежним, но с добавлением обработки индикаторов:

// В обработчике кнопки M+
case "M+":
  memory += parseFloat(display.textContent);
  document.querySelector('.memory-indicator').style.visibility = memory ? 'visible' : 'hidden';
  break;

// В обработчике SHIFT
case "shift":
  isShift = !isShift;
  document.querySelector('.shift-indicator').style.visibility = isShift ? 'visible' : 'hidden';
  // Остальная логика...
  break;

// Добавить в CSS:
.memory-indicator,
.shift-indicator {
  visibility: hidden;
}