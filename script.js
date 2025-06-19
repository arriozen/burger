let gameState = {
  money: 0,
  exp: 0,
  level: 1,
  inventory: [],
  burger: [],
  reviews: [],
  goldenMode: false,
  goldenTimeout: null,
  clickMultiplier: 1,
  clickUpgrade: 0,
  sauceUpgrade: 0,
  workerUpgrade: 0,
  singularityMode: false,
  clickCount: 0
};

if (localStorage.getItem('burgerGame')) {
  const savedState = JSON.parse(localStorage.getItem('burgerGame'));
  gameState = {
    ...gameState,
    ...savedState,
    money: savedState.money || 0,
    exp: savedState.exp || 0,
    level: savedState.level || 1,
    inventory: savedState.inventory || [],
    burger: savedState.burger || [],
    reviews: savedState.reviews || [],
    clickMultiplier: savedState.clickMultiplier || 1,
    clickUpgrade: savedState.clickUpgrade || 0,
    sauceUpgrade: savedState.sauceUpgrade || 0,
    workerUpgrade: savedState.workerUpgrade || 0,
    singularityMode: savedState.singularityMode || false,
    clickCount: savedState.clickCount || 0
  };
}

const ingredients = [
  { name: 'BreadDown', display: 'Нижняя булка', cost: 50, level: 1 },
  { name: 'BreadUp', display: 'Верхняя булка', cost: 50, level: 1 },
  { name: 'Meat', display: 'Котлета', cost: 100, level: 1 },
  { name: 'Tomato', display: 'Помидор', cost: 30, level: 3 },
  { name: 'Cheese', display: 'Сыр', cost: 40, level: 4 },
  { name: 'Ketchup', display: 'Кетчуп', cost: 20, level: 6 },
  { name: 'Mustard', display: 'Горчица', cost: 20, level: 6 },
  { name: 'Onion', display: 'Лук', cost: 30, level: 8 },
  { name: 'Cucumber', display: 'Огурец', cost: 30, level: 8 }
];

const upgrades = [
  { name: 'click', display: 'Клик', desc: '+1 монета за клик', level: 2, cost: level => 100 * level ** 2 },
  { name: 'sauce', display: 'Соусы', desc: '+1 EXP за 10 кликов', level: 4, cost: level => 200 * level ** 2 },
  { name: 'worker', display: 'Сотрудник', desc: 'Автоклик каждые 2 сек', level: 6, cost: level => 500 * level ** 2 },
  { name: 'singularity', display: 'Бургерная сингулярность', desc: 'Секрет', level: 10, cost: () => 5000, oneTime: true }
];

function updateUI() {
  document.getElementById('money').textContent = Math.floor(gameState.money);
  const expNeeded = gameState.level * 100;
  document.getElementById('exp').textContent = `${Math.floor(gameState.exp)}/${expNeeded}`;
  document.getElementById('exp-progress').style.width = `${(gameState.exp / expNeeded) * 100}%`;

  const inventory = document.getElementById('inventory');
  inventory.innerHTML = '';
  gameState.inventory.forEach(item => {
    const div = document.createElement('div');
    div.classList.add('inventory-item');
    const img = document.createElement('img');
    img.src = `Burger/${item.name}.png`;
    img.classList.add('ingredient');
    img.alt = item.name;
    img.onclick = () => addToBurger(item.name);
    img.dataset.count = item.count;
    const count = document.createElement('span');
    count.classList.add('ingredient-count');
    count.textContent = `x${item.count}`;
    div.appendChild(img);
    div.appendChild(count);
    inventory.appendChild(div);
  });

  const shop = document.getElementById('shop');
  shop.innerHTML = '';
  ingredients.forEach(ing => {
    const div = document.createElement('div');
    div.classList.add('shop-item');
    const img = document.createElement('img');
    img.src = `Burger/${ing.name}.png`;
    img.alt = ing.display;
    const p = document.createElement('p');
    const button = document.createElement('button');
    button.textContent = 'Купить';
    button.onclick = () => buyIngredient(ing.name, ing.cost);
    if (gameState.level >= ing.level) {
      p.textContent = `${ing.display} (${ing.cost} монет)`;
    } else {
      p.textContent = `${ing.display} (с уровня ${ing.level})`;
      button.disabled = true;
    }
    div.appendChild(img);
    div.appendChild(p);
    div.appendChild(button);
    shop.appendChild(div);
  });

  const upgradesDiv = document.getElementById('upgrades');
  upgradesDiv.innerHTML = '';
  upgrades.forEach(upg => {
    const div = document.createElement('div');
    div.classList.add('upgrade-item');
    const p = document.createElement('p');
    const button = document.createElement('button');
    const cost = upg.oneTime ? upg.cost() : upg.cost(gameState[upg.name + 'Upgrade'] + 1);
    button.textContent = upg.oneTime && gameState.singularityMode ? 'Переключить' : `Купить (${cost} монет)`;
    button.onclick = () => buyUpgrade(upg.name);
    if (gameState.level >= upg.level) {
      p.textContent = `${upg.display} (ур. ${gameState[upg.name + 'Upgrade'] || 0}): ${upg.desc}`;
    } else {
      p.textContent = `${upg.display} (с уровня ${upg.level}): ${upg.desc}`;
      button.disabled = true;
    }
    div.appendChild(p);
    div.appendChild(button);
    upgradesDiv.appendChild(div);
  });

  document.body.classList.toggle('singularity', gameState.singularityMode);
  localStorage.setItem('burgerGame', JSON.stringify(gameState));
}

