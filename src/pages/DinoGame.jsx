import { useEffect, useRef, useState } from "react";
import dinoPng from "../assets/dino.png";
import cactusPng from "../assets/cactus.png";

// Hash sederhana untuk validasi
function simpleHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

// Daftar kata anak hewan (Indo -> Inggris)
const animals = [
  // 🐶 Mamalia
  { indo: "kucing", eng: "cat" },
  { indo: "anjing", eng: "dog" },
  { indo: "sapi", eng: "cow" },
  { indo: "kambing", eng: "goat" },
  { indo: "domba", eng: "sheep" },
  { indo: "kuda", eng: "horse" },
  { indo: "keledai", eng: "donkey" },
  { indo: "babi", eng: "pig" },
  { indo: "harimau", eng: "tiger" },
  { indo: "singa", eng: "lion" },
  { indo: "beruang", eng: "bear" },
  { indo: "serigala", eng: "wolf" },
  { indo: "gajah", eng: "elephant" },
  { indo: "rusa", eng: "deer" },
  { indo: "kelinci", eng: "rabbit" },
  { indo: "tikus", eng: "mouse" },
  { indo: "monyet", eng: "monkey" },

  // 🐦 Burung & unggas
  { indo: "ayam", eng: "chicken" },
  { indo: "bebek", eng: "duck" },
  { indo: "angsa", eng: "goose" },
  { indo: "kalkun", eng: "turkey" },
  { indo: "merpati", eng: "pigeon" },
  { indo: "burung hantu", eng: "owl" },
  { indo: "elang", eng: "eagle" },
  { indo: "burung pipit", eng: "sparrow" },

  // 🦎 Reptil & amfibi
  { indo: "buaya", eng: "crocodile" },
  { indo: "kura-kura", eng: "turtle" },
  { indo: "ular", eng: "snake" },
  { indo: "katak", eng: "frog" },
  { indo: "kadal", eng: "lizard" },

  // 🐟 Laut
  { indo: "ikan", eng: "fish" },
  { indo: "salmon", eng: "salmon" },
  { indo: "udang", eng: "shrimp" },
  { indo: "kepiting", eng: "crab" },
  { indo: "paus", eng: "whale" },
  { indo: "lumba-lumba", eng: "dolphin" },
  { indo: "hiu", eng: "shark" },
  { indo: "gurita", eng: "octopus" },

  // 🦋 Serangga
  { indo: "kupu-kupu", eng: "butterfly" },
  { indo: "lebah", eng: "bee" },
  { indo: "semut", eng: "ant" },
  { indo: "nyamuk", eng: "mosquito" },
  { indo: "belalang", eng: "grasshopper" },

  // 🍎 Buah umum
  { indo: "apel", eng: "apple" },
  { indo: "jeruk", eng: "orange" },
  { indo: "pisang", eng: "banana" },
  { indo: "mangga", eng: "mango" },
  { indo: "nanas", eng: "pineapple" },
  { indo: "anggur", eng: "grape" },
  { indo: "pepaya", eng: "papaya" },
  { indo: "semangka", eng: "watermelon" },
  { indo: "melon", eng: "melon" },
  { indo: "jambu", eng: "guava" },
  { indo: "stroberi", eng: "strawberry" },
  { indo: "kiwi", eng: "kiwi" },
  { indo: "pir", eng: "pear" },
  { indo: "kelapa", eng: "coconut" },
  { indo: "salak", eng: "snake fruit" },
  { indo: "sirsak", eng: "soursop" },
  { indo: "markisa", eng: "passion fruit" },
];

