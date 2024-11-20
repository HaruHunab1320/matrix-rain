class RainDrop {
  constructor(
    x,
    y,
    speed,
    brightness,
    fontSize,
    layer,
    chars,
    colors,
    canvasHeight
  ) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.brightness = brightness;
    this.fontSize = fontSize;
    this.layer = layer;
    this.chars = chars;
    this.colors = colors;
    this.canvasHeight = canvasHeight;
    this.trail = [];
    this.trailLength = Math.floor(30 + Math.random() * 15);
    this.fadeOut = 1;
    this.initTrail();
  }

  getColor(char) {
    return this.colors || [0, 255, 70];
  }

  initTrail() {
    this.trail = Array(this.trailLength)
      .fill(null)
      .map((_, i) => {
        const char = this.getRandomChar();
        return {
          char: char,
          nextChar: char,
          transitionProgress: 0,
          color: this.getColor(char),
          brightness: i === 0 ? 1 : Math.pow(0.85, i),
          isHead: i === 0,
        };
      });
  }

  update() {
    this.y += this.speed;

    this.trail.forEach((trailChar, i) => {
      if (
        trailChar.transitionProgress > 0 &&
        trailChar.transitionProgress < 1
      ) {
        trailChar.transitionProgress += 0.1;
        if (trailChar.transitionProgress >= 1) {
          trailChar.char = trailChar.nextChar;
          trailChar.transitionProgress = 0;
        }
      } else if (
        (i === 0 && Math.random() < 0.05) ||
        (i !== 0 && Math.random() < 0.01)
      ) {
        trailChar.nextChar = this.getRandomChar();
        trailChar.transitionProgress = 0.1;
        trailChar.color = this.getColor(trailChar.nextChar);
        if (i === 0) {
          trailChar.brightness = 1;
        }
      }
    });

    if (this.y > this.canvasHeight * 0.9) {
      const fadeOutValue = Math.max(
        0,
        1 - (this.y - this.canvasHeight * 0.9) / (this.canvasHeight * 0.3)
      );
      this.fadeOut = fadeOutValue;
    }
  }

  getRandomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

class ClassicRainDrop extends RainDrop {
  constructor(
    x,
    y,
    speed,
    brightness,
    fontSize,
    layer,
    chars,
    color,
    canvasHeight
  ) {
    super(x, y, speed, brightness, fontSize, layer, chars, color, canvasHeight);
  }

  getColor() {
    return this.colors;
  }
}

class IChingRainDrop extends RainDrop {
  constructor(
    x,
    y,
    speed,
    brightness,
    fontSize,
    layer,
    chars,
    colors,
    canvasHeight
  ) {
    super(
      x,
      y,
      speed,
      brightness,
      fontSize,
      layer,
      chars,
      colors,
      canvasHeight
    );
  }

  getColor(char) {
    return this.colors[char] || [0, 255, 70];
  }
}

class MatrixRain {
  constructor(mode = "classic") {
    this.canvas = document.getElementById("matrix");
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "center";

    // Extended to 10 layers with finer depth separation
    this.layers = [
      { depth: 1.0, size: 36, count: 30, speedRange: [2.6, 3.4] }, // Closest
      { depth: 0.9, size: 32, count: 35, speedRange: [2.4, 3.1] }, // Very near front
      { depth: 0.8, size: 28, count: 40, speedRange: [2.2, 2.8] }, // Near front
      { depth: 0.7, size: 24, count: 50, speedRange: [2.0, 2.6] }, // Mid-front
      { depth: 0.6, size: 20, count: 60, speedRange: [1.8, 2.4] }, // Middle
      { depth: 0.5, size: 18, count: 70, speedRange: [1.6, 2.2] }, // Mid-back
      { depth: 0.4, size: 16, count: 80, speedRange: [1.4, 2.0] }, // Near back
      { depth: 0.3, size: 14, count: 90, speedRange: [1.2, 1.8] }, // Far back
      { depth: 0.2, size: 12, count: 100, speedRange: [1.0, 1.6] }, // Very far back
      { depth: 0.1, size: 10, count: 110, speedRange: [0.8, 1.4] }, // Farthest
    ];

    // Then define modes
    this.modes = {
      classic: {
        chars:
          "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890!@#$%^&*()",
        getColor: () => [0, 255, 70],
        colors: null,
      },
      iching: {
        chars: "☷☶☵☴☳☲☱☰",
        getColor: null,
        colors: {
          "☷": [255, 0, 0], // Earth (000) - Red
          "☶": [255, 127, 0], // Mountain (001) - Orange
          "☵": [255, 255, 0], // Water (010) - Yellow
          "☴": [0, 255, 0], // Wind (011) - Green
          "☳": [0, 255, 255], // Thunder (100) - Cyan
          "☲": [0, 127, 255], // Fire (101) - Blue
          "☱": [127, 0, 255], // Lake (110) - Purple
          "☰": [255, 0, 255], // Heaven (111) - Magenta
        },
      },
    };

    // Initialize raindrops array
    this.raindrops = [];

    // Set initial mode
    this.setMode(mode);

    // Handle resize
    this.resize();
    window.addEventListener("resize", () => this.resize());

    // Start animation
    this.animate();

    // Store base configuration for scaling
    this.baseConfig = {
      speedMultiplier: 1.0,
      widthMultiplier: 1.0,
      layerCount: 10,
    };

    this.setupDevControls();
  }

