// Переменная для кнопки рестарта
const restart = document.querySelector('#restart');
restart.addEventListener('click', () => {
  location.reload();
});

// Кнопка «1000 игр»
const simulateBtn = document.querySelector('#simulate1000');
simulateBtn.addEventListener('click', runSimulation);

// Переменные для отслеживания результатов
let numberWin = 0;
let numberLoss = 0;
let probability = 0;

// Доступ к канвасу
const canvas = document.getElementById('myCanvas');
const context = canvas.getContext('2d');

// HTML-элементы для записи сообщений и статистики
const stats = document.getElementById('status');
const winEl = document.getElementById('win');
const lossEl = document.getElementById('loss');
const ratioEl = document.getElementById('ratio');

stats.innerHTML = 'Выбери дверь.';
winEl.innerHTML = numberWin;
lossEl.innerHTML = numberLoss;
ratioEl.innerHTML = (probability * 100).toFixed(1);

// Создаем переменные изображений
let CloseDoor = new Image();
let OpenDoor = new Image();
let Check = new Image();
let Goat = new Image();
let Car = new Image();

CloseDoor.src = 'img/closeddoor.jpg';
OpenDoor.src = 'img/opendoor.png';
Check.src = 'img/check.png';
Goat.src = 'img/goat.png';
Car.src = 'img/car.png';

// Флаг: все картинки загружены?
let imagesLoaded = 0;
const totalImages = 5;

[CloseDoor, OpenDoor, Check, Goat, Car].forEach(img => {
  img.onload = () => {
    imagesLoaded++;
    if (imagesLoaded === totalImages) {
      // Когда все картинки загрузились — рисуем закрытые двери
      context.drawImage(CloseDoor, 0, 0, 200, 360);
      context.drawImage(CloseDoor, 200, 0, 200, 360);
      context.drawImage(CloseDoor, 400, 0, 200, 360);
    }
  };
});

// Случайный выбор дверей для автомобиля и коз
let carDoor = Math.floor(Math.random() * 3);
let goatDoors = [];
let i = -1;
while (++i < 3) {
  if (i !== carDoor) {
    goatDoors.push(i);
  }
}

// Инициализация переменных для различных этапов программы
let doors = [false, false, false]; // Открытые двери
let position = 0; // Состояние игры: -1 — игра завершена/сброс, 0 — выбор двери, 1 — выбор «остаться/поменяться»
let check = 0; // Первая выбранная дверь
let openDoor = 0; // Дверь, которую открывает ведущий

// Обработчик щелчка по элементам канваса
canvas.addEventListener('click', (event) => {
  // Не обрабатываем клики, пока картинки не загружены
  if (imagesLoaded < totalImages) return;

  const rect = canvas.getBoundingClientRect();
  const x = event.pageX - rect.left;
  const y = event.pageY - rect.top;

  if (position === -1) {
    // Сброс игры. Начальные установки
    doors = [false, false, false];
    check = 0;
    openDoor = 0;
    carDoor = Math.floor(Math.random() * 3);
    goatDoors = [];
    i = -1;
    while (++i < 3) {
      if (i !== carDoor) {
        goatDoors.push(i);
      }
    }
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(Car, carDoor * 200 + 50, 200, 120, 80);
    goatDoors.forEach(function (d) {
      context.drawImage(Goat, d * 200 + 75, 180, 101, 100);
    });
    context.drawImage(CloseDoor, 0, 0, 200, 360);
    context.drawImage(CloseDoor, 200, 0, 200, 360);
    context.drawImage(CloseDoor, 400, 0, 200, 360);
    stats.innerHTML = 'Выбери дверь.';
    ++position;
    return;
  }

  if (position === 0) {
    // Проверка нажатой двери
    check = -1;
    if (x >= 0 && x < 200) check = 0;
    else if (x >= 200 && x < 400) check = 1;
    else if (x >= 400 && x < 600) check = 2;

    if (check === -1) return; // клик мимо дверей

    // Ведущий открывает одну из оставшихся дверей с козой
    openDoor = Math.floor(Math.random() * 3);
    while (openDoor === check || openDoor === carDoor) {
      openDoor = Math.floor(Math.random() * 3);
    }
    doors[openDoor] = true;

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(Car, carDoor * 200 + 50, 200, 120, 80);
    goatDoors.forEach(function (d) {
      context.drawImage(Goat, d * 200 + 75, 180, 101, 100);
    });
    weDrawDoors(-1);
    context.drawImage(Check, check * 200 + 50, 50, 50, 50);

    stats.innerHTML = 'Ты будешь менять дверь? Кликни по нужной двери.';
    ++position;
    return;
  }

  // position > 0: игрок выбирает финальную дверь
  let finalChoice = -1;
  if (x >= 0 && x < 200) finalChoice = 0;
  else if (x >= 200 && x < 400) finalChoice = 1;
  else if (x >= 400 && x < 600) finalChoice = 2;

  if (finalChoice === -1) return; // клик мимо дверей

  doors[finalChoice] = true;
  context.clearRect(0, 0, canvas.width, canvas.height);
  context.drawImage(Car, carDoor * 200 + 50, 200, 140, 120);
  goatDoors.forEach(function (d) {
    context.drawImage(Goat, d * 200 + 75, 180, 120, 120);
  });
  weDrawDoors(-1);
  context.drawImage(Check, check * 200 + 50, 50, 50, 50);

  if (finalChoice === carDoor) {
    ++numberWin;
    stats.innerHTML = 'Ты выиграл!';
  } else {
    ++numberLoss;
    stats.innerHTML = 'Проигрыш';
  }

  probability = numberWin / (numberWin + numberLoss || 1); // защита от деления на 0

  winEl.innerHTML = numberWin;
  lossEl.innerHTML = numberLoss;
  ratioEl.innerHTML = (probability * 100).toFixed(1);

  position = -1; // игра завершена
}, false);

// Функция отрисовки дверей (открытые/закрытые)
function weDrawDoors(startI) {
  let i = startI;
  while (++i < 3) {
    if (!doors[i]) {
      context.drawImage(CloseDoor, i * 200, 0, 200, 360);
    } else {
      context.drawImage(OpenDoor, i * 200 - 2, 0, 212, 370);
    }
  }
}

// --- СИМУЛЯЦИЯ 1000 ИГР ---
function runSimulation() {
  const trials = 1000;
  let simWin = 0;
  let simLoss = 0;

  for (let t = 0; t < trials; t++) {
    const car = Math.floor(Math.random() * 3);
    const firstChoice = Math.floor(Math.random() * 3);

    // Ведущий открывает дверь с козой, отличную от выбора игрока и машины
    let opened = Math.floor(Math.random() * 3);
    while (opened === firstChoice || opened === car) {
      opened = Math.floor(Math.random() * 3);
    }

    // Игрок всегда меняет дверь (это и показывает парадокс)
    let finalChoice = firstChoice;
    for (let d = 0; d < 3; d++) {
      if (d !== firstChoice && d !== opened) {
        finalChoice = d;
        break;
      }
    }

    if (finalChoice === car) simWin++;
    else simLoss++;
  }

  // Обновляем общую статистику (добавляем к текущей)
  numberWin += simWin;
  numberLoss += simLoss;
  probability = numberWin / (numberWin + numberLoss || 1);

  winEl.innerHTML = numberWin;
  lossEl.innerHTML = numberLoss;
  ratioEl.innerHTML = (probability * 100).toFixed(1);

  stats.innerHTML = `Авто-симуляция: ${simWin} побед, ${simLoss} проигрышей (всего ${trials} игр). Общая вероятность: ${(probability * 100).toFixed(1)}%`;
}