const burger = document.getElementById('clicker-burger');
const coinContainer = document.getElementById('coin-container');
const clickSound = document.getElementById('click-sound');
const bgMusic = document.getElementById('bg-music');
const hewingSound = document.getElementById('hewing-sound');
const musicToggle = document.getElementById('music-toggle');
const easterEgg = document.getElementById('easter-egg');
let musicStarted = false;

bgMusic.volume = 0.02;

function startMusic() {
  if (!musicStarted) {
    bgMusic.play();
    musicToggle.textContent = '🔊 Музыка: Вкл';
    musicStarted = true;
  }
}

musicToggle.addEventListener('click', () => {
  if (bgMusic.paused) {
    bgMusic.play();
    musicToggle.textContent = '🔊 Музыка: Вкл';
  } else {
    bgMusic.pause();
    musicToggle.textContent = '🔇 Музыка: Выкл';
  }
});

easterEgg.addEventListener('click', () => {
  gameState.money += 10000;
  gameState.level = Math.max(gameState.level, 10);
  gameState.exp = Math.max(gameState.exp, 1000);
  showModal('Пасхалка!', 'Вы нашли секрет! +10000 монет и 10 уровень!', '');
  updateUI();
});

burger.addEventListener('click', () => {
  startMusic();
  gameState.clickCount++;
  const earnings = (gameState.clickMultiplier + gameState.clickUpgrade) * (gameState.goldenMode ? 10 : 1);
  gameState.money += earnings;
  clickSound.play();
  
  if (!gameState.goldenMode && Math.random() < 0.03) {
    activateGoldenMode();
  }
  
  if (gameState.sauceUpgrade > 0 && gameState.clickCount % 10 === 0) {
    gameState.exp += gameState.sauceUpgrade;
  }
  
  createCoin();
  updateUI();
});

function createCoin() {
  const coin = document.createElement('div');
  coin.classList.add('coin');
  coin.textContent = '$';
  const rect = burger.getBoundingClientRect();
  coin.style.left = `${rect.left + rect.width / 2}px`;
  coin.style.top = `${rect.top + rect.height / 2}px`;
  const angle = Math.random() * 360;
  const distance = 100 + Math.random() * 100;
  const dx = Math.cos(angle * Math.PI / 180) * distance;
  const dy = 200 + Math.random() * 100;
  coin.style.setProperty('--dx', `${dx}px`);
  coin.style.setProperty('--dy', `${dy}px`);
  coinContainer.appendChild(coin);
  setTimeout(() => coin.remove(), 2000);
}

function createSpark() {
  const spark = document.createElement('div');
  spark.classList.add('spark');
  const rect = burger.getBoundingClientRect();
  spark.style.left = `${rect.left + rect.width / 2}px`;
  spark.style.top = `${rect.top + rect.height / 2}px`;
  const angle = Math.random() * 360;
  const distance = 20 + Math.random() * 30;
  const dx = Math.cos(angle * Math.PI / 180) * distance;
  const dy = Math.sin(angle * Math.PI / 180) * distance;
  spark.style.setProperty('--dx', `${dx}px`);
  spark.style.setProperty('--dy', `${dy}px`);
  coinContainer.appendChild(spark);
  setTimeout(() => spark.remove(), 500);
}

