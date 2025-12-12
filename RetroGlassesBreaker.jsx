import React, { useState, useEffect, useRef } from 'react';

const RetroGlassesBreaker = () => {
  const canvasRef = useRef(null);
  const [gameState, setGameState] = useState('email'); // email, playing, levelComplete, gameOver, won
  const [email, setEmail] = useState('');
  const [level, setLevel] = useState(1);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);
  const [emailError, setEmailError] = useState('');
  const requestRef = useRef(null);

  const CANVAS_WIDTH = 800;
  const CANVAS_HEIGHT = 600;

  const PADDLE_WIDTH = 110;
  const PADDLE_HEIGHT = 20;

  const BALL_SIZE = 22;

  const BRICK_COLS = 8;
  const BRICK_WIDTH = 90;
  const BRICK_HEIGHT = 30;
  const BRICK_PADDING = 5;
  const BRICK_OFFSET_TOP = 80;
  const BRICK_OFFSET_LEFT = 35;

  const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  const confettiRef = useRef([]);

  const gameRef = useRef({
    paddle: { x: CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2, y: CANVAS_HEIGHT - 40, width: PADDLE_WIDTH, height: PADDLE_HEIGHT },
    ball: { x: CANVAS_WIDTH / 2, y: CANVAS_HEIGHT / 2, dx: 4, dy: -4, size: BALL_SIZE },
    bricks: [],
    keys: {},
    mouseX: CANVAS_WIDTH / 2,
    ballLaunched: false,
    touchX: null,
    showBrokenGlasses: false,
    brokenPieces: []
  });

  /** MOBILE + PC */
  useEffect(() => {
    const canvas = canvasRef.current;

    const handleTouchMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const touch = e.touches[0];
      const x = touch.clientX - rect.left;
      gameRef.current.mouseX = x;
    };

    if (canvas) {
      canvas.addEventListener("touchstart", handleTouchMove);
      canvas.addEventListener("touchmove", handleTouchMove);
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener("touchstart", handleTouchMove);
        canvas.removeEventListener("touchmove", handleTouchMove);
      }
    };
  }, []);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleEmailSubmit = () => {
    if (!validateEmail(email)) {
      setEmailError("Veuillez entrer une adresse email valide");
      return;
    }
    setEmailError("");
    setGameState("playing");
    initGame();
  };

  /** INIT BRICKS */
  const initBricks = () => {
    const bricks = [];
    const rows = 5 + level;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        const health = level === 4 ? 2 : 1;

        bricks.push({
          x: BRICK_OFFSET_LEFT + c * (BRICK_WIDTH + BRICK_PADDING),
          y: BRICK_OFFSET_TOP + r * (BRICK_HEIGHT + BRICK_PADDING),
          width: BRICK_WIDTH,
          height: BRICK_HEIGHT,
          health,
          maxHealth: health,
          visible: true,
          letter: LETTERS[Math.floor(Math.random() * LETTERS.length)]
        });
      }
    }
    return bricks;
  };

  /** INIT GAME */
  const initGame = () => {
    const g = gameRef.current;

    g.paddle.x = CANVAS_WIDTH / 2 - PADDLE_WIDTH / 2;

    g.ball = {
      x: CANVAS_WIDTH / 2,
      y: CANVAS_HEIGHT - 60,
      dx: 4 + level * 0.4,
      dy: -(4 + level * 0.4),
      size: BALL_SIZE
    };

    g.bricks = initBricks();
    g.ballLaunched = false;
  };
import React, { useEffect, useRef, useState } from "react";

