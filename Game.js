

class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: "GameScene" });
		this.enemyCounter = 0;
		// Add a flag to track if the game is running
		this.isGameRunning = false;

		// Initialize player speed
		this.playerSpeed = 4; // Adjust the player speed as needed

		this.shootingTimers = [];

		this.playerHealth = 100; // Initialize player's health to 100
		this.maxHealth = 100; // Set the maximum health value (adjust as needed)
		this.healthBarWidth = 200; // Set the width of the health bar (adjust as needed)
		this.bullets = []
		this.timesHit = 0 //testing
		this.uniqueIdentifer = 0
	}

	preload() {

		// Load your assets here (e.g., player sprite, background, etc.)
		this.load.image("background", "0.png");
		this.load.image("sona", "sona.png");
		this.load.image("enemy", "enemy-mumu.png");
		this.load.image("bullet", "rocket.png");
		this.load.image("minion", "malphite.png");

	}

	create() {
		// Call the custom resize function initially to set up the game size
		// this.resizeGame();

		// Create the game canvas
		this.gameCanvas = this.sys.game.canvas;
		this.joyStick = new JoyStick('joyDiv');

		// Add the start button
		this.startButton = this.add
			.text(
				this.sys.game.config.width / 2,
				this.sys.game.config.height / 2,
				"Start Game",
				{ fontSize: "24px", fill: "#fff" }
			)
			.setOrigin(0.5)
			.setInteractive();

		// Add the pause button (initially hidden)
		this.pauseButton = this.add
			.text(20, 20, "Pause", { fontSize: "18px", fill: "#fff" })
			.setInteractive();
		this.pauseButton.visible = false;

		// Add the resume button (initially hidden)
		this.resumeButton = this.add
			.text(
				this.sys.game.config.width / 2,
				this.sys.game.config.height / 2,
				"Resume",
				{ fontSize: "24px", fill: "#fff" }
			)
			.setOrigin(0.5)
			.setInteractive();
		this.resumeButton.visible = false;

		// Set up click event listeners for the buttons
		this.startButton.on("pointerdown", () => this.startGame());
		this.pauseButton.on("pointerdown", () => this.pauseGame());
		this.resumeButton.on("pointerdown", () => this.resumeGame());

		// Set the depth to control rendering order
		this.startButton.setDepth(1);
		this.pauseButton.setDepth(1);
		this.resumeButton.setDepth(1);

		//create player
		this.player = this.add.sprite(
			this.sys.game.config.width * 0.5,
			this.sys.game.config.height * 0.8,
			"sona"
		);
		this.player.setScale(0.1);
		this.player.setDepth(1);
		// Enable physics for the player (assuming Arcade Physics)
		this.physics.world.enable(this.player);
		this.player.body.setCircle(430, 80, 0);

		this.healthBarBackground = this.add.graphics();
		// Create the health bar itself
		this.healthBar = this.add.graphics();
		this.updateHealthBar(); // Set the initial width of the health bar

		//create minions
		this.minion = this.physics.add.sprite(100, 100, 'minion');
		this.minion.setScale(0.1); // Adjust the scale as needed

		this.minionOne = this.physics.add.sprite(100, 100, 'minion');
		this.minionOne.setScale(0.1); // Adjust the scale as needed

		this.minionTwo = this.physics.add.sprite(100, 100, 'minion');
		this.minionTwo.setScale(0.1); // Adjust the scale as needed




		this.cursors = this.input.keyboard.createCursorKeys();
		// Create the scrolling background
		this.background = this.add.tileSprite(
			0,
			0,
			this.sys.game.config.width,
			this.sys.game.config.height,
			"background"
		);
		this.background.setOrigin(0, 0).setDepth(-1);

		// Slow scrolling speed (change this value to adjust the speed)
		this.scrollSpeed = 1.5;

		// Create an enemy group to hold all enemy instances
		this.enemies = this.physics.add.group();

		this.physics.world.enable(this.player); // Enable physics for the player
		this.physics.world.enable(this.enemies); // Enable physics for the enemy group
		this.physics.world.enable(this.bullets); // Enable physics for the player's bullets group


	}

	startGame() {
		// Hide the start button and show the pause button
		this.startButton.visible = false;
		this.pauseButton.visible = true;

		// Set focus on the game canvas to capture keyboard events
		this.gameCanvas.focus();

		// Set up an enemy shooting timer
		this.shootingTimer = this.time.addEvent({
			delay: 1500, // Adjust this value to control the shooting interval (in milliseconds)
			callback: this.enemyShoot,
			callbackScope: this,
			loop: true, // Set to true to make the timer repeat indefinitely
		});

		// ... Add other game initialization logic ...

		// Set the game as running
		this.isGameRunning = true;
	}

	pauseGame() {
		// Pause the game
		this.isGameRunning = false;
		this.pauseButton.visible = false;
		this.resumeButton.visible = true;

		// ... Add logic to pause the game, stop enemies, timers, etc.
		// Pause all shooting timers
		this.shootingTimers.forEach((timer) => {
			timer.paused = true;
		});

		// ... Additional pause logic ...
	}

	resumeGame() {
		// Resume the game
		this.isGameRunning = true;
		this.resumeButton.visible = false;
		this.pauseButton.visible = true;

		// ... Add logic to resume the game, start enemies, timers, etc.
		this.shootingTimers.forEach((timer) => {
			timer.paused = false;
		});

		// ... Additional resume logic ...
	}

	generateUniqueId() {
		return this.uniqueIdentifer++
	}



	onPlayerBulletCollision(player, bullet) {
		// Decrease the player's health by a certain amount (adjust as needed)
		const damageAmount = 10;
		this.decreasePlayerHealth(damageAmount);
		// Increment timesHit and show the updated number
		this.timesHit++;
		console.log(`times hit ${this.timesHit}`);
		// Destroy the bullet when it hits the player
		bullet.destroy();
	}

	update() {
		// Player movement logic

		if (this.isGameRunning) {
			const playerSpeed = 5;
			const leftRightSpeed =
				playerSpeed *
				(this.cursors.left.isDown ? -1 : this.cursors.right.isDown ? 1 : 0);
			const upDownSpeed =
				playerSpeed *
				(this.cursors.up.isDown ? -1 : this.cursors.down.isDown ? 1 : 0);

			// ----Oncreen Controller 

			// Call the handleJoystickInput function to start the animation loop
			this.handleJoystickInput();

			// Check for collisions between the player and enemy bullets
			this.physics.world.overlap(this.player, this.bullets, (player, bullet) => this.onPlayerBulletCollision(player, this.getBulletById(bullet.id)), null, this);


			// ---------

			// Update player position
			this.player.x += leftRightSpeed;
			this.player.y += upDownSpeed;

			// Update Healthbars
			this.updateHealthBar()

			// Prevent player from moving out of the screen
			const halfPlayerWidth = 15; // Half of the player's width (30/2)
			const halfPlayerHeight = 15; // Half of the player's height (30/2)
			const minX = halfPlayerWidth;
			const minY = halfPlayerHeight;
			const maxX = this.sys.game.config.width - halfPlayerWidth;
			const maxY = this.sys.game.config.height - halfPlayerHeight;

			this.player.x = Phaser.Math.Clamp(this.player.x, minX, maxX);
			this.player.y = Phaser.Math.Clamp(this.player.y, minY, maxY);

			// Update the minion's position to follow the player
			const speed = 15; // Adjust the speed as needed
			const angle = Phaser.Math.Angle.Between(this.minion.x, this.minion.y, this.player.x, this.player.y);
			const angleOne = Phaser.Math.Angle.Between(this.minionOne.x, this.minionOne.y, this.player.x, this.player.y);
			const angleTwo = Phaser.Math.Angle.Between(this.minionTwo.x, this.minionTwo.y, this.player.x, this.player.y);
			// Move the minion towards the player
			this.physics.moveTo(this.minion, this.player.x, this.player.y - 150, speed, 300);
			this.physics.moveTo(this.minionOne, this.player.x - 150, this.player.y - 40, speed, 300);
			this.physics.moveTo(this.minionTwo, this.player.x + 150, this.player.y - 40, speed, 300);

			// Rotate the minion to face the player (optional)
			this.minion.rotation = angle - 90;

			// Scroll the background from top to bottom
			this.background.tilePositionY -= this.scrollSpeed;
		}
	}

	getBulletById(id) {
		return this.bullets.find(bullet => bullet.id === id);
	}

	enemyShoot() {
		if (this.isGameRunning) {
			// Stop creating new enemies if the enemy counter reaches three
			if (this.enemyCounter >= 5) {
				return;
			}

			// Increment the enemy counter
			this.enemyCounter++;
			// Create an enemy sprite at a random position on the screen
			const enemyX = Phaser.Math.Between(50, this.sys.game.config.width - 50);
			const enemyY = Phaser.Math.Between(50, this.sys.game.config.height * 0.4);
			const enemy = this.enemies.create(enemyX, enemyY, "enemy");
			enemy.setScale(0.1);

			// Enable physics for the enemy (assuming Arcade Physics)
			this.physics.world.enable(enemy);
			enemy.body.setCircle(20); // Set the enemy's hitbox

			// Enemy AI: Track the player and shoot bullets at the player's position
			const angleToPlayer = Phaser.Math.Angle.Between(
				enemy.x,
				enemy.y,
				this.player.x,
				this.player.y
			);
			const angleOffset = Phaser.Math.DegToRad(105); // Adjust the offset angle as needed
			const bulletSpeed = 200; // Adjust bullet speed as needed

			// Calculate the adjusted rotation for the bullet
			const adjustedRotation = angleToPlayer + angleOffset;

			// Shoot a bullet in the direction of the player
			const bullet = this.physics.add.sprite(enemy.x, enemy.y, "bullet");
			bullet.id = this.generateUniqueId()
			bullet.setScale(0.02);
			bullet.rotation = adjustedRotation;
			this.physics.moveTo(bullet, this.player.x, this.player.y, bulletSpeed);

			// Add the created bullet to the global bullets array
			this.bullets.push(bullet);

			// Set up a timer to continuously shoot bullets at the player
			const shootingTimer = this.time.addEvent({
				delay: 5000, // Adjust this value to control the interval between bullets (in milliseconds)
				callback: () => {
					// Shoot a new bullet at the player's position
					const newBullet = this.physics.add.sprite(enemy.x, enemy.y, "bullet");
					newBullet.id = this.generateUniqueId()
					newBullet.setScale(0.02);
					newBullet.rotation = adjustedRotation;
					this.physics.moveTo(
						newBullet,
						this.player.x,
						this.player.y,
						bulletSpeed
					);
					this.bullets.push(newBullet);

				},
				callbackScope: this,
				repeat: -1, // Repeat indefinitely
			});

			this.shootingTimers.push(shootingTimer);
		}
	}

	joyStickLogic(valueX, valueY) {
		const maxSpeed = 4;
		// Scale the joystick values from -100 to 100 to -1 to 1 (speed ratio)
		const speedX = valueX / 100;
		const speedY = -valueY / 100;

		// Calculate the new position (x and y)
		this.player.x = this.player.x + speedX * maxSpeed; // Use maxSpeed for normalization
		this.player.y = this.player.y + speedY * maxSpeed; // Use maxSpeed for normalization

	}

	handleJoystickInput() {
		// Call the updateShapePosition function with the joystick input values
		this.joyStickLogic(this.joyStick.GetX(), this.joyStick.GetY());
		console.log(this.joyStick.GetX())
	}

	updateHealthBar() {
		this.healthBarBackground.clear();
		this.healthBarBackground.fillStyle(0x000000); // Set the background color of the health bar
		this.healthBarBackground.fillRect(
			this.player.x - 70,
			this.player.y + 70, // Adjust the Y position of the health bar as needed
			this.healthBarWidth,
			20 // Set the height of the health bar (adjust as needed)
		);


		
		const healthBarFillWidth = (this.playerHealth / this.maxHealth) * this.healthBarWidth; //total 200
		this.healthBar.clear();
		this.healthBar.fillStyle(0xff0000); // Set the fill color of the health bar (e.g., red)
		this.healthBar.fillRect(
			this.player.x - 70,
			this.player.y + 70, // Adjust the Y position of the health bar as needed
			healthBarFillWidth,
			20 // Set the height of the health bar (adjust as needed)
		);
	}

	decreasePlayerHealth(amount) {
		this.playerHealth -= amount;

		// Ensure health doesn't go below 0
		if (this.playerHealth < 0) {
			this.playerHealth = 0;
		}

		// Update the health bar width to represent the current health
		this.updateHealthBar();

		// Add any other logic you need when the player's health decreases, e.g., game over check
		// if (this.playerHealth === 0) {
		//   this.gameOver();
		// }
	}




}

const config = {
	type: Phaser.AUTO,
	width: window.innerWidth,
	height: window.innerHeight,
	scene: GameScene,
	physics: {
		default: "arcade",
		arcade: {
			gravity: { y: 0 },
			debug: true,
		},
	},

};

const game = new Phaser.Game(config);

