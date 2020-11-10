let chess = $("#chess");
let turnLabel = $("#turn");
let quantityLabel = $("#quantity");
let black_points = $("#black_points");
let white_points = $("#white_points");
let data = {};
let history = [];
fetch("/data/initial.json")
  .then((res) => res.json())
  .catch((error) => console.error("Error:", error))
  .then((response) => {
    if (response) {
      data = response;
      for (let i = 0; i < data.board.columns; i++) {
        let r = `<div id="${data.columns[i]}" class="column">`;
        for (let j = 0; j < data.board.rows; j++) {
          r = `${r}<div id="${j + 1}${data.columns[i]}" column="${i + 1}" row="${j + 1}" class="cell ${data.board.classes[(i + j) % 2]}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
        }
        r = `${r}</div>`;
        chess.html(`${chess.html()}${r}`);
      }
      data.army_members.forEach(member => {
        for (let i = 0; i < member.initial_quantity; i++) {
          let cell = $(`#${member.initial_row}${member.initial_columns.split(',')[i]}`);
          let col = cell.attr("column");
          if (cell)
            cell.html(`<icon id="${member.id}" title="${member.name} ${i + 1}" equipment="${member.equipment}" name="${member.name}" symbol="${member.symbol}" class="${member.equipment}" row="${member.initial_row}" column="${col}" points="${member.material_points}" state="initial" draggable="true" ondragstart="drag(event)" />`);
        }
      });
    }
  });
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  if (ev.target.getAttribute("equipment").includes(data.equipment)) {
    ev.dataTransfer.setData("id", ev.target.id);
  }
}
function drop(ev) {
  ev.preventDefault();
  let member = document.getElementById(ev.dataTransfer.getData("id"));
  if (!member?.getAttribute("equipment").includes(data.equipment)) return;

  let target = ev.target.localName === "icon" ? ev.target.parentNode : ev.target;
  if (!validateNewPosition(member, target)) return;

  if (target.children.length > 0) {
    let child = target.children[0];
    if (child.id.includes(data.equipment)) return;
    target.removeChild(child);
    if (data.equipment === "white")
      white_points.html(child.getAttribute("points"))
    else
      black_points.html(child.getAttribute("points"))
  }

  history.push({ item: member.id, origin: member.parentNode.id, destination: target.id, equipment: data.equipment, date: (new Date()).toLocaleDateString('en-US') });
  member.setAttribute("column", target.getAttribute("column"));
  member.setAttribute("row", target.getAttribute("row"));
  target.appendChild(member);
  changeTurn();
}
function validateNewPosition(member, target) {
  let coldif = parseInt(member.getAttribute("column")) - parseInt(target.getAttribute("column"));
  let rowdif = parseInt(member.getAttribute("row")) - parseInt(target.getAttribute("row"));
  switch (member.getAttribute("name")) {
    case "King":
      if (Math.abs(coldif) > 1
        || Math.abs(rowdif) > 1)
        return false;
      break;
    case "Queen":
      if (Math.abs(coldif) !== 0
        && Math.abs(rowdif) !== 0
        && Math.abs(coldif) !== Math.abs(rowdif))
        return false;
      break;
    case "Tower":
      if (Math.abs(coldif) !== 0
        && Math.abs(rowdif) !== 0)
        return false;
      break;
    case "Bishop":
      if (Math.abs(coldif) !== Math.abs(rowdif))
        return false;
      break;
    case "Horse":
      return (Math.abs(coldif) === 1 && Math.abs(rowdif) === 2)
        || (Math.abs(coldif) === 2 && Math.abs(rowdif) === 1);
    case "Pawn":
      rowdif = (data.equipment === "white" ? -1 : 1) * rowdif;
      if (coldif !== 0 || rowdif != 1)
        return false;
      break;
    default:
      return false;
  }
  return true;
}
function changeTurn() {
  data.turn = data.turn + 1;
  data.equipment = data.equipments[data.turn % data.equipments.length];
  turnLabel.html(data.equipment);
  quantityLabel.html(data.turn);
}