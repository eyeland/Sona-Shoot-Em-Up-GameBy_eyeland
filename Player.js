class Player {
	constructor(scene) {
		this.scene = scene;
		this.createPlayer();
	}


	createPlayer() {
		// Move the player-related code here
		
		//create player
		this.player = this.scene.add.sprite(
			this.scene.sys.game.config.width * 0.5,
			this.scene.sys.game.config.height * 0.8,
			"sona"
		);

		this.player.setScale(0.1);
		this.player.setDepth(1);
		// Enable physics for the player (assuming Arcade Physics)
		this.scene.physics.world.enable(this.player);
		this.player.body.setCircle(430, 80, 0);
		
		
		// ... rest of the player creation code
	}

	update() {
		// Move the player-related update logic here
	}
}


