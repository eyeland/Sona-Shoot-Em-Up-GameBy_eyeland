// Joystick.js
export default class Joystick {
  constructor(scene, x, y, baseRadius, thumbRadius) {
    this.scene = scene;
    this.x = x;
    this.y = y;
    this.baseRadius = baseRadius;
    this.thumbRadius = thumbRadius;
    this.base = this.scene.add.circle(x, y, baseRadius, 0x888888, 0.5).setDepth(1000).setScrollFactor(0);
    this.thumb = this.scene.add.circle(x, y, thumbRadius, 0xcccccc, 0.8).setDepth(1000).setScrollFactor(0);

    // Event for joystick movement
    this.onMove = new Phaser.Events.EventEmitter();
    // Event for joystick release
    this.onEnd = new Phaser.Events.EventEmitter();

    this.inputActive = false;
    this.pointerId = null;
    this.inputX = 0;
    this.inputY = 0;

    // Enable touch events on the joystick
    this.scene.input.on('pointerdown', this.onPointerDown, this);
    this.scene.input.on('pointermove', this.onPointerMove, this);
    this.scene.input.on('pointerup', this.onPointerUp, this);
  }

  enable() {
    this.base.setVisible(true);
    this.thumb.setVisible(true);
  }

  disable() {
    this.base.setVisible(false);
    this.thumb.setVisible(false);
  }

  onPointerDown(pointer) {
    if (!this.inputActive) {
      const distance = Phaser.Math.Distance.Between(this.x, this.y, pointer.x, pointer.y);
      if (distance <= this.baseRadius) {
        this.inputActive = true;
        this.pointerId = pointer.id;
        this.updateInput(pointer.x, pointer.y);
      }
    }
  }

  onPointerMove(pointer) {
    if (this.inputActive && pointer.id === this.pointerId) {
      this.updateInput(pointer.x, pointer.y);
    }
  }

  onPointerUp(pointer) {
    if (this.inputActive && pointer.id === this.pointerId) {
      this.inputActive = false;
      this.pointerId = null;
      this.inputX = 0;
      this.inputY = 0;
      this.thumb.setPosition(this.x, this.y);
      this.onEnd.emit();
    }
  }

  updateInput(x, y) {
    const distance = Phaser.Math.Distance.Between(this.x, this.y, x, y);
    const angle = Phaser.Math.Angle.Between(this.x, this.y, x, y);
    if (distance > this.baseRadius) {
      x = this.x + Math.cos(angle) * this.baseRadius;
      y = this.y + Math.sin(angle) * this.baseRadius;
    }
    this.thumb.setPosition(x, y);
    this.inputX = Math.cos(angle);
    this.inputY = Math.sin(angle);
    this.onMove.emit({ x: this.inputX, y: this.inputY, angle });
  }

  getMoveVector() {
    return { x: this.inputX, y: this.inputY };
  }
}
