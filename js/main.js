import { Game } from './core/game.js';

window.addEventListener('DOMContentLoaded', () => {
    const game = new Game('game-canvas');
    game.start();
});