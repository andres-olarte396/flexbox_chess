let data = {};
let chess = $("#chess");
fetch("/chess/data/initial.json")
  .then((res) => res.json())
  .catch((error) => console.error("Error:", error))
  .then((data) => {
    if (data) {
      for (let i = 0; i < data.board.columns; i++) {
        let r = `<div id="${data.columns[i]}" class="column">`;
        for (let j = 0; j < data.board.rows; j++) {
          r = `${r}<div id="${j + 1}${data.columns[i]}" row="${j + 1}" column="${data.columns[i]}" class="row ${data.board.classes[(i + j) % 2]}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
        }
        r = `${r}</div>`;
        chess.html(`${chess.html()}${r}`);
      }
      data.army_members.forEach(member => {
        for (let i = 0; i < member.initial_quantity; i++) {
          let cell = $(`#${member.initial_row}${member.initial_columns.split(',')[i]}`);
          if (cell)
            cell.html(`<icon id="${member.name}.${member.color}.${i + 1}" class="${member.name} ${member.color}" draggable="true" ondragstart="drag(event)" >${member.symbol}</icon>`);
        }
      });
    }
  });

  function allowDrop(ev) {
    ev.preventDefault();
  }
  
  function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
  }
  
  function drop(ev) {
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
  }