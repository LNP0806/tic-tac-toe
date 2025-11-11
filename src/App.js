import { useState } from 'react';
import "./App.css"

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? 'highlight' : ''}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo?.winner;
  const winningLine = winnerInfo?.line || [];

  function handleClick(i) {
    if (winner || squares[i]) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? 'X' : 'O';
    onPlay(nextSquares, i);
  }

  const board = [];
  for (let row = 0; row < 3; row++) {
    const rowSquares = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      rowSquares.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          highlight={winningLine.includes(index)}
        />
      );
    }
    board.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  let status;
  if (winner) {
    status = 'Winner: ' + winner;
  } else if (squares.every(Boolean)) {
    status = 'Draw!';
  } else {
    status = 'Next player: ' + (xIsNext ? 'X' : 'O');
  }

  return (
    <>
      <div className="status">{status}</div>
      {board}
    </>
  );
}

export default function Game() {
  const [history, setHistory] = useState([
    { squares: Array(9).fill(null), location: null },
  ]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [showResult, setShowResult] = useState(false);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

  const winnerInfo = calculateWinner(currentSquares);
  const winner = winnerInfo?.winner;
  const isDraw = !winner && currentSquares.every(Boolean);

  function handlePlay(nextSquares, index) {
    const location = [Math.floor(index / 3) + 1, (index % 3) + 1];
    const nextHistory = history
      .slice(0, currentMove + 1)
      .concat([{ squares: nextSquares, location }]);
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function resetGame() {
    setHistory([{ squares: Array(9).fill(null), location: null }]);
    setCurrentMove(0);
    setShowResult(false);
  }

  if ((winner || isDraw) && !showResult) {
    setTimeout(() => setShowResult(true), 300);
  }

  const moves = history.map((step, move) => {
    const location = step.location ? `(${step.location[0]}, ${step.location[1]})` : '';
    let description;
    if (move === currentMove) {
      description = `You are at move #${move} ${location}`;
      return (
        <li key={move}>
          <span>{description}</span>
        </li>
      );
    }
    description = move ? `Go to move #${move} ${location}` : 'Go to game start';
    return (
      <li key={move}>
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          Sort {isAscending ? 'Descending' : 'Ascending'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>

       {showResult && (
        <div className="result-overlay">
          <div className="result-box">
            {winner ? (
              <h2>Winner: {winner}</h2>
            ) : (
              <h2>Draw!</h2>
            )}
            <button className="restart-btn" onClick={resetGame}>
              Bắt đầu lại
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