export default function RetroGlassesBreaker() {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [win, setWin] = useState(false);
  const [started, setStarted] = useState(false);

  // ------- STYLE ÉCRAN ENTIER -------
  const containerStyle = {
    width: "100%",
    height: "100vh",
    background: "#0d0d0d",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    overflow: "hidden",
    color: "white",
    fontFamily: "Pixel, monospace",
  };

  // ------ STYLE TEXTE ÉCRAN ------
  const centerText = {
    position: "absolute",
    top: "45%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    color: "#fff",
    fontSize: "32px",
    textShadow: "0 0 6px #ff00ff",
    zIndex: 10,
  };

  // ------- VARIABLES JEU -------
  let ball = { x: 150, y: 300, dx: 3, dy: -3, r: 8 };
  let paddle = { x: 120, y: 460, w: 150, h: 12 };
  let glasses = [];
  let animatingBreak = false;
  let shards = [];
  let confetti = [];

  // ---- INIT LUNETTES À CASSER ----
  function createGlasses() {
    const arr = [];
    const startX = 80;
    const y = 120;
    const spacing = 180;

    for (let i = 0; i < 3; i++) {
      arr.push({
        x: startX + i * spacing,
        y,
        w: 140,
        h: 60,
        broken: false,
        crack: 0,
      });
    }
    return arr;
  }

  // ---- ANIMATION VERRE QUI SE CASSE ----
  function breakGlass(g) {
    g.broken = true;
    g.crack = 1;

    // Génère les éclats
    for (let i = 0; i < 20; i++) {
      shards.push({
        x: g.x + g.w / 2,
        y: g.y + g.h / 2,
        dx: (Math.random() - 0.5) * 6,
        dy: (Math.random() - 0.5) * 6,
        alpha: 1,
      });
    }
  }

  // ---- ANIMATION CONFETTIS POUR LA VICTOIRE ----
  function launchConfetti() {
    for (let i = 0; i < 200; i++) {
      confetti.push({
        x: Math.random() * 360,
        y: -20,
        dx: (Math.random() - 0.5) * 3,
        dy: Math.random() * 4 + 2,
        size: Math.random() * 6 + 3,
      });
    }
  }
  // ---- DESSIN DE LA PAIRE DE LUNETTES ----
  function drawGlasses(ctx, g) {
    ctx.lineWidth = 6;
    ctx.strokeStyle = g.broken ? "#aa0000" : "#33ccff";

    // Monture
    ctx.strokeRect(g.x, g.y, g.w, g.h);

    // Pont
    ctx.beginPath();
    ctx.moveTo(g.x + g.w / 2, g.y);
    ctx.lineTo(g.x + g.w / 2, g.y + g.h);
    ctx.stroke();

    // Si cassée → fissure
    if (g.broken) {
      ctx.strokeStyle = "#ff0000";
      ctx.beginPath();
      ctx.moveTo(g.x + g.w / 2, g.y + g.h / 2);
      ctx.lineTo(g.x + g.w / 2 - 20, g.y + g.h / 2 - 20);
      ctx.lineTo(g.x + g.w / 2 + 25, g.y + g.h / 2 - 10);
      ctx.lineTo(g.x + g.w / 2 - 10, g.y + g.h / 2 + 25);
      ctx.stroke();
    }
  }

  // ---- DESSIN DES ÉCLATS DE VERRE ----
  function drawShards(ctx) {
    shards.forEach((s) => {
      s.x += s.dx;
      s.y += s.dy;
      s.dy += 0.2;
      s.alpha -= 0.01;

      ctx.fillStyle = `rgba(255,255,255,${s.alpha})`;
      ctx.fillRect(s.x, s.y, 3, 3);
    });
    shards = shards.filter((s) => s.alpha > 0);
  }

  // ---- DESSIN DES CONFETTIS ----
  function drawConfetti(ctx) {
    confetti.forEach((c) => {
      c.x += c.dx;
      c.y += c.dy;

      ctx.fillRect(c.x, c.y, c.size, c.size);
    });
  }

  // ---- BOUCLE DU JEU ----
  function gameLoop(ctx) {
    if (!started || gameOver || win) return;

    ctx.clearRect(0, 0, 360, 500);

    // Dessin ball
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();

    // Déplacement ball
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Rebonds
    if (ball.x < ball.r || ball.x > 360 - ball.r) ball.dx *= -1;
    if (ball.y < ball.r) ball.dy *= -1;

    // Perdu
    if (ball.y > 500) {
      setGameOver(true);
      animatingBreak = true;
    }

    // Paddle
    ctx.fillStyle = "#33ff99";
    ctx.fillRect(paddle.x, paddle.y, paddle.w, paddle.h);

    // Collisions paddle
    if (
      ball.y + ball.r >= paddle.y &&
      ball.x >= paddle.x &&
      ball.x <= paddle.x + paddle.w
    ) {
      ball.dy *= -1;
      ball.y = paddle.y - ball.r;
    }

    // Dessin lunettes + collisions
    glasses.forEach((g) => {
      drawGlasses(ctx, g);

      if (
        !g.broken &&
        ball.x > g.x &&
        ball.x < g.x + g.w &&
        ball.y - ball.r < g.y + g.h &&
        ball.y + ball.r > g.y
      ) {
        ball.dy *= -1;
        breakGlass(g);

        // Check win
        if (glasses.every((x) => x.broken)) {
          setWin(true);
          launchConfetti();
        }
      }
    });

    // Dessins supplémentaires
    drawShards(ctx);
    if (win) drawConfetti(ctx);

    requestAnimationFrame(() => gameLoop(ctx));
  }
  // ---- CONTROLES ----
  useEffect(() => {
    function handleKey(e) {
      if (!started) return;

      if (e.key === "ArrowLeft") paddle.x -= 30;
      if (e.key === "ArrowRight") paddle.x += 30;

      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x > 360 - paddle.w) paddle.x = 360 - paddle.w;
    }

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [started]);

  // ---- CONTROLES TACTILES ----
  useEffect(() => {
    function touchMove(e) {
      if (!started) return;

      const rect = canvasRef.current.getBoundingClientRect();
      const touchX = e.touches[0].clientX - rect.left;

      paddle.x = touchX - paddle.w / 2;
      if (paddle.x < 0) paddle.x = 0;
      if (paddle.x > 360 - paddle.w) paddle.x = 360 - paddle.w;
    }

    window.addEventListener("touchmove", touchMove);
    return () => window.removeEventListener("touchmove", touchMove);
  }, [started]);

  // ---- LANCEMENT DU JEU ----
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    glasses = createGlasses();

    function start() {
      setStarted(true);
      requestAnimationFrame(() => gameLoop(ctx));
    }

    canvas.addEventListener("click", start, { once: true });

    return () => canvas.removeEventListener("click", start);
  }, []);

  // ---- ÉCRAN GAME OVER ----
  function GameOverScreen() {
    return (
      <div style={centerText}>
        <div style={{ fontSize: "42px", marginBottom: "10px" }}>
          🕶️💥
        </div>
        <div style={{ fontSize: "32px" }}>Oups… Game Over !</div>
        <button
          style={{
            marginTop: "30px",
            padding: "12px 25px",
            fontSize: "20px",
            background: "#ff0066",
            color: "white",
            border: "none",
            borderRadius: "8px",
            textShadow: "0 0 4px black",
            cursor: "pointer",
          }}
          onClick={() => window.location.reload()}
        >
          Rejouer
        </button>
      </div>
    );
  }

  // ---- ÉCRAN VICTOIRE ----
  function WinScreen() {
    return (
      <div style={centerText}>
        <div style={{ fontSize: "40px", marginBottom: "10px" }}>🎉</div>
        <div style={{ fontSize: "30px" }}>Bravo ! Toutes les lunettes sont cassées !</div>
        <button
          style={{
            marginTop: "30px",
            padding: "12px 25px",
            fontSize: "20px",
            background: "#33ff99",
            border: "none",
            color: "#000",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => window.location.reload()}
        >
          Rejouer
        </button>
      </div>
    );
  }

  // ---- RENDER ----
  return (
    <div style={containerStyle}>
      {!started && !gameOver && !win && (
        <div style={centerText}>
          <div style={{ fontSize: "30px", marginBottom: "10px" }}>🕹️ Tap pour jouer</div>
          <div style={{ fontSize: "22px", opacity: 0.7 }}>Casse toutes les lunettes !</div>
        </div>
      )}

      {gameOver && <GameOverScreen />}
      {win && <WinScreen />}

      <canvas
        ref={canvasRef}
        width={360}
        height={500}
        style={{
          border: "3px solid #33ccff",
          borderRadius: "10px",
          background: "#111",
        }}
      ></canvas>
    </div>
  );
}
