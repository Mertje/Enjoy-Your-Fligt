var tulipName = [
  "ac",
  "ab",
];
let answer = "";
let maxWrong = 6;
let mistakes = 0;
let guessed = [];
let alphabets = ["a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z"];
let wordStatus = null;

function randomWord() {
  answer = tulipName[Math.floor(Math.random() * tulipName.length)];
}

document.onkeypress = function (e) {
  e = e || window.event;
  var charCode = e.charCode || e.keyCode,
    character = String.fromCharCode(charCode);

  if (alphabets.includes(character)) handleGuess(character);
};

function generateButtons() {
  let buttonsHTML = "abcdefghijklmnopqrstuvwxyz"
    .split("")
    .map(
      (letter) =>
        `
      <button
        class="keyboardButton"
        id='` +
        letter +
        `'
        onClick="handleGuess('` +
        letter +
        `')"
      >
        ` +
        letter +
        `
      </button>
    `,
    )
    .join("");

  document.getElementById("keyboard").innerHTML = buttonsHTML;
}

function handleGuess(chosenLetter) {
  guessed.indexOf(chosenLetter) === -1 ? guessed.push(chosenLetter) : null;
  document.getElementById(chosenLetter).setAttribute("disabled", true);

  if (answer.indexOf(chosenLetter) >= 0) {
    guessedWord();
    checkIfGameWon();
    document.getElementById(chosenLetter).style.backgroundColor = "green"; // groene kleur voor goede letter
  } else if (answer.indexOf(chosenLetter) === -1) {
    mistakes++;
    updateMistakes();
    checkIfGameLost();
    updateHangmanPicture();
    document.getElementById(chosenLetter).style.backgroundColor = "red"; // rood voor verkeerde letter
  }
}

function updateHangmanPicture() {
  document.getElementById("hangmanPic").src = "../assets/Hangman/" + mistakes + ".jpg";
}

function checkIfGameWon() {
  if (wordStatus.indexOf("_") === -1) {
    document.querySelector("#popup").showModal();
    document.getElementById("winOrLoseMessage").innerHTML = "Jij hebt gewonnen!!!";
    showWinImage(); // laat plaatje zien als je hebt gewonnen
    playWinSound(); // Speel het win-geluid af
  }
}

function showWinImage() {
  document.getElementById("winImage").style.display = "block";  // blokkeert de style display wat op none staat
}
function playWinSound() {
  var audio = document.getElementById("winSound");
  audio.play();
}
function stopWinSound() {
  var audio = document.getElementById("winSound");
  audio.pause();
  audio.currentTime = 0; // Zet muziek terug naar het begin
}

function checkIfGameLost() {
  if (mistakes === maxWrong) {
    document.querySelector("#popup").showModal();
    document.getElementById("winOrLoseMessage").innerHTML = "Jij hebt verloren!!!<br>Het antwoord luidde:<br>" + answer;
    showLoseImage(); // Toon het verliesplaatje
    playLoseSound();
  }
}
function showLoseImage() {
  document.getElementById("loseImage").style.display = "block";
}

function playLoseSound() {
  var audio = document.getElementById("loseSound");
  audio.play();
}
function stopLoseSound() {
  var audio = document.getElementById("loseSound");
  audio.pause();
  audio.currentTime = 0; // Zet muziek terug naar het begin
}

function reset() {
  mistakes = 0;
  guessed = [];
  document.getElementById("hangmanPic").src = "../assets/Hangman/0.jpg";
  document.querySelector("#popup[open]")?.close();

  randomWord();
  guessedWord();
  updateMistakes();
  generateButtons();
  stopWinSound();
  stopLoseSound();

  document.getElementById("winImage").style.display = "none"; // Verberg het winnende plaatje
  document.getElementById("loseImage").style.display = "none"; // Verberg het verliesende plaatje
  document.getElementById("hintButton").innerHTML = "Hint"; // Zet hint knopje terug naar "Hint"
}

function guessedWord() {
  wordStatus = answer
    .split("")
    .map((letter) => {
      if (letter === " ") {
        return " ";
      } else if (guessed.indexOf(letter) >= 0) {
        return letter;
      } else {
        return "_";
      }
    })
    .join("");

  if (wordStatus.indexOf("_") >= 0) {
    wordStatus = wordStatus.replace(/_/g, " _");
  }

  document.getElementById("wordSpotlight").innerHTML = wordStatus;
}

function updateMistakes() {
  document.getElementById("mistakes").innerHTML = mistakes;
}
document.getElementById("maxWrong").innerHTML = maxWrong;
randomWord();
generateButtons();
guessedWord();

function giveHint() {
  // Kies een willekeurige index van het antwoordwoord
  const randomIndex = Math.floor(Math.random() * answer.length);

  // Haal de letter op bij de gekozen index
  const hintLetter = answer[randomIndex];

  // Onthul de letter aan de gebruiker
  document.getElementById("hintButton").innerHTML = "Hint: " + hintLetter;
}

// source: https://github.com/Nomzy-kush/Hangman-Game/blob/main/script.js
// bron: bron https://www.section.io/engineering-education/creating-a-hangman-game-with-vanilla-js/#:~:text=How%20to%20create%20a%20Hangman%20game%20with%20Vanilla,The%20randomWord%20%28%29%20function%20...%205%20Conclusion%20
