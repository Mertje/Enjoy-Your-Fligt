const cells = document.querySelectorAll('.cell');
const X = 'X';
const O = 'O';
let currentPlayer = X;

function checkWin(player) {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // horizontaal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // verticaal
        [0, 4, 8], [2, 4, 6]             // diagonaal
    ];

    return winConditions.some(condition => condition.every(index => cells[index].classList.contains(player)));
}

function checkDraw() {
    return [...cells].every(cell => cell.classList.contains(X) || cell.classList.contains(O));
}

function handleClick(event) {
    const cell = event.target;

    if (cell.classList.contains(X) || cell.classList.contains(O)) {
        return;
    }

    cell.classList.add(currentPlayer);
    cell.textContent = currentPlayer;

    if (checkWin(currentPlayer)) {
        setTimeout(() => alert(`${currentPlayer} heeft gewonnen!`), 100);
    }
    else if (checkDraw()) {
        setTimeout(() => alert('Gelijkspel!'), 100);
    } else {
        currentPlayer = currentPlayer === X ? O : X;
    }
}

function resetBoard() {
    cells.forEach(cell => {
        cell.classList.remove(X, O);
        cell.textContent = '';
    });
    currentPlayer = X;
}

cells.forEach(cell => cell.addEventListener('click', handleClick));
document.addEventListener('keydown', event => {
    if (event.key === 'r' || event.key === 'R') {
        resetBoard();
    }
});