export default function DinoGame({ resetKey }) {
  const canvasRef = useRef(null);
  const [gameOver, setGameOver] = useState(false);
  const [started, setStarted] = useState(false);
  const [answer, setAnswer] = useState("");
  const [currentWord, setCurrentWord] = useState("");
  const [validHash, setValidHash] = useState(0);
  const [errorMsg, setErrorMsg] = useState("");

  // Generate kata acak & hash valid
  useEffect(() => {
    const word = animals[Math.floor(Math.random() * animals.length)];
    setCurrentWord(word.indo);
    setValidHash(simpleHash(word.eng));
    setAnswer("");
  }, [resetKey]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    const dinoImg = new Image();
    dinoImg.src = dinoPng;
    const cactusImg = new Image();
    cactusImg.src = cactusPng;

    let dino = { x: 50, y: 150, width: 44, height: 47, dy: 0, jumping: false };
    const gravity = 0.6;
    const jumpPower = -12;
    const ground = 200;

    let obstacles = [];
    let score = 0;
    let isGameOver = false;
    let frameCount = 0;
    let gameSpeed = 2;

    function jump() {
      if (!dino.jumping) {
        dino.dy = jumpPower;
        dino.jumping = true;
      }
    }

    function restart() {
      dino = { ...dino, y: 150, dy: 0, jumping: false };
      obstacles = [];
      score = 0;
      isGameOver = false;
      setGameOver(false);
      frameCount = 0;
      gameSpeed = 2;
      setStarted(false);
      setAnswer("");
    }

    function drawDino() {
      if (dinoImg.complete)
        ctx.drawImage(dinoImg, dino.x, dino.y, dino.width, dino.height);
      else ctx.fillRect(dino.x, dino.y, dino.width, dino.height);
    }

    function drawObstacle(o) {
      if (cactusImg.complete)
        ctx.drawImage(cactusImg, o.x, o.y, o.width, o.height);
      else ctx.fillRect(o.x, o.y, o.width, o.height);
    }

    function drawGround() {
      ctx.strokeStyle = "#555";
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let x = 0; x < canvas.width; x++) {
        const y = ground - Math.sin((x + frameCount * 5) * 0.01) * 3;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.fillStyle = "#0a0";
      for (let x = 0; x < canvas.width; x += 10) {
        const h = Math.random() * 2;
        const y = ground - Math.sin((x + frameCount * 5) * 0.01) * 3;
        ctx.fillRect(x, y - h, 2, h);
      }
    }

    function loop() {
      if (!started || isGameOver) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawGround();

      dino.y += dino.dy;
      dino.dy += gravity;
      if (dino.y > 150) (dino.y = 150), (dino.dy = 0), (dino.jumping = false);

      drawDino();

      frameCount++;
      if (frameCount % 60 === 0)
        obstacles.push({
          x: canvas.width,
          y: ground - 30,
          width: 30,
          height: 30,
        });

      gameSpeed = 2 + score * 0.01;

      obstacles.forEach((o) => {
        o.x -= gameSpeed;
        drawObstacle(o);
        if (
          dino.x < o.x + o.width &&
          dino.x + dino.width > o.x &&
          dino.y < o.y + o.height &&
          dino.y + dino.height > o.y
        ) {
          isGameOver = true;
          setGameOver(true);
          ctx.fillStyle = "red";
          ctx.textAlign = "center";
          ctx.font = "28px monospace";
          ctx.fillText("GAME OVER", canvas.width / 2, canvas.height / 2 - 20);
          ctx.font = "16px monospace";
          ctx.fillText(
            "Tekan Enter untuk restart",
            canvas.width / 2,
            canvas.height / 2 + 20
          );
        }
      });

      obstacles = obstacles.filter((o) => o.x + o.width > 0);

      ctx.fillStyle = "black";
      ctx.font = "12px monospace";
      ctx.textAlign = "right";
      ctx.fillText("Score: " + score, canvas.width - 10, 20);
      score++;

      requestAnimationFrame(loop);
    }

    function handleKey(e) {
      if (!started) {
        if (e.key === "Backspace") setAnswer((a) => a.slice(0, -1));
        else if (e.key.length === 1) setAnswer((a) => a + e.key);
      }
      if (e.code === "Space" && !isGameOver && started) jump();
      if (e.code === "Enter" && isGameOver) restart();
    }

    function handleClickStartScreen(e) {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      if (answer && simpleHash(answer.trim().toLowerCase()) === validHash) {
        if (
          x >= canvas.width / 2 - 40 &&
          x <= canvas.width / 2 + 40 &&
          y >= canvas.height / 2 + 40 &&
          y <= canvas.height / 2 + 70
        ) {
          setStarted(true);
          canvas.removeEventListener("click", handleClickStartScreen);
          loop();
        }
      } else {
        setErrorMsg("Yah.. jawaban salah!");
      }
    }

    function drawStartScreen() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.textAlign = "center";
      ctx.fillStyle = "black";
      ctx.font = "16px monospace";
      ctx.fillText(
        `Terjemahkan dalam bahasa inggris: '${currentWord}'`,
        canvas.width / 2,
        canvas.height / 2 - 40
      );

      ctx.fillStyle = "white";
      ctx.fillRect(canvas.width / 2 - 80, canvas.height / 2 - 10, 160, 30);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(canvas.width / 2 - 80, canvas.height / 2 - 10, 160, 30);
      ctx.fillStyle = "black";
      ctx.font = "14px monospace";
      ctx.fillText(answer, canvas.width / 2, canvas.height / 2 + 10);

      if (answer && simpleHash(answer.trim().toLowerCase()) === validHash) {
        ctx.fillStyle = "#007bff";
        ctx.fillRect(canvas.width / 2 - 40, canvas.height / 2 + 40, 80, 30);
        ctx.fillStyle = "white";
        ctx.font = "14px monospace";
        ctx.fillText("START", canvas.width / 2, canvas.height / 2 + 60);
      }

      canvas.removeEventListener("click", handleClickStartScreen);
      canvas.addEventListener("click", handleClickStartScreen);
    }

    if (!started) drawStartScreen();
    else loop();

    window.addEventListener("keydown", handleKey);

    return () => {
      window.removeEventListener("keydown", handleKey);
      canvas.removeEventListener("click", handleClickStartScreen);
    };
  }, [resetKey, started, answer, validHash, currentWord]);

  return (
    <div className="flex flex-col items-center">
      <canvas
        ref={canvasRef}
        width={600}
        height={250}
        className="border-1 border-gray-400 rounded-xl bg-orange-200/20"
      />
      {errorMsg && (
        <div className="mt-3 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex justify-between items-center w-80">
          <span>{errorMsg}</span>
          <button onClick={() => setErrorMsg("")} className="ml-4 p-1">
            X
          </button>
        </div>
      )}

      {started && (
        <p className="text-xs mt-2 text-gray-500">
          Tekan <b>Space</b> untuk lompat, <b>Enter</b> untuk restart
        </p>
      )}
    </div>
  );
}
