import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";

type GradientPreset = {
  id: string;
  name: string;
  stops: string[];
};

type Alignment = "left" | "center" | "right";

const gradientPresets: GradientPreset[] = [
  {
    id: "aurora",
    name: "Aurora",
    stops: ["#5B8BF7", "#9F6DFF", "#ED7B84"],
  },
  {
    id: "sunset",
    name: "Sunset",
    stops: ["#ff7e5f", "#feb47b", "#ffe29f"],
  },
  {
    id: "ocean",
    name: "Ocean",
    stops: ["#00c6ff", "#0072ff", "#001e4d"],
  },
  {
    id: "forest",
    name: "Forest",
    stops: ["#0f9b0f", "#76b852", "#355c24"],
  },
  {
    id: "mono",
    name: "Monochrome",
    stops: ["#1a1a1a", "#121212", "#050505"],
  },
];

const palettes = [
  ["#ffffff", "#f2f2f2", "#b3c7ff"],
  ["#f8f9fa", "#ffd971", "#ffb677"],
  ["#ffffff", "#9afff0", "#2effb4"],
  ["#fff9f0", "#ffcdd7", "#ff87ab"],
];

function createRng(seed: number) {
  let value = seed % 2147483647;
  if (value <= 0) value += 2147483646;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [width, setWidth] = useState(1080);
  const [height, setHeight] = useState(1080);
  const [selectedGradient, setSelectedGradient] = useState(gradientPresets[0]);
  const [shapeCount, setShapeCount] = useState(12);
  const [shapeOpacity, setShapeOpacity] = useState(0.32);
  const [seed, setSeed] = useState(() => Math.floor(Math.random() * 100000));
  const [headline, setHeadline] = useState("Design anything in seconds.");
  const [subline, setSubline] = useState(
    "Play with gradients, shapes, and typography to craft unique visuals."
  );
  const [textAlignment, setTextAlignment] = useState<Alignment>("left");
  const [fontSize, setFontSize] = useState(72);
  const [accentFontSize, setAccentFontSize] = useState(28);
  const [accentColor, setAccentColor] = useState("#f8f9fa");
  const [headlineColor, setHeadlineColor] = useState("#ffffff");

  const selectedPalette = useMemo(() => {
    const index = seed % palettes.length;
    return palettes[index];
  }, [seed]);

  const drawArtwork = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const gradient = ctx.createLinearGradient(0, 0, width, height);
    selectedGradient.stops.forEach((stop, index) => {
      gradient.addColorStop(index / (selectedGradient.stops.length - 1), stop);
    });

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    const rng = createRng(seed);

    const palette = selectedPalette;
    for (let i = 0; i < shapeCount; i += 1) {
      const shapeType = rng();
      const x = rng() * width;
      const y = rng() * height;
      const size = (rng() * 0.6 + 0.2) * Math.min(width, height) * 0.4;
      const rotation = rng() * Math.PI * 2;
      const color = palette[Math.floor(rng() * palette.length)];

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(rotation);
      ctx.globalAlpha = shapeOpacity;
      ctx.fillStyle = color;

      if (shapeType < 0.33) {
        ctx.beginPath();
        ctx.rect(-size / 2, -size / 2, size, size);
        ctx.fill();
      } else if (shapeType < 0.66) {
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.45, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.beginPath();
        ctx.moveTo(0, -size / 2);
        ctx.lineTo(size / 2, size / 2);
        ctx.lineTo(-size / 2, size / 2);
        ctx.closePath();
        ctx.fill();
      }

      ctx.restore();
    }

    const vignetteGradient = ctx.createRadialGradient(
      width / 2,
      height / 2,
      Math.max(width, height) * 0.1,
      width / 2,
      height / 2,
      Math.max(width, height) * 0.75
    );
    vignetteGradient.addColorStop(0, "rgba(0,0,0,0)");
    vignetteGradient.addColorStop(1, "rgba(0,0,0,0.35)");
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(0, 0, width, height);

    ctx.textAlign = textAlignment;
    ctx.fillStyle = headlineColor;
    ctx.font = `700 ${fontSize}px "Syne", "Inter", sans-serif`;
    const textX =
      textAlignment === "left"
        ? width * 0.12
        : textAlignment === "right"
        ? width * 0.88
        : width * 0.5;

    const textY = height * 0.38;
    wrapText(ctx, headline, textX, textY, width * 0.76, fontSize * 1.2);

    ctx.font = `400 ${accentFontSize}px "Inter", sans-serif`;
    ctx.fillStyle = accentColor;
    wrapText(
      ctx,
      subline,
      textX,
      textY + fontSize * 1.6,
      width * 0.62,
      accentFontSize * 1.4
    );

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = Math.max(2, Math.min(width, height) * 0.0025);
    const gridCount = 4;
    for (let i = 1; i < gridCount; i += 1) {
      const offset = (width / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(offset, 0);
      ctx.lineTo(offset, height);
      ctx.stroke();
    }
    for (let i = 1; i < gridCount; i += 1) {
      const offset = (height / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(0, offset);
      ctx.lineTo(width, offset);
      ctx.stroke();
    }
  }, [
    width,
    height,
    selectedGradient,
    shapeCount,
    shapeOpacity,
    seed,
    headline,
    subline,
    textAlignment,
    fontSize,
    accentFontSize,
    accentColor,
    headlineColor,
    selectedPalette,
  ]);

  useEffect(() => {
    drawArtwork();
  }, [drawArtwork]);

  const downloadImage = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "canvascrafter.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    });
  }, []);

  const randomizeArtwork = useCallback(() => {
    setSeed(Math.floor(Math.random() * 100000));
  }, []);

  return (
    <main className="page">
      <section className="sidebar">
        <header className="sidebar-header">
          <h1>CanvasCrafter</h1>
          <p>
            Craft striking hero images instantly. Adjust the palette,
            typography, and layout — then download in one click.
          </p>
        </header>

        <div className="control-group">
          <span className="group-label">Canvas</span>
          <div className="control-row">
            <label className="control">
              <span>Width</span>
              <input
                type="number"
                min={640}
                max={1920}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
              />
            </label>
            <label className="control">
              <span>Height</span>
              <input
                type="number"
                min={640}
                max={1920}
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
              />
            </label>
          </div>
          <div className="control-block">
            <span>Gradient</span>
            <div className="preset-grid">
              {gradientPresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  className={`preset ${
                    preset.id === selectedGradient.id ? "preset-active" : ""
                  }`}
                  style={{
                    background: `linear-gradient(135deg, ${preset.stops.join(
                      ", "
                    )})`,
                  }}
                  onClick={() => setSelectedGradient(preset)}
                >
                  <span>{preset.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="control-group">
          <span className="group-label">Shapes</span>
          <label className="control-block">
            <span>Count: {shapeCount}</span>
            <input
              type="range"
              min={0}
              max={24}
              value={shapeCount}
              onChange={(event) => setShapeCount(Number(event.target.value))}
            />
          </label>
          <label className="control-block">
            <span>Opacity: {shapeOpacity.toFixed(2)}</span>
            <input
              type="range"
              step={0.02}
              min={0}
              max={1}
              value={shapeOpacity}
              onChange={(event) => setShapeOpacity(Number(event.target.value))}
            />
          </label>
          <button
            type="button"
            className="action secondary"
            onClick={randomizeArtwork}
          >
            Shuffle Composition
          </button>
        </div>

        <div className="control-group">
          <span className="group-label">Typography</span>
          <label className="control-block">
            <span>Headline</span>
            <textarea
              value={headline}
              onChange={(event) => setHeadline(event.target.value)}
            />
          </label>
          <label className="control-block">
            <span>Subline</span>
            <textarea
              value={subline}
              onChange={(event) => setSubline(event.target.value)}
            />
          </label>
          <div className="control-row">
            <label className="control">
              <span>Headline Size</span>
              <input
                type="number"
                min={24}
                max={144}
                value={fontSize}
                onChange={(event) => setFontSize(Number(event.target.value))}
              />
            </label>
            <label className="control">
              <span>Body Size</span>
              <input
                type="number"
                min={16}
                max={64}
                value={accentFontSize}
                onChange={(event) =>
                  setAccentFontSize(Number(event.target.value))
                }
              />
            </label>
          </div>
          <div className="control-row">
            <label className="control">
              <span>Headline Color</span>
              <input
                type="color"
                value={headlineColor}
                onChange={(event) => setHeadlineColor(event.target.value)}
              />
            </label>
            <label className="control">
              <span>Body Color</span>
              <input
                type="color"
                value={accentColor}
                onChange={(event) => setAccentColor(event.target.value)}
              />
            </label>
          </div>
          <div className="control-row">
            <span>Align</span>
            <div className="alignment">
              {(["left", "center", "right"] as Alignment[]).map(
                (alignment) => (
                  <button
                    type="button"
                    key={alignment}
                    className={`alignment-button ${
                      textAlignment === alignment ? "alignment-active" : ""
                    }`}
                    onClick={() => setTextAlignment(alignment)}
                  >
                    {alignment}
                  </button>
                )
              )}
            </div>
          </div>
        </div>

        <button
          type="button"
          className="action primary"
          onClick={downloadImage}
        >
          Download PNG
        </button>
      </section>

      <section className="preview">
        <div className="canvas-wrapper">
          <canvas ref={canvasRef} />
        </div>
      </section>
    </main>
  );
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number
) {
  const words = text.split(" ");
  let line = "";
  let offsetY = 0;

  words.forEach((word, index) => {
    const testLine = `${line}${index > 0 ? " " : ""}${word}`;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && index > 0) {
      ctx.fillText(line, x, y + offsetY);
      line = word;
      offsetY += lineHeight;
    } else {
      line = testLine;
    }
  });

  ctx.fillText(line, x, y + offsetY);
}
