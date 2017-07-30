(function () {
    var game = new Phaser.Game(800, 600, Phaser.AUTO, 'game');



    game.state.add('Preloader', ShipBuilder.Preloader);
    game.state.add('MainGame', ShipBuilder.MainGame);
    game.state.start('Preloader');
})();




