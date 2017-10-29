import {
    PLAYERS_REGISTER_PLAYER,
    PLAYERS_SET_PLAYER_HAND,
    PLAYERS_GIVE_PLAYER_CARDS,
    PLAYERS_DISCARD_PLAYER_CARD
} from '../../constants/players';
import { 
    MOVE_CONSUME,
    MOVE_DISCARD,
    MOVE_WRITE,
} from '../../constants/move';

const initialState = [];

// Get the index of a player with a given id
// List[], int -> int
function indexOfPlayer(players, id) {
    for (let i = 0; i < players.length; i++) {
        if (players[i].id === id) {
            return i;
        }
    }

    return null;
}

export default function player(state=initialState, action) {
    const newState = [...state];
    let index;
    switch (action.type) {
        case PLAYERS_REGISTER_PLAYER:
            return [
                ...state,
                action.player
            ];
        case PLAYERS_SET_PLAYER_HAND:
            index = indexOfPlayer(newState, action.id);
            newState[index] = {
                ...newState[index],
                hand: action.hand
            };

            return newState;
        case PLAYERS_GIVE_PLAYER_CARDS:
            index = indexOfPlayer(newState, action.id);

            newState[index] = {
                ...newState[index],
                hand: [
                    ...newState[index].hand,
                    ...action.cards
                ]
            };

            return newState;
        case PLAYERS_DISCARD_PLAYER_CARD:
            index = indexOfPlayer(newState, action.id);

            for (let i = 0; i < newState[index].hand.length; i++) {
                if (newState[index].hand[i].type === action.card.type) {
                    newState[index].hand.splice(i, 1);
                    break;
                }
            }

            return newState;
        default:
            return state;
    }
}
