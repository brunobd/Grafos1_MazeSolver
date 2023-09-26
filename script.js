var canvas;
var context;
var output;
var WIDTH = 1000;
var HEIGHT = 1000;

tileW = 25;
tileH = 25;

tileRowCount = 25;
tileColumnCount = 25;

boundX = 0;
boundY = 0;

startX = 15;
startY = 15;

finishX = 20;
finishY = 20;

var solving = false;
var finished = true;
var aborted = false;

var tiles = [];
for (c = 0; c < tileColumnCount; c++) {
  tiles[c] = [];
  for (r = 0; r < tileRowCount; r++) {
    tiles[c][r] = {
      x: c * (tileW + 3),
      y: r * (tileH + 3),
      state: "e",
      on_queue: false,
    };
  }
}
tiles[startX][startY].state = "s";
tiles[finishX][finishY].state = "f";
let abort = false;
function abortSolving() {

  output.innerText = "Aborted";
  aborted=true;
  abort = true;
}

function rect(x, y, w, h, state, on_queue) {
  if (on_queue) {
    context.fillStyle = "#FF00FF";
  } else {
    if (state == "s") {
      context.fillStyle = "#00FF00";
    } else if (state == "f") {
      context.fillStyle = "#FF0000";
    } else if (state == "e") {
      context.fillStyle = "#AAAAAA";
    } else if (state == "w") {
      context.fillStyle = "#0000FF";
    } else if (state == "x") {
      context.fillStyle = "#000000";
    } else {
      context.fillStyle = "#FFFF00";
    }
  }

  context.beginPath();
  context.rect(x, y, w, h);
  context.closePath();
  context.fill();
}

function clear() {
  context.clearRect(0, 0, WIDTH, HEIGHT);
}

function draw() {
  clear();
  for (c = 0; c < tileColumnCount; c++) {
    for (r = 0; r < tileRowCount; r++) {
      rect(
        tiles[c][r].x,
        tiles[c][r].y,
        tileW,
        tileH,
        tiles[c][r].state,
        tiles[c][r].on_queue
      );
    }
  }
}

async function depth_first_search() {
  if (aborted) {
    solving = false;
    finished = true;
    abort = false;
    return;
  }
  if (!solving && finished) {

    output.innerText = "Solving...";
    solving = true;
    finished = false;
    let visited = Array(tileColumnCount * tileRowCount).fill(false);
    let stack = [[startX, startY, tiles[startX][startY].state]];
    var path_found = false;
    while (stack.length > 0 && !path_found) {
      let tile = stack.shift();
      var x_loc = tile[0];
      var y_loc = tile[1];
      tiles[x_loc][y_loc].on_queue = false;
      if (x_loc > 0) {
        if (tiles[x_loc - 1][y_loc].state == "f") {
          path_found = true;
        }
      }
      if (x_loc < tileColumnCount - 1) {
        if (tiles[x_loc + 1][y_loc].state == "f") {
          path_found = true;
        }
      }
      if (y_loc > 0) {
        if (tiles[x_loc][y_loc - 1].state == "f") {
          path_found = true;
        }
      }
      if (y_loc < tileRowCount - 1) {
        if (tiles[x_loc][y_loc + 1].state == "f") {
          path_found = true;
        }
      }
      if (path_found) {
        break;
      }
      let adjacency_list = [];
      if (x_loc > 0) {
        if (tiles[x_loc - 1][y_loc].state == "e") {
          adjacency_list.unshift([
            x_loc - 1,
            y_loc,
            tiles[x_loc - 1][y_loc].state,
          ]);
          tiles[x_loc - 1][y_loc].state = tiles[x_loc][y_loc].state + "l";
        }
      }
      if (x_loc < tileRowCount - 1) {
        if (tiles[x_loc + 1][y_loc].state == "e") {
          adjacency_list.unshift([
            x_loc + 1,
            y_loc,
            tiles[x_loc + 1][y_loc].state,
          ]);
          tiles[x_loc + 1][y_loc].state = tiles[x_loc][y_loc].state + "r";
        }
      }

      if (y_loc > 0) {
        if (tiles[x_loc][y_loc - 1].state == "e") {
          adjacency_list.unshift([
            x_loc,
            y_loc - 1,
            tiles[x_loc][y_loc - 1].state,
          ]);
          tiles[x_loc][y_loc - 1].state = tiles[x_loc][y_loc].state + "u";
        }
      }

      if (y_loc < tileColumnCount - 1) {
        if (tiles[x_loc][y_loc + 1].state == "e") {
          adjacency_list.unshift([
            x_loc,
            y_loc + 1,
            tiles[x_loc][y_loc + 1].state,
          ]);
          tiles[x_loc][y_loc + 1].state = tiles[x_loc][y_loc].state + "d";
        }
      }

      if (visited[y_loc * tileRowCount + x_loc] == false) {
        visited[y_loc * tileRowCount + x_loc] = true;
        while (adjacency_list.length > 0) {
          let adj = adjacency_list.shift();
          if (visited[adj[1] * tileRowCount + adj[0]] == false) {
            stack.push(adj);
            tiles[adj[0]][adj[1]].on_queue = true;
          }
        }
      }
      if (abort) {
        solving = false;
        finished = true;
        abort = false;
        return;
      }
      await timer(0.05);
      draw();
    }
    if (!path_found) {
      output.innerText = "No solution!";
    } else {
      output.innerText = "Solved!";

      var path = tiles[x_loc][y_loc].state;
      var pathLength = path.length;
      var currX = startX;
      var currY = startY;
      for (var i = 0; i < pathLength - 1; i++) {
        if (path.charAt(i + 1) == "u") {
          currY -= 1;
        }
        if (path.charAt(i + 1) == "d") {
          currY += 1;
        }
        if (path.charAt(i + 1) == "r") {
          currX += 1;
        }
        if (path.charAt(i + 1) == "l") {
          currX -= 1;
        }
        tiles[currX][currY].state = "x";
      }
    }
  }
  solving = false;
}

