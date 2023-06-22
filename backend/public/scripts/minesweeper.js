const cellContainer = document.querySelector(".container");
const counter = document.querySelector(".bomb-info > h1");
const timer = document.querySelector(".time-info > h1");
const resetButton = document.querySelector(".controls > button");

let timerInterval;

let cells = [];
let firstClick = true;
let gameFinished = false;

let rowCount = 9;
let colCount = 9;
let bombCount = 10;
let flagsSet = 0;

class Cell {
  #x;
  #y;
  #element;
  #isBomb = false;
  #isFlagged = false;
  #isRevealed = false;
  #value = 0;

  constructor(x, y) {
    this.#x = x;
    this.#y = y;

    this.#element = document.createElement("div");
    this.#element.classList.add("cell", "border", "border-small");

    this.#element.setAttribute("data-x", this.#x);
    this.#element.setAttribute("data-y", this.#y);

    this.#element.onclick = () => {
      this.clickCell();
    };

    this.#element.oncontextmenu = (e) => {
      e.preventDefault();
      if (this.#isRevealed) return;

      if (this.#isFlagged) {
        this.removeFlag();
      } else {
        this.setFlag();
      }
      setCounter();
    };

    cellContainer.appendChild(this.#element);
    cells.push(this);
  }

  getPos = () => {
    return { x: this.#x, y: this.#y };
  };

  getElement = () => {
    return this.#element;
  };

  scan = () => {
    const surrounding = cells.filter((cell) => {
      const { x, y } = cell.getPos();
      return (
        (x + 1 === this.#x && y + 1 === this.#y) ||
        (x === this.#x && y + 1 === this.#y) ||
        (x - 1 === this.#x && y + 1 === this.#y) ||
        (x + 1 === this.#x && y === this.#y) ||
        (x - 1 === this.#x && y === this.#y) ||
        (x + 1 === this.#x && y - 1 === this.#y) ||
        (x === this.#x && y - 1 === this.#y) ||
        (x - 1 === this.#x && y - 1 === this.#y)
      );
    });
    return surrounding;
  };

  clickCell = () => {
    if (this.#isRevealed) return;
    if (this.#isFlagged) return;
    if (gameFinished) return;

    if (firstClick) {
      firstClick = false;
      gameStart(this);
    }

    this.revealCell();
  };

  revealCell = () => {
    this.#isRevealed = true;
    this.#element.classList.add("revealed");

    if (getRevealedCells().length === rowCount * colCount - getBombCells().length) {
      gameWin();
    }

    if (this.#isBomb) {
      this.#element.textContent = this.#value;
      if (gameFinished) return;
      gameLose(this);
    }

    if (this.#value > 0) {
      this.#element.textContent = this.#value;
      this.#element.classList.add(`type-${this.#value}`);
    }

    if (this.#value == 0) {
      const surrounding = this.scan();
      surrounding.forEach((cell) => cell.clickCell());
    }
  };

  setAsBomb = () => {
    this.#isBomb = true;
    this.#value = "*";
    // this.#element.classList.add("bomb")
  };

  setFlag = () => {
    this.#isFlagged = true;
    this.#element.textContent = "`";
    flagsSet++;
  };

  removeFlag = () => {
    this.#isFlagged = false;
    this.#element.textContent = "";
    flagsSet--;
  };

  isBomb = () => {
    return this.#isBomb;
  };

  isRevealed = () => {
    return this.#isRevealed;
  };

  isFlagged = () => {
    return this.#isFlagged;
  };

  setValue = (amount) => {
    this.#value = amount;
  };

  getValue = () => {
    return this.#value;
  };
}

const isPosEqual = (cell, bomb) => {
  const cellLocation = cell.getPos();

  return cellLocation.x === bomb.x && cellLocation.y === bomb.y;
};

const randomLocation = () => {
  return {
    x: Math.floor(Math.random() * colCount),
    y: Math.floor(Math.random() * rowCount),
  };
};

const getBombCells = () => {
  return cells.filter((cell) => cell.isBomb());
};

const getRevealedCells = () => {
  return cells.filter((cell) => cell.isRevealed() && !cell.isBomb());
};

const getFlaggedCells = () => {
  return cells.filter((cell) => cell.isFlagged());
};

const generateBombs = (firstCell) => {
  const cellRandom = cells;

  for (let i = cellRandom.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cellRandom[i], cellRandom[j]] = [cellRandom[j], cellRandom[i]];
  }

  let index = 0;
  for (const cell of cellRandom) {
    if (index === bombCount) return;
    if (cell == firstCell) continue;
    cell.setAsBomb();
    index++;
  }
};

const startTimer = () => {
  let time = 0;
  timerInterval = setInterval(() => {
    time++;
    if (time === 999) {
      clearInterval(timerInterval);
      timer.textContent = time;
    } else if (time >= 100) {
      timer.textContent = time;
    } else if (time >= 10) {
      timer.textContent = `0${time}`;
    } else {
      timer.textContent = `00${time}`;
    }
  }, 1000);
};

const setCounter = () => {
  const value = bombCount - flagsSet;
  if (value >= 100) {
    counter.textContent = `${value}`;
  } else if (value >= 10) {
    counter.textContent = `0${value}`;
  } else {
    counter.textContent = `00${value}`;
  }
};

const updateRowCount = (event) => {
  const spanRowCount = document.querySelector("#rowCount");
  const newRowCount = event.valueAsNumber;
  spanRowCount.textContent = newRowCount;
  rowCount = newRowCount;

  const bombInput = document.querySelector("#bombsInput");
  bombInput.setAttribute("max", rowCount * colCount - 1);
  if (bombInput.valueAsNumber > rowCount * colCount - 1) {
    bombInput.value = rowCount * colCount - 1;
    updateBombCount();
  }
};

const updateColCount = (event) => {
  const spanColCount = document.querySelector("#colCount");
  const newColCount = event.valueAsNumber;
  spanColCount.textContent = newColCount;
  colCount = newColCount;

  const bombInput = document.querySelector("#bombsInput");
  bombInput.setAttribute("max", rowCount * colCount - 1);
  if (bombInput.valueAsNumber > rowCount * colCount - 1) {
    bombInput.value = rowCount * colCount - 1;
    updateBombCount();
  }
};

const updateBombCount = (event) => {
  const spanBombCount = document.querySelector("#bombCount");
  const newBombCount = event.valueAsNumber;
  spanBombCount.textContent = newBombCount;
  bombCount = newBombCount;
};

const resetBoard = () => {
  cells.forEach((cell) => {
    cellContainer.removeChild(cell.getElement());
  });
  timer.textContent = "000";
  cells = [];
  gameFinished = false;
  firstClick = true;
  flagsSet = 0;
  setCounter();
  clearInterval(timerInterval);
};

const gameSetup = () => {
  resetBoard();
  resetButton.innerHTML = `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;

  const root = document.querySelector(":root");
  root.style.setProperty("--col-count", `${colCount}`);

  for (let row = 0; row < rowCount; row++) {
    for (let col = 0; col < colCount; col++) {
      new Cell(col, row);
    }
  }
};

const gameStart = (firstCell) => {
  generateBombs(firstCell);
  cells.forEach((cell) => {
    if (cell.isBomb()) return;
    const surrounding = cell.scan();
    const bombCells = surrounding.filter((cell) => cell.isBomb());
    cell.setValue(bombCells.length);
  });

  startTimer();
  setCounter(bombCount);
};

const gameLose = (cell) => {
  gameFinished = true;
  const bombCells = getBombCells();
  bombCells.forEach((cell) => {
    cell.revealCell();
  });
  cell.getElement().classList.add("bomb");
  clearInterval(timerInterval);
  resetButton.innerHTML = `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M6 18L18 6M6 6l12 12" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
};

const gameWin = () => {
  gameFinished = true;
  clearInterval(timerInterval);
  getBombCells().forEach((cell) => cell.setFlag());
  resetButton.innerHTML = `<svg aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M4.5 12.75l6 6 9-13.5" stroke-linecap="round" stroke-linejoin="round"></path></svg>`;
};

window.addEventListener("DOMContentLoaded", () => {
  const [rowInput, colInput, bombInput] = document.querySelectorAll(".settings input");
  rowInput.value = rowCount;
  colInput.value = colCount;
  bombInput.value = bombCount;
  gameSetup();
});