function activateGoldenMode() {
  gameState.goldenMode = true;
  burger.classList.add('golden');
  for (let i = 0; i < 5; i++) setTimeout(createSpark, i * 100);
  gameState.goldenTimeout = setTimeout(() => {
    gameState.goldenMode = false;
    burger.classList.remove('golden');
    clearTimeout(gameState.goldenTimeout);
  }, 10000);
  showModal('Золотой бургер!', 'x10 монет за клик на 10 секунд!', '');
}

function buyIngredient(name, cost) {
  if (gameState.money >= cost) {
    gameState.money -= cost;
    const existing = gameState.inventory.find(item => item.name === name);
    if (existing) {
      existing.count += 1;
    } else {
      gameState.inventory.push({ name, count: 1 });
    }
    updateUI();
  } else {
    showModal('Ошибка', 'Недостаточно монет!', '');
  }
}

function buyUpgrade(name) {
  const upg = upgrades.find(u => u.name === name);
  if (upg.oneTime && gameState.singularityMode) {
    gameState.singularityMode = !gameState.singularityMode;
    updateUI();
    return;
  }
  const cost = upg.oneTime ? upg.cost() : upg.cost(gameState[name + 'Upgrade'] + 1);
  if (gameState.level >= upg.level && gameState.money >= cost) {
    gameState.money -= cost;
    if (!upg.oneTime) {
      gameState[name + 'Upgrade']++;
    } else {
      gameState.singularityMode = true;
    }
    updateUI();
  } else {
    showModal('Ошибка', gameState.level < upg.level ? `Доступно с уровня ${upg.level}` : 'Недостаточно монет!', '');
  }
}

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(tab.dataset.tab).classList.add('active');
  });
});

function addToBurger(name) {
  const item = gameState.inventory.find(i => i.name === name);
  if (item && item.count > 0) {
    item.count -= 1;
    gameState.burger.push(name);
    const plate = document.getElementById('plate');
    const clone = document.createElement('img');
    clone.src = `Burger/${item.name}.png`;
    clone.classList.add('stacked');
    clone.alt = item.name;
    const offset = (gameState.burger.length - 1) * 10;
    clone.style.bottom = `${offset}px`;
    clone.style.left = '50%';
    clone.style.transform = 'translateX(-50%) rotateX(25deg)';
    plate.appendChild(clone);
    if (item.count === 0) {
      gameState.inventory = gameState.inventory.filter(i => i.count > 0);
    }
    updateUI();
  }
}

