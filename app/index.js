let chess = $("#chess");
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
          r = `${r}<div id="${j + 1}${data.columns[i]}" row="${j + 1}" column="${data.columns[i]}" class="cell ${data.board.classes[(i + j) % 2]}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
        }
        r = `${r}</div>`;
        chess.html(`${chess.html()}${r}`);
      }
      data.army_members.forEach(member => {
        for (let i = 0; i < member.initial_quantity; i++) {
          let cell = $(`#${member.initial_row}${member.initial_columns.split(',')[i]}`);
          if (cell)
            cell.html(`<icon id="${member.id}${i + 1}" title="${member.name} ${i + 1}" equipment="${member.equipment}" name="${member.name}" symbol="${member.symbol}" class="${member.equipment}" row="${member.initial_row}" column="${i+1}" state="initial" draggable="true" ondragstart="drag(event)" />`);
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
  if (target.children.length > 0) {
    let child = target.children[0];
    if (child.id.includes(data.equipment)) return;
    target.removeChild(child);
  }

  history.push({item: member.id, origin: member.parentNode.id, destination: target.id, equipment: data.equipment, date: (new Date()).toLocaleDateString('en-US') });
  target.appendChild(member);
  changeTurn();
}
function changeTurn() {
  data.turn = data.turn + 1;
  data.equipment = data.equipments[data.turn % data.equipments.length];
}