  setupDevControls() {
    // Toggle dev tools visibility
    const devTools = document.getElementById("devTools");
    const toggleBtn = document.getElementById("toggleDevTools");
    toggleBtn.addEventListener("click", () => {
      devTools.classList.toggle("collapsed");
      toggleBtn.textContent = devTools.classList.contains("collapsed")
        ? "+"
        : "_";
    });

    // Layer control
    const layersControl = document.getElementById("layersControl");
    const layersValue = document.getElementById("layersValue");
    layersControl.addEventListener("input", (e) => {
      this.baseConfig.layerCount = parseInt(e.target.value);
      layersValue.textContent = e.target.value;
      this.updateLayers();
    });

    // Speed control
    const speedControl = document.getElementById("speedControl");
    const speedValue = document.getElementById("speedValue");
    speedControl.addEventListener("input", (e) => {
      this.baseConfig.speedMultiplier = parseFloat(e.target.value);
      speedValue.textContent = e.target.value;
      this.updateLayers();
    });

    // Width control
    const widthControl = document.getElementById("widthControl");
    const widthValue = document.getElementById("widthValue");
    widthControl.addEventListener("input", (e) => {
      this.baseConfig.widthMultiplier = parseFloat(e.target.value);
      widthValue.textContent = e.target.value;
      this.updateLayers();
    });
  }

  updateLayers() {
    const count = this.baseConfig.layerCount;
    const speedMult = this.baseConfig.speedMultiplier;
    const widthMult = this.baseConfig.widthMultiplier;

    this.layers = Array(count)
      .fill(null)
      .map((_, i) => {
        const depth = 1 - i / (count - 1);
        return {
          depth: depth,
          size: Math.round((36 - 26 * (i / (count - 1))) * widthMult),
          count: Math.round(30 + 80 * (i / (count - 1))),
          speedRange: [
            (2.6 - 1.8 * (i / (count - 1))) * speedMult,
            (3.4 - 2.0 * (i / (count - 1))) * speedMult,
          ],
        };
      });

    this.initRain();
  }

  setMode(mode) {
    const selectedMode = this.modes[mode];
    this.currentMode = mode;
    this.chars = selectedMode.chars;
    this.colors = selectedMode.colors;
    this.getColor = selectedMode.getColor;

    // Clear existing raindrops before creating new ones
    this.raindrops = [];
    this.initRain();
  }

  createRaindrop(layer) {
    const columnWidth = layer.size * 1.4;
    const columns = Math.floor(this.canvas.width / columnWidth);
    const column = Math.floor(Math.random() * columns);

    // Add layer-specific offset
    const layerOffset =
      (this.layers.indexOf(layer) * columnWidth * 0.5) % columnWidth;
    const randomOffset = (Math.random() - 0.5) * columnWidth * 0.3; // Add some randomness

    const x = column * columnWidth + layerOffset + randomOffset;
    const y = Math.random() * -this.canvas.height;
    const speed =
      layer.speedRange[0] +
      Math.random() * (layer.speedRange[1] - layer.speedRange[0]);

    if (this.currentMode === "classic") {
      return new ClassicRainDrop(
        x,
        y,
        speed,
        layer.depth,
        layer.size,
        layer,
        this.chars,
        this.getColor(),
        this.canvas.height
      );
    } else {
      return new IChingRainDrop(
        x,
        y,
        speed,
        layer.depth,
        layer.size,
        layer,
        this.chars,
        this.colors,
        this.canvas.height
      );
    }
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.initRain();
  }

  initRain() {
    this.raindrops = [];
    this.layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        this.raindrops.push(this.createRaindrop(layer));
      }
    });
  }

  draw() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.raindrops.forEach((drop) => {
      drop.update();

      drop.trail.forEach((trailChar, index) => {
        this.ctx.font = `bold ${drop.fontSize}px MatrixFont`;

        const color = trailChar.color || [0, 255, 70];
        const [r, g, b] = color;
        const alpha = trailChar.isHead
          ? trailChar.brightness
          : trailChar.brightness * drop.fadeOut;

        if (trailChar.isHead) {
          this.ctx.fillStyle = `rgba(${Math.floor(r + (255 - r) * 0.5)}, 
                                           ${Math.floor(g + (255 - g) * 0.5)}, 
                                           ${Math.floor(b + (255 - b) * 0.5)},
                                           1)`;
        } else {
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        this.ctx.fillText(
          trailChar.char,
          Math.round(drop.x),
          Math.round(drop.y - index * drop.fontSize)
        );

        if (
          trailChar.transitionProgress > 0 &&
          trailChar.transitionProgress < 1
        ) {
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${
            alpha * trailChar.transitionProgress
          })`;
          this.ctx.fillText(
            trailChar.nextChar,
            Math.round(drop.x),
            Math.round(drop.y - index * drop.fontSize)
          );
        }
      });

      if (drop.fadeOut <= 0) {
        Object.assign(drop, this.createRaindrop(drop.layer));
      }
    });
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  toggleMode() {
    this.setMode(this.currentMode === "classic" ? "iching" : "classic");
  }
}

// Initialize with mode selection and store instance globally
window.onload = () => {
  window.matrixInstance = new MatrixRain("classic");
};
