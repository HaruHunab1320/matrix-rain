class RainDrop {
  constructor(x, y, speed, brightness, fontSize, layer, chars) {
    this.x = x;
    this.y = y;
    this.speed = speed;
    this.brightness = brightness;
    this.fontSize = fontSize;
    this.layer = layer;
    this.chars = chars;
    this.trail = [];
    this.trailLength = Math.floor(30 + Math.random() * 15);
    this.initTrail();
  }

  initTrail() {
    this.trail = Array(this.trailLength)
      .fill(null)
      .map((_, i) => ({
        char: this.getRandomChar(),
        brightness: i === 0 ? 1 : Math.pow(0.94, i),
        isHead: i === 0,
      }));
  }

  update() {
    this.y += this.speed;

    for (let i = 1; i < this.trail.length; i++) {
      if (Math.random() < 0.05) {
        this.trail[i].char = this.getRandomChar();
      }
    }

    if (Math.random() < 0.15) {
      this.trail[0].char = this.getRandomChar();
    }
  }

  getRandomChar() {
    return this.chars[Math.floor(Math.random() * this.chars.length)];
  }
}

class MatrixRain {
  constructor() {
    this.canvas = document.getElementById("matrix");
    this.ctx = this.canvas.getContext("2d", { alpha: false });

    this.ctx.textBaseline = "top";
    this.ctx.textAlign = "center";

    this.chars =
      "ｱｲｳｴｵｶｷｸｹｺｻｼｽｾｿﾀﾁﾂﾃﾄﾅﾆﾇﾈﾉﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝ1234567890!@#$%^&*()";

    this.layers = [
      { depth: 1.0, size: 20, count: 75, speedRange: [1.2, 1.8] },
      { depth: 0.7, size: 16, count: 100, speedRange: [1.0, 1.4] },
      { depth: 0.4, size: 14, count: 150, speedRange: [0.8, 1.2] },
    ];

    this.raindrops = [];

    this.resize();
    window.addEventListener("resize", () => this.resize());

    this.animate();
  }

  resize() {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    this.initRain();
  }

  createRaindrop(layer) {
    const columnWidth = layer.size * 1.2;
    const columns = Math.floor(this.canvas.width / columnWidth);
    const column = Math.floor(Math.random() * columns);
    const x = column * columnWidth;
    const y = Math.random() * -this.canvas.height;
    const speed =
      layer.speedRange[0] +
      Math.random() * (layer.speedRange[1] - layer.speedRange[0]);
    return new RainDrop(
      x,
      y,
      speed,
      layer.depth,
      layer.size,
      layer,
      this.chars
    );
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

        if (trailChar.isHead) {
          this.ctx.fillStyle = "rgb(50, 255, 100)";
          this.ctx.fillText(
            trailChar.char,
            Math.round(drop.x),
            Math.round(drop.y - index * drop.fontSize)
          );
        } else {
          const brightness = trailChar.brightness * drop.brightness;
          const greenValue = Math.floor(255 * brightness);
          this.ctx.fillStyle = `rgb(0, ${greenValue}, 0)`;
          this.ctx.fillText(
            trailChar.char,
            Math.round(drop.x),
            Math.round(drop.y - index * drop.fontSize)
          );
        }
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

window.onload = () => new MatrixRain();
