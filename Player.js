class Player extends Phaser.GameObjects.Sprite {
	constructor(scene, x, y, texture) {
		super(scene, x, y, texture);
		this.scene = scene
		scene.add.existing(this);
		scene.physics.world.enable(this);
		this.setScale(0.1);
		this.setDepth(1);
		this.body.setCircle(430, 80, 0);
		//this.body.setDamping(true); // Enable damping to simulate drag
		this.body.setDrag(250); // Set drag value between 0 (no drag) and 1 (full drag)
		console.log(this)

		this.playerHealth = 100; // Initialize player's health to 100
		this.maxHealth = 100; // Set the maximum health value (adjust as needed)
		this.healthBarWidth = 200; // Set the width of the health bar (adjust as needed)
		
		

		// Prevent player from moving out of the screen
		 this.halfPlayerWidth = 15; // Half of the player's width (30/2)
		 this.halfPlayerHeight = 15; // Half of the player's height (30/2)
		 this.minX = this.halfPlayerWidth;
		 this.minY = this.halfPlayerHeight;
		 this.maxX = scene.sys.game.config.width - this.halfPlayerWidth;
		 this.maxY = scene.sys.game.config.height - this.halfPlayerHeight;
		this.hitTint = 0xFF0000; // Red tint
		this.normalTint = 0xFFFFFF; // White tint (no tint)

		// Create the health bar
		this.createPlayerHealthBar();

		this.x = Phaser.Math.Clamp(this.x, this.minX, this.maxX);
		this.y = Phaser.Math.Clamp(this.y, this.minY, this.maxY);
	}

	applyHitEffect() {
		// Set the tint to red
		this.setTint(this.hitTint);

		// Create a timer to reset the tint after a short delay
		this.scene.time.delayedCall(500, () => {
			// Reset the tint to normal after 500 milliseconds (adjust as needed)
			this.setTint(this.normalTint);
		});
	}

	createPlayerHealthBar() {
		// Create the health bar background (black)
		this.playerHealthBarBackground = this.scene.add.graphics();
		// Create the health bar itself (red)
		this.playerHealthBar = this.scene.add.graphics();
	
	}

	decreaseHealth(amount) {
		this.playerHealth -= amount;

		// Ensure health doesn't go below 0
		if (this.playerHealth < 0) {
			this.playerHealth = 0;
		}
	}

	onAlliesBulletCollision(player, bullet) {
		const damageAmount = 10;
		this.applyHitEffect()
		this.decreaseHealth(damageAmount)
		bullet.destroy();
	}

	getBulletById(id) {
		return this.scene.bullets.find(bullet => bullet.id === id);
	}


	collisionDetection() {
		this.scene.physics.world.overlap(this, this.scene.bullets, (player, bullet) => this.onAlliesBulletCollision(player, this.getBulletById(bullet.id)), null, this);
	}


	//change to updatePlayerHealthBar
	updatePlayerHealthBar() {
		this.playerHealthBarBackground.clear();
		this.playerHealthBarBackground.fillStyle(0x000000); // Set the background color of the health bar
		this.playerHealthBarBackground.fillRect(
			this.x - 90,
			this.y + 50, // Adjust the Y position of the health bar as needed
			this.healthBarWidth,
			20 // Set the height of the health bar (adjust as needed)
		);

		const playerHealthBarFillWidth = (this.playerHealth / this.maxHealth) * this.healthBarWidth; //total 200
		this.playerHealthBar.clear();
		this.playerHealthBar.fillStyle(0xff0000); // Set the fill color of the health bar (e.g., red)
		this.playerHealthBar.fillRect(
			this.x - 90,
			this.y + 50, // Adjust the Y position of the health bar as needed
			playerHealthBarFillWidth,
			20 // Set the height of the health bar (adjust as needed)
		);
	}

	updateLocationLock() {
		

		this.body.x = Phaser.Math.Clamp(this.body.x, this.minX, this.maxX - 70);
		this.body.y = Phaser.Math.Clamp(this.body.y, this.minY, this.maxY - 120);
	}

	update() {
		this.updateLocationLock();
		this.updatePlayerHealthBar();
		this.collisionDetection()

		const cursors = this.scene.input.keyboard.createCursorKeys();
			const acceleration = 600; // Adjust as needed

			if (cursors.left.isDown) {
				this.body.setAccelerationX(-acceleration);
			} else if (cursors.right.isDown) {
				this.body.setAccelerationX(acceleration);
			} else {
				this.body.setAccelerationX(0);
			}

			if (cursors.up.isDown) {
				this.body.setAccelerationY(-acceleration);
			} else if (cursors.down.isDown) {
				this.body.setAccelerationY(acceleration);
			} else {
				this.body.setAccelerationY(0);
			
		}

		const joyStickX = this.scene.joyStick.GetX();
		const joyStickY = this.scene.joyStick.GetY();

		if (joyStickX != 0 || joyStickY != 0) {
		this.body.setAccelerationX(this.scene.joyStick.GetX() * 7);
		this.body.setAccelerationY(-this.scene.joyStick.GetY() * 7);
		}
	}

	
	
}
