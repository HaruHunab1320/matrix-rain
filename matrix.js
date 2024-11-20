class RainDrop {
  constructor(x, y, speed, brightness, fontSize, layer, chars, colors) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.brightness = brightness;
    this.fontSize = fontSize;
    this.layer = layer;
    this.chars = chars;
    this.colors = colors;
    this.trail = [];
    this.trailLength = Math.floor(30 + Math.random() * 15);
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
          color: this.getColor(char),
          brightness: i === 0 ? 1 : Math.pow(0.94, i),
          isHead: i === 0,
        };
      });
  }

  update() {
    this.y += this.speed;

    this.trail.forEach((trailChar, i) => {
      if (
        (i === 0 && Math.random() < 0.15) ||
        (i !== 0 && Math.random() < 0.05)
      ) {
        const newChar = this.getRandomChar();
        trailChar.char = newChar;
        trailChar.color = this.getColor(newChar);
      }
    });
  }

  getRandomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

class ClassicRainDrop extends RainDrop {
  constructor(x, y, speed, brightness, fontSize, layer, chars, color) {
    super(x, y, speed, brightness, fontSize, layer, chars, color);
  }

  getColor() {
    return this.colors;
  }
}

class IChingRainDrop extends RainDrop {
  constructor(x, y, speed, brightness, fontSize, layer, chars, colors) {
    super(x, y, speed, brightness, fontSize, layer, chars, colors);
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

    // Define layers first
    this.layers = [
      { depth: 1.0, size: 34, count: 40, speedRange: [1.3, 1.9] },
      { depth: 0.85, size: 30, count: 50, speedRange: [1.2, 1.7] },
      { depth: 0.7, size: 26, count: 65, speedRange: [1.1, 1.5] },
      { depth: 0.55, size: 22, count: 80, speedRange: [0.9, 1.3] },
      { depth: 0.4, size: 18, count: 100, speedRange: [0.8, 1.1] },
      { depth: 0.25, size: 14, count: 120, speedRange: [0.6, 0.9] },
      { depth: 0.15, size: 10, count: 150, speedRange: [0.4, 0.7] },
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
    const x = column * columnWidth;
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
        this.getColor()
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
        this.colors
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
    this.ctx.fillStyle = "rgb(0, 0, 0)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.raindrops.forEach((drop) => {
      drop.update();

      drop.trail.forEach((trailChar, index) => {
        this.ctx.font = `bold ${drop.fontSize}px MatrixFont`;

        const color = trailChar.color || [0, 255, 70]; // Default to green if undefined
        const [r, g, b] = color;
        const brightness = trailChar.brightness * drop.brightness;

        if (trailChar.isHead) {
          const brightR = Math.floor(r + (255 - r) * 0.5);
          const brightG = Math.floor(g + (255 - g) * 0.5);
          const brightB = Math.floor(b + (255 - b) * 0.5);
          this.ctx.fillStyle = `rgb(${brightR}, ${brightG}, ${brightB})`;
        } else {
          this.ctx.fillStyle = `rgb(${Math.floor(r * brightness)}, 
                                  ${Math.floor(g * brightness)}, 
                                  ${Math.floor(b * brightness)})`;
        }

        this.ctx.fillText(
          trailChar.char,
          Math.round(drop.x),
          Math.round(drop.y - index * drop.fontSize)
        );
      });

      if (drop.y > this.canvas.height + 50) {
        Object.assign(drop, this.createRaindrop(drop.layer));
      }
    });
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }
}

// Initialize with mode selection
window.onload = () => {
  const matrix = new MatrixRain("classic"); // or 'iching'

  // Example of mode switching (you can bind this to a button or key press)
  window.toggleMode = () => {
    matrix.setMode(matrix.currentMode === "classic" ? "iching" : "classic");
  };
};
