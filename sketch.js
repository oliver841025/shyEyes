let eyes = [];
let bgColor;

function setup() {
  createCanvas(windowWidth, windowHeight);
  bgColor = color(230);

  let y = height / 11;
  let gap = 50;

  eyes.push(new Eye(width / 11 * 10 - gap, y, 80));
  eyes.push(new Eye(width / 11 * 10 + gap, y, 80));
}

function draw() {
  background(bgColor);

  // ---- 計算兩眼中心 ----
  let centerX = (eyes[0].x + eyes[1].x) / 2;
  let centerY = eyes[0].y;

  // ---- 距離 ----
  let dx = mouseX - centerX;
  let dy = mouseY - centerY;
  let distMouse = sqrt(dx * dx + dy * dy);

  // ---- 閉眼區域 ----
  let closeThreshold = 80;
  let shouldClose = distMouse < closeThreshold;

  // ---- 計算方向（正常 = 看滑鼠，害羞 = 反方向） ----
  let angle = atan2(dy, dx);

  // 正常方向
  let normalX = cos(angle);
  let normalY = sin(angle);

  // 害羞方向（反方向）
  let shyX = -normalX;
  let shyY = -normalY;

  // ---- 混合比例（越近越害羞） ----
  let shyAmount = constrain(map(distMouse, 80, width / 2, 1, 0), 0, 1);

  // 混合後方向
  let lookX = lerp(normalX, shyX, shyAmount);
  let lookY = lerp(normalY, shyY, shyAmount);

  // ---- 更新眼睛 ----
  for (let e of eyes) {
    e.update(shouldClose, lookX, lookY);
    e.draw();
  }
}


class Eye {
  constructor(x, y, size) {
    this.x = x;
    this.y = y;
    this.size = size;

    this.lookX = 0;
    this.lookY = 0;

    this.lid = 0; // 0 = open, 1 = closed
  }

  update(close, targetX, targetY) {
    // 平滑眼皮
    let targetLid = close ? 1 : 0;
    this.lid = lerp(this.lid, targetLid, 0.25);

    // 閉眼時瞳孔回中心
    if (close) {
      this.lookX = lerp(this.lookX, 0, 0.1);
      this.lookY = lerp(this.lookY, 0, 0.1);
    } else {
      // 正常看方向
      this.lookX = lerp(this.lookX, targetX, 0.15);
      this.lookY = lerp(this.lookY, targetY, 0.15);
    }
  }

  draw() {
    push();
    translate(this.x, this.y);

    // ===== 眼白 =====
    noStroke();
    fill(255);
    ellipse(0, 0, this.size);

    // ===== 瞳孔（閉眼時會淡出） =====
    let pupilAlpha = map(1 - this.lid, 0, 1, 50, 200);
    fill(0, pupilAlpha);

    let offset = this.size * 0.25;
    let px = this.lookX * offset;
    let py = this.lookY * offset;

    ellipse(px, py, this.size * 0.4);

    // ===== 眼皮（上往下蓋 / 下往上打開） =====
    noStroke();
    fill(bgColor);

    let lidHeight = this.size * this.lid;

    // 上眼皮：從上往下蓋
    rectMode(CENTER);
    rect(0, -this.size / 2 + lidHeight / 2, this.size, lidHeight);

    pop();
  }
}
