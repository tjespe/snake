import React, { useState, useEffect, useMemo, useCallback } from "react";
import useInterval from "./useInterval";

const SnakeGame = () => {
  // The game board, represented as a 2D grid of cells
  const [board, setBoard] = useState([]);
  // The snake, represented as an array of [x, y] coordinates
  const [snake, setSnake] = useState([[0, 0]]);
  // The direction the snake is moving in (0 = up, 1 = right, 2 = down, 3 = left)
  const [direction, setDirection] = useState(1);
  // The current score
  const [score, _setScore] = useState(0);
  // The position of the food, represented as an [x, y] coordinate
  const [food, setFood] = useState([5, 5]);
  // Whether the game is currently running or not
  const [running, setRunning] = useState(false);
  const [avatar, setAvatar] = useState("👶🏽")

  const setScore = useCallback((score) => {
    const prevHigh = Number(localStorage.high);
    if (score > prevHigh || Number.isNaN(prevHigh)) localStorage.high = score;
    _setScore(score);
  }, []);

  // Update the game state
  const update = useCallback(() => {
    // If the game is not running, do nothing
    if (!running) {
      return;
    }

    // Move the snake
    const newSnake = moveSnake(snake, direction);

    // Check if the snake has collided with a wall or itself
    if (checkCollision(newSnake)) {
      // If the snake has collided, end the game
      setRunning(false);
      return;
    }

    // Check if the snake has eaten the food
    if (newSnake[0][0] === food[0] && newSnake[0][1] === food[1]) {
      // If the snake has eaten the food, increase the score and generate a new piece of food
      setScore(score + 1);
      setFood(getRandomFoodPosition());
    } else {
      // If the snake has not eaten the food, remove the last segment of the snake
      newSnake.pop();
    }

    // Set initial high score if unset
    if (!localStorage.high || Number.isNaN(Number(localStorage.high)))
      localStorage.high = 0;

    // Update the state with the new position of the snake
    setSnake(newSnake);
  }, [direction, food, running, score, snake]);

  const startGame = useCallback(() => {
    // Set the initial state of the game board
    setBoard(getEmptyBoard());
    setSnake([[0, 0]]);
    setDirection(1);
    setScore(0);
    setFood(getRandomFoodPosition());
    setRunning(true);

    // Handle key down events
    const handleKeyDown = (event) => {
      // Get the new direction based on the key that was pressed
      let newDirection;
      if (event.key === "ArrowUp" || event.key.toLowerCase() === "w") {
        newDirection = 0;
      } else if (
        event.key === "ArrowRight" ||
        event.key.toLowerCase() === "d"
      ) {
        newDirection = 1;
      } else if (event.key === "ArrowDown" || event.key.toLowerCase() === "s") {
        newDirection = 2;
      } else if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
        newDirection = 3;
      }

      // If a valid key was pressed, update the direction
      if (typeof newDirection !== "undefined") {
        setDirection(newDirection);
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(startGame, []);

  // Set an interval to update the game state every 100 milliseconds
  useInterval(update, 100);

  // Return a new, empty game board
  const getEmptyBoard = () =>
    Array(20)
      .fill(null)
      .map(() => Array(20).fill(null));

  // Return a random position on the game board
  const getRandomFoodPosition = () => [
    Math.floor(Math.random() * 20),
    Math.floor(Math.random() * 20),
  ];

  // Move the snake in the specified direction
  const moveSnake = (snake, direction) => {
    // Make a copy of the snake
    const newSnake = [...snake];

    // Get the head of the snake (the first segment)
    const head = newSnake[0];

    // Calculate the new position of the head based on the current direction
    let newHead;
    if (direction === 0) {
      // If the direction is up, decrease the y-coordinate of the head
      newHead = [head[0], head[1] - 1];
    } else if (direction === 1) {
      // If the direction is right, increase the x-coordinate of the head
      newHead = [head[0] + 1, head[1]];
    } else if (direction === 2) {
      // If the direction is down, increase the y-coordinate of the head
      newHead = [head[0], head[1] + 1];
    } else if (direction === 3) {
      // If the direction is left, decrease the x-coordinate of the head
      newHead = [head[0] - 1, head[1]];
    }

    // Add the new head to the beginning of the snake
    newSnake.unshift(newHead);

    return newSnake;
  };

  // Check if the snake has collided with a wall or itself
  const checkCollision = (snake) => {
    // Get the head of the snake
    const head = snake[0];

    // Check if the snake has collided with a wall (i.e., if the head is outside the boundaries of the board)
    if (head[0] < 0 || head[0] >= 20 || head[1] < 0 || head[1] >= 20) {
      return true;
    }

    // Check if the snake has collided with itself (i.e., if the head is on top of any other segment of the snake)
    for (let i = 1; i < snake.length; i++) {
      if (head[0] === snake[i][0] && head[1] === snake[i][1]) {
        return true;
      }
    }

    return false;
  };

  // Render the game board
  const cellComponents = useMemo(() => {
    return board.map((row, rowIndex) =>
      row.map((cell, cellIndex) => {
        // Check if head of snake
        const [snakeHeadX, snakeHeadY] = snake[0];
        if (rowIndex === snakeHeadY && cellIndex === snakeHeadX) {
          const borderRadius = ["100%", "100%", "100%", "100%"];
          borderRadius[(direction + 2) % 4] = 0;
          borderRadius[(direction + 3) % 4] = 0;
          return (
            <div
              key={`${rowIndex}-${cellIndex}`}
              style={{
                backgroundColor: "rgb(209 148 102)",
                borderRadius:
                  snake.length > 1 ? borderRadius.join(" ") : "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                overflow: "overlay",
              }}
            >
              <div style={{ fontSize: "1.7em", position: "absolute" }}
              onClick={()=>{
                const newAv = prompt("Velg ny avatar");
                if (newAv) setAvatar(newAv);}}
              >{avatar}</div>
            </div>
          );
        }
        // Check if tail of snake
        const [snakeTailX, snakeTailY] = snake.slice(-1)[0];
        if (rowIndex === snakeTailY && cellIndex === snakeTailX) {
          const [secondLastX, secondLastY] = snake.slice(-2)[0];
          const borderRadius = [
            snakeTailX < secondLastX || snakeTailY < secondLastY ? "100%" : "0",
            snakeTailX > secondLastX || snakeTailY < secondLastY ? "100%" : "0",
            snakeTailX > secondLastX || snakeTailY > secondLastY ? "100%" : "0",
            snakeTailX < secondLastX || snakeTailY > secondLastY ? "100%" : "0",
          ];
          return (
            <div
              key={`${rowIndex}-${cellIndex}`}
              style={{
                backgroundColor: "rgb(209 148 102)",
                borderRadius:
                  snake.length > 1 ? borderRadius.join(" ") : "100%",
              }}
            ></div>
          );
        }
        // Check if the current cell is occupied by the snake
        if (snake.some(([x, y]) => rowIndex === y && cellIndex === x))
          return (
            <div
              key={`${rowIndex}-${cellIndex}`}
              style={{ backgroundColor: "rgb(209 148 102)" }}
            />
          );
        const [foodX, foodY] = food;
        if (rowIndex === foodY && cellIndex === foodX)
          return <div key={`${rowIndex}-${cellIndex}`}>🍎</div>;
        return <div key={`${rowIndex}-${cellIndex}`} />;
      })
    );
  }, [board, food, snake]);

  // Restart on any keypress
  document.onkeydown = useCallback(()=>{
    if (!running) startGame();
  }, [running]);

  return (
    <>
      <div style={{ fontSize: "0.6em" }}>High Score: {localStorage.high}</div>
      <div style={{ marginBottom: "1em" }}>Score: {score}</div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(20, 1fr)",
          gridTemplateRows: "repeat(20, 1fr)",
          gridColumnGap: "0px",
          gridRowGap: "0px",
          width: "75vh",
          height: "75vh",
          border: "1px solid",
        }}
      >
        {cellComponents}
      </div>
      <div style={{height: "5vh", fontSize: "0.9em"}}>
        {!running && (
          <>
            You lost! Press any key to restart.
          </>
        )}
      </div>
    </>
  );
};

export default SnakeGame;
