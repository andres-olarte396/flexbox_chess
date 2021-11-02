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
              cell.html(`<icon id="${member.id}" title="${member.name} ${i + 1}" side="${member.side}" name="${member.name}" symbol="${member.symbol}" class="${member.name} ${member.side}" row="${member.initial_row}" col="${col}" points="${member.material_points}" state="initial" draggable="true" ondragstart="drag(event)" />`);
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
  let movement = {
    id: member.id,
    type: member.getAttribute("name"),
    side: data.side,
    turn: data.turn,
    date: (new Date()).toLocaleDateString('en-US'),
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
  if (data.side === "white")
  {
    white_points = white_points + parseInt(member.points);
    $("#white_points").html(white_points);
  }
  else
  {
    black_points = black_points + parseInt(member.points);
    $("#black_points").html(black_points);
  }
  return member.catch;
}
function validateTrayectory(movement) {
  let initial = movement.pos.initial;
  let final = movement.pos.final;
  debugger
  for (let col = initial.col;
    (initial.col > final.col ? col >= final.col : col <= final.col);
    (initial.col > final.col ? col-- : col++)) {
    for (let row = initial.row;
      (initial.row > final.row ? row > final.row : row < final.row);
      (initial.row > final.row ? row-- : row++)) {
      let cell = $(`#${row}${data.cols[col-1]}`);
      if (cell.children.length > 0)
        return false;
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
      return (Math.abs(movement.pos.diffs.cols) === 1 && Math.abs(movement.pos.diffs.rows) === 2)
        || (Math.abs(movement.pos.diffs.cols) === 2 && Math.abs(movement.pos.diffs.rows) === 1);
    case "pawn":
      let factor = (movement.side === "white" ? -1 : 1);
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