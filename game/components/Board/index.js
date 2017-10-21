import Deck from '../Deck';
import DiscardPile from '../DiscardPile';
import Player from '../Player';

import shuffle from 'fisher-yates-shuffle';

class Board {
    // Prompt -> Board
    constructor(editor, prompt) {
        this._prompt = prompt;
        this._editor = editor;
        this._deck = this.initializeDeck();
        this._players = [];
        this._discardPile = new DiscardPile();
    }

    get deck() {
        return this._deck;
    }

    // -> Deck
    initializeDeck() {
        return new Deck(shuffle(this._prompt.cardSet));
    }

    get players() {
        return this._players;
    }

    // Player ->
    set addPlayer(player) {
        this._players.push(player);
    }

    get prompt() {
        return this._prompt;
    }
}

export default Board;
