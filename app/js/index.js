let chess = $("#chess");
let turnLabel = $("#turn");
let quantityLabel = $("#quantity");
let black_points = 0;
let white_points = 0;
let data = {};
let history = [];

load();

function loadNew() {
  fetch("/data/initial.json")
    .then((res) => res.json())
    .catch((error) => console.error("Error:", error))
    .then((response) => {
      loadGame(response);
    });
}

function loadGame(response) {
  if (response) {
    data = response;
    for (let i = 0; i < data.board.cols; i++) {
      let r = `<div id="${data.cols[i]}" class="col">`;
      for (let j = 0; j < data.board.rows; j++) {
        r = `${r}<div id="${data.cols[i]}${j + 1}" col="${i + 1}" row="${j + 1}" class="cell ${data.board.classes[(i + j) % 2]}" ondrop="drop(event)" ondragover="allowDrop(event)"></div>`;
      }
      r = `${r}</div>`;
      chess.html(`${chess.html()}${r}`);
    }
    data.army_members.forEach(member => {
      for (let i = 0; i < member.initial_quantity; i++) {
        let cell = $(`#${member.initial_col.split(',')[i]}${member.initial_row}`);
        let col = cell.attr("col");
        if (cell)
          cell.html(`<piece id="${member.id}" title="${member.name} ${member.id}" side="${member.side}" name="${member.name}" symbol="${member.symbol}" class="${member.name} ${member.side}" row="${member.initial_row}" col="${col}" points="${member.material_points}" state="initial" draggable="true" ondragstart="drag(event)" />`);
      }
    });
    saveGame(data);
  }
}

function allowDrop(ev) {
  ev.preventDefault();
}

function drag(ev) {
  if (ev.target.getAttribute("side").includes(data.side)) {
    ev.dataTransfer.setData("id", ev.target.id);
  }
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

function load() {
 /* const savedGame = localStorage.getItem('chess-game');
  if (savedGame) {
    const parsedGame = JSON.parse(savedGame);
    loadGame(parsedGame);
  } else {*/
    messageShow("Start");
    loadNew();
  //}
}

function saveGame(gameData) {
  localStorage.setItem('chess-game', JSON.stringify(gameData));
}