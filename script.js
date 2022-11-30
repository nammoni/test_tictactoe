let origBoard;  
let huPlayer ='O'; //đại diện cho con ng
let aiPlayer = 'X'; // đại diện AI
const winCombos =[ // tạo mảng các mối kết hợp cho chiến thắng theo đường thẳng và chéo
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 4, 8],
  [6, 4, 2],
  [2, 5, 8],
  [1, 4, 7],
  [0, 3, 6]
];

const cells = document.querySelectorAll('.cell'); //đặt biến để gọi các ô trong bảng
startGame();

//chọn X hoặc Y (X đi trước)
function selectSym(sym){
  huPlayer = sym;
  aiPlayer = sym==='O' ? 'X' :'O';
  origBoard = Array.from(Array(9).keys()); // tạo mảng 9 phần tử từ 0 - 8 tương ứng 9 ô
  for (let i = 0; i < cells.length; i++) //gọi tham chiếu đi qua từng ô
  {
    cells[i].addEventListener('click', turnClick, false);
  }
  if (aiPlayer === 'X') {
    turn(bestSpot(),aiPlayer);
  }
  document.querySelector('.selectSym').style.display = "none";
}

//bắt đầu
function startGame() {
  document.querySelector('.endgame').style.display = "none";
  document.querySelector('.endgame .text').innerText ="";
  document.querySelector('.selectSym').style.display = "block";
  for (let i = 0; i < cells.length; i++) {
    cells[i].innerText = '';
    cells[i].style.removeProperty('background-color');
  }
}

function turnClick(square) //các lượt click của người chơi
{
  if (typeof origBoard[square.target.id] ==='number') {
    turn(square.target.id, huPlayer);
    if (!checkWin(origBoard, huPlayer) && !checkTie())  
      turn(bestSpot(), aiPlayer);
  }
}

function turn(squareId, player) 
{
  origBoard[squareId] = player;
  document.getElementById(squareId).innerHTML = player;
  let gameWon = checkWin(origBoard, player);
  if (gameWon) gameOver(gameWon);
  checkTie();
}

function checkWin(board, player) {
  // sử dụng redue đi qua mọi phần tử của mảng và trả về một giá trị
  //a là giá trị cuối cùng và khởi tạo bộ tích lũy thành mảng trống
  //e là phần tử trong bảng mà ta đang vòng qua từng chỉ mục
  //i : chúng ta sẽ lấy mảng tích lũy và thêm chỉ mục vào bảng (khi e == player)
  let plays = board.reduce((a, e, i) => (e === player) ? a.concat(i) : a, []);
  let gameWon = null;
  //so sánh lặp qua các chỉ mục với obj wincombos 
  for (let [index, win] of winCombos.entries()) 
  {
    //kiểm tra xem chỉ mục có phù hợp điều kiện win chưa và dừng
    if (win.every(elem => plays.indexOf(elem) > -1)) {
      gameWon = {index: index, player: player};
      break;
    }
  }
  return gameWon;
}

//end game
function gameOver(gameWon){
  for (let index of winCombos[gameWon.index]) {
    document.getElementById(index).style.backgroundColor = 
      gameWon.player === huPlayer ? "blue" : "red";
  }
  for (let i=0; i < cells.length; i++) {
    cells[i].removeEventListener('click', turnClick, false);
  }
  declareWinner(gameWon.player === huPlayer ? "Bạn thắng!" : "Bạn thua");
}

//người chiến thắng
function declareWinner(who) {
  document.querySelector(".endgame").style.display = "block";
  document.querySelector(".endgame .text").innerText = who;
}

//Các ô trống
function emptySquares() {
  return origBoard.filter((elm, i) => i===elm);
}
  
//tìm điểm tốt để đi cho trình AL chơi
function bestSpot(){
  return minimax(origBoard, aiPlayer).index;
}

//Kiểm tra kết quả Hòa
function checkTie() {
  if (emptySquares().length === 0){
    for (cell of cells) {
      cell.style.backgroundColor = "green";
      cell.removeEventListener('click',turnClick, false);
    }
    declareWinner("Hòa");
    return true;
  } 
  return false;
}

//Thuật toán minimax (sử dụng giúp cho AI không thể bị đánh bại)
function minimax(newBoard, player) 
{
  var availSpots = emptySquares(newBoard);

  // kiểm tra các trạng thái đầu cuối như thắng, thua và hòa
  // và trả về một giá trị tương ứng
  //nếu o thắng trả về -10
  if (checkWin(newBoard, huPlayer)) {
    return {score: -10};
  }
  //nếu X thắng trả về 10 
  else if (checkWin(newBoard, aiPlayer)) {
    return {score: 10};
  } 
  //nếu độ dài của mảng điểm có sẵn là 0 nghĩa là không có chỗ để chơi và trò chơi Hòa => trả về 0
  else if (availSpots.length === 0) {
    return {score: 0};
  }
  //tạo mảng thu thập điểm từ vị trí trống để đánh giá
  var moves = []; // tạo mảng lặp qua các vị trí trống trong khi thu thập từng chỉ số
          // di chuyển và điểm trong một đối tượng có tên Move
  for (let i = 0; i < availSpots.length; i ++) {
    var move = {};
    //đặt chỉ mục của vị trí trống đó là được lưu dưới dạng một số trogng điểm được tận dụng
    move.index = newBoard[availSpots[i]];
    //đặt vị trí trống trên bảng mới cho trình phát hiện tại 
    newBoard[availSpots[i]] = player;
    
    if (player === aiPlayer)
    //lưu trữ đối tượng từ kết quả gọi hàm minimax
      move.score = minimax(newBoard, huPlayer).score;
    else
       move.score =  minimax(newBoard, aiPlayer).score;
       //đặt lại bảng mới về vị trí trước đó và đẩy đối tượng di chuyển vào mảng di chuyển
    newBoard[availSpots[i]] = move.index; 
    if ((player === aiPlayer && move.score === 10) || (player === huPlayer && move.score === -10))
      return move;
    else 
      moves.push(move);
  }
  //đánh giá nước đi tốt nhất trong mảng di chuyển mà nó nên chọn với mức điểm cao nhất khi Al
  // đang chơi và nước đi có điểm thấp nhất khi con người đang chơi
  let bestMove, bestScore;
  if (player === aiPlayer) {
    //đặt một biến là điểm tốt nhất thành một số rất thấp
    bestScore = -1000;
    //lặp qua mảng nước đi nếu nước đi có điểm cao hơn điểm tốt nhất để lưu trữ nước đi đó
    for(let i = 0; i < moves.length; i++) {
      if (moves[i].score > bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  } else {
    //đặt một biến là điểm tốt nhất thành một số cao
      bestScore = 1000;
    //lặp qua mảng nước đi nếu nước đi có điểm tháp hơn điểm thấp nhất để lưu trữ nước đi đó
      for(let i = 0; i < moves.length; i++) {
      if (moves[i].score < bestScore) {
        bestScore = moves[i].score;
        bestMove = i;
      }
    }
  }
  //trả về đối tượng được lưu trữ trong nước đi tốt nhất
  return moves[bestMove];
}