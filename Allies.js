class Allies extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, texture, {offsetX, offsetY}) {
		super(scene, x, y, texture);
		this.scene = scene;
		this.scene.add.existing(this);
		scene.physics.world.enable(this);
		this.setScale(0.1)

		this.offsetX = offsetX;
		this.offsetY = offsetY;
		
		this.alliesHealth = 100;
		this.maxHealth = 100;
		this.healthBarWidth = 120; // Set the width of the health bar (adjust as needed)
		this.followSpeed = 5

		this.hitTint = 0xFF0000; // Red tint
		this.normalTint = 0xFFFFFF; // White tint (no tint)

		this.createAlliesHealthBar()
	}

		createAlliesHealthBar() {
		// Create the health bar background (black)
		this.alliesHealthBarBackground = this.scene.add.graphics();
		// Create the health bar itself (red)
		this.alliesHealthBar = this.scene.add.graphics();
	
	}

	applyHitEffect() {
		// Set the tint to red
		this.setTint(this.hitTint);

		// Create a timer to reset the tint after a short delay
		this.scene.time.delayedCall(200, () => {
			// Reset the tint to normal after 500 milliseconds (adjust as needed)
			this.setTint(this.normalTint);
		});
	}

	//change to updatePlayerHealthBar
	updateAlliesHealthBar() {
		this.alliesHealthBarBackground.clear();
		this.alliesHealthBarBackground.fillStyle(0x000000); // Set the background color of the health bar
		this.alliesHealthBarBackground.fillRect(
			this.x - 55,
			this.y + 55, // Adjust the Y position of the health bar as needed
			this.healthBarWidth,
			10 // Set the height of the health bar (adjust as needed)
		);

		const alliesHealthBarFillWidth = (this.alliesHealth / this.maxHealth) * this.healthBarWidth; //total 200
		this.alliesHealthBar.clear();
		this.alliesHealthBar.fillStyle(0xff0000); // Set the fill color of the health bar (e.g., red)
		this.alliesHealthBar.fillRect(
			this.x - 55,
			this.y + 55, // Adjust the Y position of the health bar as needed
			alliesHealthBarFillWidth,
			10 // Set the height of the health bar (adjust as needed)
		);
	}

	followPlayer() {
		const angle = Phaser.Math.Angle.Between(this.x, this.y, this.scene.player.x, this.scene.player.y);
		// Move the minion towards the player
		this.scene.physics.moveTo(this, this.scene.player.x + this.offsetX, this.scene.player.y + this.offsetY, this.followSpeed, 300);
		this.rotation = angle - 90;
	}

	getBulletById(id) {
		return this.scene.bullets.find(bullet => bullet.id === id);
	}
	
	collisionDetection() {
		this.scene.physics.world.overlap(this, this.scene.bullets, (ally, bullet) => this.onAlliesBulletCollision(ally, this.getBulletById(bullet.id)), null, this);
	}

	onAlliesBulletCollision(ally, bullet) {
		const damageAmout = 10;
		this.applyHitEffect();
		ally.decreaseHealth(damageAmout);
		this.decreaseHealth()
		bullet.destroy();
	}

	decreaseHealth() {
		this.alliesHealth -= 10;
		// Ensure health doesn't go below 0
		if (this.alliesHealth < 0) {
			this.alliesHealth = 0;
		}
	}

	update() {
		this.updateAlliesHealthBar();
		this.collisionDetection()
		this.followPlayer()
	}

}