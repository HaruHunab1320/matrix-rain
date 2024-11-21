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
      if (i === 0) {
        if (
          trailChar.transitionProgress > 0 &&
          trailChar.transitionProgress < 1
        ) {
          trailChar.transitionProgress += 0.1;
          if (trailChar.transitionProgress >= 1) {
            trailChar.char = trailChar.nextChar;
            trailChar.transitionProgress = 0;
            trailChar.nextChar = this.getRandomChar();
            trailChar.transitionProgress = 0.1;
            trailChar.color = this.getColor(trailChar.nextChar);
            trailChar.brightness = 1;
          }
        } else {
          trailChar.nextChar = this.getRandomChar();
          trailChar.transitionProgress = 0.1;
          trailChar.color = this.getColor(trailChar.nextChar);
          trailChar.brightness = 1;
        }
      } else if (i !== 0 && Math.random() < 0.01) {
        trailChar.nextChar = this.getRandomChar();
        trailChar.transitionProgress = 0.1;
        trailChar.color = this.getColor(trailChar.nextChar);
      }

      if (
        i !== 0 &&
        trailChar.transitionProgress > 0 &&
        trailChar.transitionProgress < 1
      ) {
        trailChar.transitionProgress += 0.1;
        if (trailChar.transitionProgress >= 1) {
          trailChar.char = trailChar.nextChar;
          trailChar.transitionProgress = 0;
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

    // Initialize text bounds first
    this.centerText = document.getElementById("centerText");
    this.textBounds = this.centerText.getBoundingClientRect();

    // Rest of your constructor code...
    this.baseConfig = {
      speedMultiplier: 2.5,
      widthMultiplier: 0.9,
      layerCount: 15,
      dispersal: 2.0,
    };

    this.layers = this.generateLayers(this.baseConfig.layerCount);
    this.modes = {
      classic: {
        chars: "☰☱☲☳☴☵☶☷",
        getColor: () => [0, 255, 70],
        colors: null,
      },
      iching: {
        chars: "☷☶☵☴☳☲☱☰",
        getColor: null,
        colors: {
          "☷": [255, 0, 0],
          "☶": [255, 127, 0],
          "☵": [255, 255, 0],
          "☴": [0, 255, 0],
          "☳": [0, 255, 255],
          "☲": [0, 127, 255],
          "☱": [127, 0, 255],
          "☰": [255, 0, 255],
        },
      },
    };

    this.raindrops = [];
    this.setMode(mode);
    this.setupDevControls();

    // Handle resize
    this.resize();
    window.addEventListener("resize", () => {
      this.resize();
      this.updateTextBounds();
    });

    // Start animation
    this.animate();
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

    // Layer control - only recreate if adding/removing layers
    const layersControl = document.getElementById("layersControl");
    const layersValue = document.getElementById("layersValue");
    layersControl.addEventListener("input", (e) => {
      const newCount = parseInt(e.target.value);
      layersValue.textContent = e.target.value;
      if (newCount !== this.layers.length) {
        this.baseConfig.layerCount = newCount;
        this.updateLayers(); // Only called when layer count changes
      }
    });

    // Speed control - update speed directly
    const speedControl = document.getElementById("speedControl");
    const speedValue = document.getElementById("speedValue");
    speedControl.addEventListener("input", (e) => {
      this.baseConfig.speedMultiplier = parseFloat(e.target.value);
      speedValue.textContent = e.target.value;
      this.updateRaindropsProperties(); // New method
    });

    // Width control - update size directly
    const widthControl = document.getElementById("widthControl");
    const widthValue = document.getElementById("widthValue");
    widthControl.addEventListener("input", (e) => {
      this.baseConfig.widthMultiplier = parseFloat(e.target.value);
      widthValue.textContent = e.target.value;
      this.updateRaindropsProperties(); // New method
    });

    // Add dispersal control
    const dispersalControl = document.getElementById("dispersalControl");
    const dispersalValue = document.getElementById("dispersalValue");
    dispersalControl.addEventListener("input", (e) => {
      this.baseConfig.dispersal = parseFloat(e.target.value);
      dispersalValue.textContent = e.target.value;
      this.updateRaindropsProperties();
    });
  }

  updateRaindropsProperties() {
    const speedMult = this.baseConfig.speedMultiplier;
    const widthMult = this.baseConfig.widthMultiplier;
    const dispersal = this.baseConfig.dispersal;

    this.layers.forEach((layer, i) => {
      // Update layer properties
      layer.size = Math.round(
        (36 - 26 * (i / (this.layers.length - 1))) * widthMult
      );

      // Update speed ranges
      const baseMinSpeed = 2.6 - 1.8 * (i / (this.layers.length - 1));
      const baseMaxSpeed = 3.4 - 2.0 * (i / (this.layers.length - 1));
      layer.speedRange = [baseMinSpeed * speedMult, baseMaxSpeed * speedMult];

      // Update existing raindrops for this layer
      this.raindrops
        .filter((drop) => drop.layer === layer)
        .forEach((drop) => {
          // Directly multiply current speed by multiplier
          drop.speed *= speedMult;

          // Clamp speed within the new range
          drop.speed = Math.max(
            layer.speedRange[0],
            Math.min(layer.speedRange[1], drop.speed)
          );

          // Update fontSize
          drop.fontSize = layer.size;

          // Reposition some drops if dispersal changes significantly
          if (Math.random() < 0.1) {
            // 10% chance to reposition
            const dispersalRange = this.canvas.height * 0.5 * dispersal;
            drop.y = Math.random() * -dispersalRange;
          }
        });
    });
  }

  updateLayers() {
    // Generate new layers configuration
    const newLayers = this.generateLayers(this.baseConfig.layerCount);

    // Clear existing raindrops
    this.raindrops = [];

    // Set new layers and initialize rain
    this.layers = newLayers;
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
    const columnWidth = layer.size * 2.5;
    const columns = Math.floor(this.canvas.width / columnWidth);
    const column = Math.floor(Math.random() * columns);

    const layerIndex = this.layers.indexOf(layer);
    const layerOffset = (layerIndex * columnWidth * 0.5) % columnWidth;

    const randomOffset = (Math.random() - 0.5) * columnWidth * 0.2;

    const x = column * columnWidth + layerOffset + randomOffset;

    const baseDispersalRange = this.canvas.height * 0.5;
    const dispersalRange = baseDispersalRange * this.baseConfig.dispersal;
    const y = Math.random() * -dispersalRange;

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
    const dispersalRange = this.canvas.height * 0.5 * this.baseConfig.dispersal;

    this.layers.forEach((layer) => {
      for (let i = 0; i < layer.count; i++) {
        const drop = this.createRaindrop(layer);
        // Distribute initial positions across the dispersal range
        drop.y = Math.random() * -dispersalRange;
        this.raindrops.push(drop);
      }
    });
  }

  draw() {
    this.ctx.fillStyle = "rgba(0, 0, 0, 1)";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // Create a separate canvas for the text reveal effect
    const textCanvas = document.createElement("canvas");
    textCanvas.width = this.canvas.width;
    textCanvas.height = this.canvas.height;
    const textCtx = textCanvas.getContext("2d");

    // First draw the text in bright green
    textCtx.fillStyle = "#00ff45"; // Matrix green
    textCtx.font = "700 48px 'Red Hat Display'";
    textCtx.textAlign = "center";
    textCtx.textBaseline = "middle";
    textCtx.fillText(
      "ONEIROCOM",
      this.canvas.width / 2,
      this.canvas.height / 2 - 25
    );

    // Add SYSTEMS text
    textCtx.font = "700 36px 'Red Hat Display'";
    textCtx.fillText(
      "SIMULATIONS",
      this.canvas.width / 2,
      this.canvas.height / 2 + 25
    );

    // Create a mask canvas
    const maskCanvas = document.createElement("canvas");
    maskCanvas.width = this.canvas.width;
    maskCanvas.height = this.canvas.height;
    const maskCtx = maskCanvas.getContext("2d");

    // Draw the rain drops to create the mask
    this.raindrops.forEach((drop) => {
      drop.update();

      drop.trail.forEach((trailChar, index) => {
        const x = Math.round(drop.x);
        const y = Math.round(drop.y - index * drop.fontSize);

        // Only create mask where rain intersects with text bounds
        const isOverText =
          x >= this.textBounds.left &&
          x <= this.textBounds.right &&
          y >= this.textBounds.top &&
          y <= this.textBounds.bottom;

        if (isOverText) {
          // Draw circular mask for more organic reveal
          const radius = drop.fontSize / 2;
          maskCtx.beginPath();
          maskCtx.arc(x, y, radius, 0, Math.PI * 2);
          maskCtx.fillStyle = `rgba(255, 255, 255, ${
            trailChar.brightness * 0.7
          })`;
          maskCtx.fill();
        }

        // Draw the normal rain character
        this.ctx.font = `${drop.fontSize}px MatrixFont`;
        const color = trailChar.color || [0, 255, 70];
        const [r, g, b] = color;
        const alpha = trailChar.isHead
          ? trailChar.brightness
          : trailChar.brightness * drop.fadeOut;

        if (trailChar.isHead) {
          this.ctx.fillStyle = `rgba(${Math.floor(r + (255 - r) * 0.5)}, 
                                         ${Math.floor(g + (255 - g) * 0.5)}, 
                                         ${Math.floor(b + (255 - b) * 0.5)},
                                         ${alpha})`;
        } else {
          this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }

        this.ctx.fillText(trailChar.char, x, y);
      });

      if (drop.fadeOut <= 0) {
        Object.assign(drop, this.createRaindrop(drop.layer));
      }
    });

    // Apply the mask to the text
    textCtx.globalCompositeOperation = "destination-in";
    textCtx.drawImage(maskCanvas, 0, 0);

    // Draw the final masked text
    this.ctx.globalCompositeOperation = "lighter";
    this.ctx.drawImage(textCanvas, 0, 0);
    this.ctx.globalCompositeOperation = "source-over";
  }

  animate() {
    this.draw();
    requestAnimationFrame(() => this.animate());
  }

  toggleMode() {
    this.setMode(this.currentMode === "classic" ? "iching" : "classic");
  }

  // New method to generate layers
  generateLayers(count) {
    return Array(count)
      .fill(null)
      .map((_, i) => {
        const depth = 1 - i / (count - 1);
        return {
          depth: depth,
          size: Math.round(
            (32 - 20 * (i / (count - 1))) * this.baseConfig.widthMultiplier
          ),
          count: Math.round(40 + 100 * (i / (count - 1))), // More drops per layer
          speedRange: [
            (3.0 - 2.0 * (i / (count - 1))) * this.baseConfig.speedMultiplier,
            (3.8 - 2.2 * (i / (count - 1))) * this.baseConfig.speedMultiplier,
          ],
        };
      });
  }

  updateTextBounds() {
    const bounds = this.centerText.getBoundingClientRect();
    this.textBounds = {
      left: bounds.left,
      right: bounds.right,
      top: bounds.top,
      bottom: bounds.bottom,
    };
  }
}

// Initialize with mode selection and store instance globally
window.onload = () => {
  window.matrixInstance = new MatrixRain("classic");
};
