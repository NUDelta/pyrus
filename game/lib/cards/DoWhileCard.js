import Card from '../../components/Card';

class DoWhileCard extends Card {
    constructor() {
        super();
        this._type = 'Hash Table';
        this._implementation = 'var hash = {};';
        this._example = 'var hash = { "foo": "bar" };';
    }
}

export default DoWhileCard;