function init() {
  canvas = document.getElementById("canvas");
  context = canvas.getContext("2d");
  output = document.getElementById("output");
  return setInterval(draw, 1);
}

function reset() {
  if (!solving) {
    finished = true;
    for (c = 0; c < tileColumnCount; c++) {
      tiles[c] = [];
      for (r = 0; r < tileRowCount; r++) {
        tiles[c][r] = { x: c * (tileW + 3), y: r * (tileH + 3), state: "e" };
      }
    }
    tiles[startX][startY].state = "s";
    tiles[finishX][finishY].state = "f";
    output.innerText = "";
    finished = true;
    abort = false;
    aborted = false;
  }
}
function myMove(e) {
  if (finished) {
    x = e.pageX - canvas.offsetLeft;
    y = e.pageY - canvas.offsetTop;
    for (c = 0; c < tileColumnCount; c++) {
      for (r = 0; r < tileRowCount; r++) {
        if (c * (tileW + 3) < x && x < c * (tileW + 3) + tileW) {
          if (r * (tileH + 3) < y && y < r * (tileH + 3) + tileH) {
            if (tiles[c][r].state == "e" && (c != boundX || r != boundY)) {
              boundX = c;
              boundY = r;
              tiles[c][r].state = "w";
            } else if (
              tiles[c][r].state == "w" &&
              (c != boundX || r != boundY)
            ) {
              boundX = c;
              boundY = r;
              tiles[c][r].state = "e";
            }
          }
        }
      }
    }
  }
}
function myDown(e) {
  if (finished) {
    canvas.onmousemove = myMove;

    x = e.pageX - canvas.offsetLeft;
    y = e.pageY - canvas.offsetTop;
    for (c = 0; c < tileColumnCount; c++) {
      for (r = 0; r < tileRowCount; r++) {
        if (c * (tileW + 3) < x && x < c * (tileW + 3) + tileW) {
          if (r * (tileH + 3) < y && y < r * (tileH + 3) + tileH) {
            if (tiles[c][r].state == "e") {
              tiles[c][r].state = "w";
              boundX = c;
              boundY = r;
            } else if (tiles[c][r].state == "w") {
              tiles[c][r].state = "e";
              boundX = c;
              boundY = r;
            }
          }
        }
      }
    }
  }
}
const timer = (seconds) => {
  let time = seconds * 1000;
  return new Promise((res) => setTimeout(res, time));
};

function myUp() {
  canvas.onmousemove = null;
}
init();
canvas.onmousedown = myDown;
canvas.onmouseup = myUp;
