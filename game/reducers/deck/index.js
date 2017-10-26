import {
    DECK_POP
} from '../../constants/deck';

const initialState = {
    cards: []
};

export default function deck(state=initialState, action) {
    switch (action.type) {
        case DECK_POP:
            return {
                ...state,
                cards: state.cards.slice(action.num)
            }
            break;
        default:
            return state;
    }
}
