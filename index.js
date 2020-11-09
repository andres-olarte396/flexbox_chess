let chess = $("#chess");
let data = {};
let equipments = ["white", "black"];
let turn = 0;
fetch("/chess/data/initial.json")
  .then((res) => res.json())
  .catch((error) => console.error("Error:", error))
  .then((data) => {
    if (data) {
      for (let i = 0; i < data.board.columns; i++) {
        let r = `<div id="${data.columns[i]}" class="column">`;
        for (let j = 0; j < data.board.rows; j++) {
          r = `${r}<div id="${j + 1}${data.columns[i]}" row="${j + 1}" column="${data.columns[i]}" class="cell ${data.board.classes[(i + j) % 2]}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
        }
        r = `${r}</div>`;
        chess.html(`${chess.html()}${r}`);
      }
      data.army_members.forEach(member => {
        for (let i = 0; i < member.initial_quantity; i++) {
          let cell = $(`#${member.initial_row}${member.initial_columns.split(',')[i]}`);
          if (cell)
            cell.html(`<icon id="${member.name}.${member.color}.${i + 1}" title="${member.name} ${member.color}" name="${member.name}" symbol="${member.symbol}" class="${member.color}" row="${cell.row}" column="${cell.column}" draggable="true" ondragstart="drag(event)" />`);
        }
      });
    }
  });
function allowDrop(ev) {
  ev.preventDefault();
}
function drag(ev) {
  let equipment = equipments[turn];
  if (ev.target.id.includes(equipment)) {
    ev.dataTransfer.setData("id", ev.target.id);
  }
}
function drop(ev) {
  ev.preventDefault();
  let equipment = equipments[turn];
  let member = document.getElementById(ev.dataTransfer.getData("id"));
  if (!member?.id.includes(equipment)) return;

  let target = ev.target.localName === "icon" ? ev.target.parentNode : ev.target;
  if (target.children.length > 0) {
    let child = target.children[0];
    if (child.id.includes(equipment)) return;
    target.removeChild(child);
  }

  target.appendChild(member);
  changeTurn();
}
function changeTurn() {
  turn = turn == 0 ? 1 : 0;
}