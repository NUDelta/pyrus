import Game from '../../components/Game';
import { MergeArraysPrompt } from '../prompts';
import configureStore from '../../store/configureStore';


export default function makeGame(gameId, streams) {
    const store = configureStore(gameId, streams);
    return new Game(new MergeArraysPrompt(), store);
};