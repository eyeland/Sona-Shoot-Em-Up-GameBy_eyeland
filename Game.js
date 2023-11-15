

class GameScene extends Phaser.Scene {
	constructor() {
		super({ key: "GameScene" });
		this.enemyCounter = 0;
		// Add a flag to track if the game is running
		this.isGameRunning = false;
		// Initialize player speed
		this.playerSpeed = 4; // Adjust the player speed as needed
		this.shootingTimers = [];	
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
		// Create the game canvas
		this.gameCanvas = this.sys.game.canvas;

		//Load Joystick Logic
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

		// Create the player using the Player class
		this.player = new Player(
		  this,
		  this.sys.game.config.width * 0.5,
		  this.sys.game.config.height * 0.8,
		  'sona'
		);

		
		//create allies
		this.minion = new Allies(this, 100, 100, 'minion', {offsetX: 120, offsetY: -100});
		this.minionOne = new Allies(this, 100, 100, 'minion',{offsetX: 0, offsetY: -150});
		this.minionTwo = new Allies(this, 100, 100, 'minion', {offsetX:-120, offsetY: -100} );
		
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
		this.scrollSpeed = 1.1;

		// Create an enemy group to hold all enemy instances
		this.enemies = this.physics.add.group();
		
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

			// Class Updates
			this.player.update()
			this.minion.update()
			this.minionOne.update()
			this.minionTwo.update()

			// Update the minion's position to follow the player
			// const speed = 15; // Adjust the speed as needed
			// const angle = Phaser.Math.Angle.Between(this.minion.x, this.minion.y, this.player.x, this.player.y);
			
			// // Move the minion towards the player
			// this.physics.moveTo(this.minion, this.player.x, this.player.y - 150, speed, 300);
			// this.physics.moveTo(this.minionOne, this.player.x - 150, this.player.y - 40, speed, 300);
			// this.physics.moveTo(this.minionTwo, this.player.x + 150, this.player.y - 40, speed, 300);

			// Rotate the minion to face the player (optional)
			// this.minion.rotation = angle - 90;

			// Scroll the background from top to bottom
			this.background.tilePositionY -= this.scrollSpeed;
		}
	}

	// getBulletById(id) {
	// 	return this.bullets.find(bullet => bullet.id === id);
	// }

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

