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
