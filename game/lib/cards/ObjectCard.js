import Card from '../../components/Card';
import { CARDS_OBJECT } from '../../constants/cards.js';
import { isObject } from '../../util';
import espree from 'espree';

class ObjectCard extends Card {
    constructor() {
        super();
        this.type = CARDS_OBJECT;
        this.title = 'Object';
        this.implementation = `var obj = { key: 'value' };`;
        this.example = 
`var rect = {
    x: 20,
    y: 50
};
rect.y; // -> 50
rect.x = 10;
rect.x; // -> 10`;
    }

    isInstanceOf(code) {
        const tree = espree.parse(code);
        return isObject(tree);
    }
}

export default ObjectCard;
