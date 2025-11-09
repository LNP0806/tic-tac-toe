import { useState } from "react";
import "./App.css";

function Square({ value, onSquareClick, highlight }) {
  return (
    <button
      className={`square ${highlight ? "highlight" : ""}`}
      onClick={onSquareClick}
    >
      {value}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo?.winner;

  function handleClick(i) {
    if (squares[i] || winner) return;
    const nextSquares = squares.slice();
    nextSquares[i] = xIsNext ? "X" : "O";
    onPlay(nextSquares, i);
  }

  const board = [];
  for (let row = 0; row < 3; row++) {
    const rowSquares = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      const highlight = winnerInfo?.line?.includes(index);
      rowSquares.push(
        <Square
          key={index}
          value={squares[index]}
          onSquareClick={() => handleClick(index)}
          highlight={highlight}
        />
      );
    }
    board.push(
      <div key={row} className="board-row">
        {rowSquares}
      </div>
    );
  }

  return <div>{board}</div>;
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
    const nextHistory = history
      .slice(0, currentMove + 1)
      .concat({
        squares: nextSquares,
        location: [Math.floor(index / 3), index % 3],
      });
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
    const location = step.location
      ? `(${step.location[0]}, ${step.location[1]})`
      : "";
    const description =
      move === 0 ? "Go to game start" : `Go to move #${move} ${location}`;
    return (
      <li key={move}>
        {move === currentMove ? (
          <span>You are at move #{move}</span>
        ) : (
          <button onClick={() => jumpTo(move)}>{description}</button>
        )}
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : [...moves].reverse();

  return (
    <div className="game">
      <div className="game-board">
        <strong className="title">Tic-Tac-Toe</strong>
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>

      <div className="game-info">
        <button onClick={() => setIsAscending(!isAscending)}>
          Sort {isAscending ? "Descending" : "Ascending"}
        </button>
        <ol>{sortedMoves}</ol>
      </div>

      {/* Overlay kết quả */}
      {showResult && (
        <div className="result-overlay">
          <div className="result-box">
            {winner ? (
              <h2>Winner: {winner}</h2>
            ) : (
              <h2>Draw!</h2>
            )}
            <button className="restart-btn" onClick={resetGame}>
              Restart
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
  for (const [a, b, c] of lines) {
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return { winner: squares[a], line: [a, b, c] };
    }
  }
  return null;
}