function showModal(title, review, rewards) {
  document.getElementById('modal-title').textContent = title;
  document.getElementById('modal-review').textContent = review;
  document.getElementById('modal-rewards').textContent = rewards;
  document.getElementById('modal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('modal').style.display = 'none';
}

function resetGame() {
  if (confirm('Вы уверены, что хотите сбросить игру? Все прогресс будет потерян!')) {
    localStorage.removeItem('burgerGame');
    gameState = {
      money: 0,
      exp: 0,
      level: 1,
      inventory: [],
      burger: [],
      reviews: [],
      goldenMode: false,
      goldenTimeout: null,
      clickMultiplier: 1,
      clickUpgrade: 0,
      sauceUpgrade: 0,
      workerUpgrade: 0,
      singularityMode: false,
      clickCount: 0
    };
    bgMusic.pause();
    bgMusic.currentTime = 0;
    musicStarted = false;
    musicToggle.textContent = '🔇 Музыка: Выкл';
    updateUI();
  }
}

async function evaluateBurger() {
  if (gameState.burger.length === 0) {
    showModal('Ошибка', 'Бургер пустой!', '');
    return;
  }

  const btn = document.querySelector('.evaluate-btn');
  btn.disabled = true;
  const plate = document.getElementById('plate');
  document.getElementById('result').textContent = 'Идет оценка бургера...';
  const spinner = document.createElement('div');
  spinner.classList.add('spinner');
  btn.after(spinner);

  const radius = 60;
  const ingredientSpinners = [];
  const numPoints = 9;
  const ingredientsToShow = gameState.burger.length > numPoints 
    ? gameState.burger.slice(0, numPoints) 
    : [...gameState.burger, ...Array(numPoints - gameState.burger.length).fill(gameState.burger[0] || 'BreadDown')];

  const spinnerContainer = document.createElement('div');
  spinnerContainer.classList.add('spinner-container');
  plate.appendChild(spinnerContainer);

  ingredientsToShow.forEach((name, i) => {
    const angle = (i / numPoints) * 2 * Math.PI;
    const img = document.createElement('img');
    img.src = `Burger/${name}.png`;
    img.classList.add('ingredient-spinner');
    img.style.setProperty('--angle', `${angle}rad`);
    img.style.setProperty('--radius', `${radius}px`);
    spinnerContainer.appendChild(img);
    ingredientSpinners.push(img);
  });

  hewingSound.play();
  await new Promise(resolve => setTimeout(resolve, 3000));
  hewingSound.pause();
  hewingSound.currentTime = 0;
  spinnerContainer.remove();

  let score = 0;
  const hasBreadDown = gameState.burger.includes('BreadDown');
  const hasBreadUp = gameState.burger.includes('BreadUp');
  const hasMeat = gameState.burger.includes('Meat');
  const hasCheese = gameState.burger.includes('Cheese');
  const hasTomato = gameState.burger.includes('Tomato');
  const hasCucumber = gameState.burger.includes('Cucumber');
  const hasOnion = gameState.burger.includes('Onion');
  const hasKetchup = gameState.burger.includes('Ketchup');
  const hasMustard = gameState.burger.includes('Mustard');
  const veggieCount = [hasTomato, hasCucumber, hasOnion].filter(Boolean).length;

  if (hasBreadDown && hasBreadUp) score += 2;
  if (hasMeat) score += 2;
  if (hasCheese) score += 1;
  if (veggieCount === 1) score += 1;
  if (hasKetchup && hasMustard) score -= 1;
  if (gameState.burger.length > 7) score -= 1;
  if (hasBreadDown && gameState.burger.indexOf('BreadDown') !== 0) score -= 1;
  if (hasBreadUp && gameState.burger.indexOf('BreadUp') !== gameState.burger.length - 1) score -= 1;

  score = Math.max(1, Math.min(5, score));
  const moneyEarned = score * 10;
  gameState.money += moneyEarned;
  gameState.exp += score * 10;

  while (gameState.exp >= gameState.level * 100) {
    gameState.level += 1;
    showModal('Новый уровень!', `Вы достигли уровня ${gameState.level}!`, '');
  }

  const reviews = [
    `Ого, ${score} звёзд! Этот бургер достоин Michelin!`,
    `Хм, ${score} звёзд. Котлета топ, но овощей маловато!`,
    `${score} звёзд. Кетчуп с горчицей? Смелый выбор!`,
    `${score} звёзд. Неплохо, но я бы добавил трюфельное масло!`,
    `Вау, ${score} звёзд! Это бургер для богов!`,
    `${score} звёзд. Чуть больше лука, и было бы идеально!`,
    `Эх, ${score} звёзд. Булки на месте, но где душа?`,
    `${score} звёзд. Классика, но не хватает вау-эффекта!`,
    `Ух, ${score} звёзд! Повар, ты знаешь своё дело!`,
    `${score} звёзд. Слишком много всего, но вкусно!`
  ];
  const review = reviews[Math.floor(Math.random() * reviews.length)];

  gameState.reviews.push(review);
  const reviewsList = document.getElementById('reviews-list');
  reviewsList.innerHTML = '';
  gameState.reviews.forEach(r => {
    const div = document.createElement('div');
    div.classList.add('review');
    div.textContent = r;
    reviewsList.appendChild(div);
  });

  gameState.burger = [];
  plate.innerHTML = '';
  document.getElementById('result').textContent = `Собери новый шедевр!`;
  showModal(`Оценка: ${score}/5`, review, `Заработано: ${moneyEarned} монет, ${score * 10} EXP`);
  btn.disabled = false;
  spinner.remove();
  updateUI();
}

if (gameState.workerUpgrade > 0) {
  setInterval(() => {
    if (gameState.workerUpgrade > 0) {
      const earnings = (gameState.clickMultiplier + gameState.clickUpgrade) * (gameState.goldenMode ? 10 : 1);
      gameState.money += earnings * gameState.workerUpgrade;
      createCoin();
      updateUI();
    }
  }, 2000);
}

updateUI();