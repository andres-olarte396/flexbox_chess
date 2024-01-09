let chess = $("#chess");
let turnLabel = $("#turn");
let quantityLabel = $("#quantity");
let black_points = 0;
let white_points = 0;

let data = {};
let history = [];
load();
function load() {
  messageShow("Start");
  fetch("/data/initial.json")
    .then((res) => res.json())
    .catch((error) => console.error("Error:", error))
    .then((response) => {
      if (response) {
        data = response;
        for (let i = 0; i < data.board.cols; i++) {
          let r = `<div id="${data.cols[i]}" class="col">`;
          for (let j = 0; j < data.board.rows; j++) {
            r = `${r}<div id="${j + 1}${data.cols[i]}" col="${i + 1}" row="${j + 1}" class="cell ${data.board.classes[(i + j) % 2]}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
          }
          r = `${r}</div>`;
          chess.html(`${chess.html()}${r}`);
        }
        data.army_members.forEach(member => {
          for (let i = 0; i < member.initial_quantity; i++) {
            let cell = $(`#${member.initial_row}${member.initial_col.split(',')[i]}`);
            let col = cell.attr("col");
            if (cell)
              cell.html(`<icon id="${member.id}" title="${member.name} ${member.id}" side="${member.side}" name="${member.name}" symbol="${member.symbol}" class="${member.name} ${member.side}" row="${member.initial_row}" col="${col}" points="${member.material_points}" state="initial" draggable="true" ondragstart="drag(event)" />`);
          }
        });
      }
    });
}
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  if (ev.target.getAttribute("side").includes(data.side)) {
    ev.dataTransfer.setData("id", ev.target.id);
  }
}
function drop(ev) {
  ev.preventDefault();
  let member = document.getElementById(ev.dataTransfer.getData("id"));
  if (!member?.getAttribute("side").includes(data.side)) return;

  let target = ev.target.localName === "icon" ? ev.target.parentNode : ev.target;
  let now = new Date();
  let date = now.toLocaleDateString('es-CO');
  let time = now.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', seconds: '3-digit' });

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
        row: parseInt(member.getAttribute("row"))
      },
      final: {
        id: target.id,
        col: parseInt(target.getAttribute("col")),
        row: parseInt(target.getAttribute("row"))
      },
      diffs: {
        cols: parseInt(member.getAttribute("col")) - parseInt(target.getAttribute("col")),
        rows: parseInt(member.getAttribute("row")) - parseInt(target.getAttribute("row")),
      }
    }
  };
  let child;
  if (target.children.length > 0) {
    child = target.children[0];
    movement.captured = {
      side: child.getAttribute("side"),
      points: child.getAttribute("points"),
      catch: false
    };
    validateCaptured(movement.captured)
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
}
function validateCaptured(member) {
  if (member.side === data.side)
    return false;
  member.catch = true;
  if (data.side === "white") {
    white_points = white_points + parseInt(member.points);
    $("#white_points").html(white_points);
  }
  else {
    black_points = black_points + parseInt(member.points);
    $("#black_points").html(black_points);
  }
  return member.catch;
}
function validateTrayectory(movement) {
  let initial = movement.pos.initial;
  let final = movement.pos.final;

  if (initial.col === final.col) {
    for (let row = Math.min(initial.row, final.row) + 1; row < Math.max(initial.row, final.row); row++) {
      let cell = $(`#${row}${data.cols[initial.col - 1]}`);
      if (cell.children().length > 0) {
        return false;
      }
    }
  } else if (initial.row === final.row) {
    for (let col = Math.min(initial.col, final.col) + 1; col < Math.max(initial.col, final.col); col++) {
      let cell = $(`#${initial.row}${data.cols[col - 1]}`);
      if (cell.children().length > 0) {
        return false;
      }
    }
  }

  if (Math.abs(initial.col - final.col) === Math.abs(initial.row - final.row)) {
    let colDirection = (final.col - initial.col) / Math.abs(final.col - initial.col);
    let rowDirection = (final.row - initial.row) / Math.abs(final.row - initial.row);

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
      if (Math.abs(movement.pos.diffs.cols) > 1
        || Math.abs(movement.pos.diffs.rows) > 1)
        return false;
      break;
    case "queen":
      if (Math.abs(movement.pos.diffs.cols) !== 0 && Math.abs(movement.pos.diffs.rows) !== 0
        && Math.abs(movement.pos.diffs.cols) !== Math.abs(movement.pos.diffs.rows))
        return false;
      return validateTrayectory(movement);
    case "tower":
      if (Math.abs(movement.pos.diffs.cols) !== 0 && Math.abs(movement.pos.diffs.rows) !== 0)
        return false;
      return validateTrayectory(movement);
    case "bishop":
      if (Math.abs(movement.pos.diffs.cols) !== Math.abs(movement.pos.diffs.rows))
        return false;
      return validateTrayectory(movement);
    case "horse":
      return ((Math.abs(movement.pos.diffs.cols) === 1 && Math.abs(movement.pos.diffs.rows) === 2)
        || (Math.abs(movement.pos.diffs.cols) === 2 && Math.abs(movement.pos.diffs.rows) === 1));
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
      if ((factor * movement.pos.diffs.cols) !== (movement.captured?.catch ? 1 : 0)
        || (factor * movement.pos.diffs.rows) > (movement.turn < 2 ? 2 : 1))
        return false;
      break;
    default:
      return false;
  }
  return true;
}
function changeTurn() {
  data.turn = data.turn + 1;
  data.side = data.sides[data.turn % data.sides.length];

}
function messageShow(msg) {
  document.getElementById("message").innerHTML = msg;
  let overlay = document.getElementById("overlay");
  overlay.style.display = "block";
  setTimeout(() => { overlay.style.display = 'none'; }, 3000);
}
function addToMovementsTable(movement) {
  let table = $("#movements tbody");
  let val = movement.id + " -> " + movement.pos.final.row + data.cols[movement.pos.final.col - 1];
  let row =
    `<tr>
  <td>${movement.side === "white" ? val : ""}</td>
  <td>${movement.side === "black" ? val : ""}</td>
  <td>${movement.time}</td>
  </tr>`;
  table.append(row);
}