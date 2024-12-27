function drop(ev) {
  ev.preventDefault();
  let member = document.getElementById(ev.dataTransfer.getData("id"));
  if (!member?.getAttribute("side").includes(data.side)) return;

  let target =
    ev.target.localName === "icon" ? ev.target.parentNode : ev.target;
  let now = new Date();
  let date = now.toLocaleDateString("es-CO");
  let time = now.toLocaleTimeString("es-CO", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  let movement = {
    id: member.id,
    type: member.getAttribute("name"),
    side: data.side,
    turn: data.turn,
    date: date,
    time: time,
    pos: {
      initial: {
        id: member.parentNode.id,
        col: parseInt(member.getAttribute("col")),
        row: parseInt(member.getAttribute("row")),
      },
      final: {
        id: target.id,
        col: parseInt(target.getAttribute("col")),
        row: parseInt(target.getAttribute("row")),
      },
      diffs: {
        cols:
          parseInt(member.getAttribute("col")) -
          parseInt(target.getAttribute("col")),
        rows:
          parseInt(member.getAttribute("row")) -
          parseInt(target.getAttribute("row")),
      },
    },
  };
  let child;
  if (target.children.length > 0) {
    child = target.children[0];
    movement.captured = {
      side: child.getAttribute("side"),
      points: child.getAttribute("points"),
      catch: false,
    };
    validateCaptured(movement.captured);
  }
  if (!validateMovement(movement)) return;
  if (movement.captured?.catch) target.removeChild(child);
  history.push(movement);
  addToMovementsTable(movement);
  member.setAttribute("state", "moved");
  member.setAttribute("col", target.getAttribute("col"));
  member.setAttribute("row", target.getAttribute("row"));
  target.appendChild(member);
  changeTurn();

  turnLabel.html(data.side);
  quantityLabel.html(data.turn);
  startClock(data);
  saveGame(data);
}

function validateCaptured(member) {
  if (member.side === data.side) return false;
  member.catch = true;
  if (data.side === "white") {
    white_points = white_points + parseInt(member.points);
    $("#white_points").html(white_points);
  } else {
    black_points = black_points + parseInt(member.points);
    $("#black_points").html(black_points);
  }
  return member.catch;
}

function validateTrayectory(movement) {
  let initial = movement.pos.initial;
  let final = movement.pos.final;

  if (initial.col === final.col) {
    for (
      let row = Math.min(initial.row, final.row) + 1;
      row < Math.max(initial.row, final.row);
      row++
    ) {
      let cell = $(`#${row}${data.cols[initial.col - 1]}`);
      if (cell.children().length > 0) {
        return false;
      }
    }
  } else if (initial.row === final.row) {
    for (
      let col = Math.min(initial.col, final.col) + 1;
      col < Math.max(initial.col, final.col);
      col++
    ) {
      let cell = $(`#${initial.row}${data.cols[col - 1]}`);
      if (cell.children().length > 0) {
        return false;
      }
    }
  }

  if (Math.abs(initial.col - final.col) === Math.abs(initial.row - final.row)) {
    let colDirection =
      (final.col - initial.col) / Math.abs(final.col - initial.col);
    let rowDirection =
      (final.row - initial.row) / Math.abs(final.row - initial.row);

    for (let i = 1; i < Math.abs(initial.col - final.col); i++) {
      let col = initial.col + i * colDirection;
      let row = initial.row + i * rowDirection;
      let cell = $(`#${row}${data.cols[col - 1]}`);
      if (cell.children().length > 0) {
        return false;
      }
    }
  }

  return true;
}

function validateMovement(movement) {
  switch (movement.type) {
    case "king":
      if (
        Math.abs(movement.pos.diffs.cols) > 1 ||
        Math.abs(movement.pos.diffs.rows) > 1
      )
        return false;
      break;
    case "queen":
      if (
        Math.abs(movement.pos.diffs.cols) !== 0 &&
        Math.abs(movement.pos.diffs.rows) !== 0 &&
        Math.abs(movement.pos.diffs.cols) !== Math.abs(movement.pos.diffs.rows)
      )
        return false;
      return validateTrayectory(movement);
    case "tower":
      if (
        Math.abs(movement.pos.diffs.cols) !== 0 &&
        Math.abs(movement.pos.diffs.rows) !== 0
      )
        return false;
      return validateTrayectory(movement);
    case "bishop":
      if (
        Math.abs(movement.pos.diffs.cols) !== Math.abs(movement.pos.diffs.rows)
      )
        return false;
      return validateTrayectory(movement);
    case "horse":
      return (
        (Math.abs(movement.pos.diffs.cols) === 1 &&
          Math.abs(movement.pos.diffs.rows) === 2) ||
        (Math.abs(movement.pos.diffs.cols) === 2 &&
          Math.abs(movement.pos.diffs.rows) === 1)
      );
    case "pawn":
      let factor = 0;
      switch (movement.side) {
        case "white":
          factor = 1;
          break;
        case "black":
          factor = -1;
          break;
      }
      if (
        factor * movement.pos.diffs.cols !==
        (movement.captured?.catch ? 1 : 0) ||
        factor * movement.pos.diffs.rows > (movement.turn < 2 ? 2 : 1)
      )
        return false;
      break;
    default:
      return false;
  }
  return true;
}

let whiteTime = 0;
let blackTime = 0;
let intervalId;

function startClock(data) {
  if (intervalId) clearInterval(intervalId);
  intervalId = setInterval(() => updateClock(data), 1000);
}

function stopClock() {
  clearInterval(intervalId);
}

function updateClock(data) {
  if (data.side === "white") whiteTime++;
  if (data.side === "black") blackTime++;

  data.whiteTime = whiteTime;
  data.blackTime = blackTime;
  updateClockDisplay();
}

function updateClockDisplay() {
  const whiteClockElement = document.getElementById("white-clock");
  const blackClockElement = document.getElementById("black-clock");

  whiteClockElement.textContent = formatTime(whiteTime);
  blackClockElement.textContent = formatTime(blackTime);
}

function formatTime(seconds) {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  return `${padZero(hours)}:${padZero(minutes)}:${padZero(remainingSeconds)}`;
}

function padZero(value) {
  return value < 10 ? `0${value}` : value;
}
