import React, { Component } from 'react';

import RulesEnforcer from '../../../../game/components/RulesEnforcer';
import DiscardMove from '../../../../game/components/DiscardMove';
import WriteMove from '../../../../game/components/WriteMove';
import ConsumeMove from '../../../../game/components/ConsumeMove';
import InfoHeader from '../../containers/infoHeader';
import Editor from '../../containers/editor';
import Hand from '../hand';
import Prompt from '../../containers/prompt';
import { myTurn, getActivePlayer } from '../../../../game/util';
import { MOVE_DISCARD, MOVE_CONSUME, MOVE_WRITE } from '../../../../game/constants/move';
import { GAME_END_TURN, GAME_END } from '../../../../game/constants/game';
import { COMMAND_RUN_CODE } from '../../../../app/constants/command';

export default class GameRunning extends Component {
    constructor(props) {
        super(props);
        this.re = new RulesEnforcer();
        this.state = {
            isWaitingForSubmit: false,
            isWaitingForTestResults: false,
            isMoveValid: false,
            selectedMove: null,
            selectedCard: null,
            shouldDisplaySubmitModal: false,
            shouldDisplayTestResultsIndicator: false,
            shouldDisplaySelectMoveIndicator: false
        };
    }

    componentWillUpdate(nextProps, nextState) {
        const { isWaitingForTestResults } = this.state;
        const { prompt } = this.props;
        if (isWaitingForTestResults && prompt._testRunTimestampMS !== nextProps.prompt._testRunTimestampMS) {
            this.setState({ isWaitingForTestResults: false });
        }
    }

    componentDidUpdate(prevProps, prevState) {
        const { isWaitingForTestResults } = this.state;
        if (!isWaitingForTestResults && prevState.isWaitingForTestResults) {
            this.setState({ shouldDisplayTestResultsIndicator: true });
        }
    }

    shouldDisplayOverlay = () => {
        const { isWaitingForSubmit, selectedMove } = this.state;
        return !isWaitingForSubmit && (selectedMove === MOVE_DISCARD || selectedMove === MOVE_CONSUME);
    }

    getMe = () => {
        const { players, me } = this.props;
        for (let player of players) {
            if (player.id === me.id) {
                return player;
            }
        }
    }

    getPartner = () => {
        const { players, me } = this.props;
        for (let player of players) {
            if (player.id !== me.id) {
                return player;
            }
        }
    }

    getPartnersHand = () => {
        return this.getPartner().hand;
    }

    getMyHand = () => {
        return this.getMe().hand;
    }

    handleRunCodeClick = () => {
        const { prompt, stream } = this.props;
        stream.sendCommand({
            type: COMMAND_RUN_CODE,
            fn: `(${ prompt._signature }{${ this.editorElement.doc.getValue() + '\n' }})`,
            tests: prompt._tests
        });

        this.setState({
            isWaitingForTestResults: true,
            shouldDisplayTestResultsIndicator: false
        });
    }

    handleSubmitCodeClick = () => {
        this.setState({
            shouldDisplaySubmitModal: true
        });
    }

    handleConfirmSubmitCodeClick = () => {
        const { stream } = this.props;
        stream.sendAction({
            type: GAME_END,
            code: this.editorElement.doc.getValue()
        });
    }

    handleWriteMoveClick = () => {
        this.setState({
            selectedMove: MOVE_WRITE,
            isWaitingForSubmit: true,
            isMoveValid: false
        });
    }

    handleConsumeMoveClick = () => {
        this.setState({
            selectedMove: MOVE_CONSUME,
            isWaitingForSubmit: false,
            isMoveValid: false
        });
    }

    handleDiscardMoveClick = () => {
        this.setState({
            selectedMove: MOVE_DISCARD
        });
    }

    handleCardClick = card => {
        const { stream, me } = this.props;
        const { selectedMove } = this.state;

        if (selectedMove === MOVE_DISCARD) {
            stream.sendAction({
                type: selectedMove,
                move: new DiscardMove(me.id, card)
            });

            this.setState({
                selectedMove: null
            });
            return;
        }

        this.setState({
            isWaitingForSubmit: true,
            selectedCard: card
        });
    }

    handleCancelAction = () => {
        this.setState({
            selectedMove: null,
            isWaitingForSubmit: false,
            selectedCard: null
        });
    }

    handleSubmitActionClick = () => {
        const { stream, me } = this.props;
        const { selectedMove, isWaitingForSubmit, selectedCard } = this.state;
        const code = this.editorElement.doc.getValue()
        switch (selectedMove) {
            case MOVE_CONSUME:
                stream.sendAction({
                    type: selectedMove,
                    move: new ConsumeMove(me.id, selectedCard, code)
                });
                break;
            case MOVE_WRITE:
                stream.sendAction({
                    type: selectedMove,
                    move: new WriteMove(me.id, code)
                });
                break;
            default:
                return;
        }

        this.setState({
            selectedMove: null,
            isWaitingForSubmit: false,
            selectedCard: null
        });
    }

    handleEndTurnClick = () => {
        const { stream } = this.props;
        stream.sendAction({
            type: GAME_END_TURN
        });
    }

    handleEditorChange = () => {
        const { game, board, players, deck } = this.props;
        const { isMoveValid, selectedMove, selectedCard } = this.state;
        const activePlayer = getActivePlayer(game, players);

        let code = this.editorElement.doc.getValue();
        let move;
        switch (selectedMove) {
            case MOVE_WRITE:
                move = new WriteMove(activePlayer.id, code);
                break;
            case MOVE_CONSUME:
                move = new ConsumeMove(activePlayer.id, selectedCard, code);
                break;
            default:
                return;
        }

        this.setState({ isMoveValid: this.re.isLegalMove(board, move, deck, players) });
    }

    handleEditorMouseOver = () => {
        const { me, game, players } = this.props;
        const { selectedMove } = this.state;
        this.setState({ shouldDisplaySelectMoveIndicator: myTurn(me, game, players) && !selectedMove });
    }

    render() {
        const { me, game, gameId, stream, players } = this.props;
        const {
            selectedMove,
            selectedCard,
            isWaitingForSubmit,
            isMoveValid,
            isWaitingForTestResults,
            shouldDisplaySubmitModal,
            shouldDisplayTestResultsIndicator,
            shouldDisplaySelectMoveIndicator
        } = this.state;

        const isEditorEnabled = myTurn(me, game, players) && selectedMove;

        return (
            <div className="flex flex-column vh-100 relative overflow-hidden">
                { shouldDisplaySubmitModal &&
                    <div className="absolute absolute--fill z-9999">
                        <div className="absolute absolute--fill bg-near-black o-60"></div>
                        <div className="mw6 mt6 bg-pear-near-white br2 pa4 relative center">
                            <h2 className="mv0">You won't be able to make changes after submitting. Are you sure you want to proceed?</h2>
                            <div className="flex justify-around mt3">
                                <input
                                    type="button"
                                    className="db w4 input-reset ba bg-red b--red pa3 br2 near-white pointer"
                                    value="Yes"
                                    onClick={ this.handleConfirmSubmitCodeClick }
                                />
                                <input
                                    type="button"
                                    className="db w4 input-reset ba bg-pear-near-white b--pear-light-gray pa3 br2 silver pointer mr2"
                                    value="No"
                                    onClick={ () => this.setState({ shouldDisplaySubmitModal: false }) }
                                />
                            </div>
                        </div>
                    </div>
                }
                <InfoHeader />
                <div className="flex mw8 center">
                    <div
                        className="w-50 pt3 ph3 mb7 overflow-scroll relative"
                        onScroll={ () => this.setState({ shouldDisplayTestResultsIndicator: false }) }
                    >
                        <Prompt isWaitingForTestResults={ isWaitingForTestResults } />
                        { shouldDisplayTestResultsIndicator &&
                            <div className="absolute top-2 right-2 pa3 bg-pear-yellow br2">👇 New test results!</div>
                        }
                    </div>
                    <div 
                        className={`w-50 pt3 ph3 pb7 overflow-scroll relative ${ isEditorEnabled ? '' : 'not-allowed' }`}
                        onMouseEnter={ this.handleEditorMouseOver }
                        onMouseLeave={ () => this.setState({ shouldDisplaySelectMoveIndicator: false }) }
                    >
                        <Editor
                            gameId={ gameId }
                            getEditor={ editor => this.editorElement = editor }
                            handleEditorChange={ this.handleEditorChange }
                            enabled={ isEditorEnabled }
                        />
                        { shouldDisplaySelectMoveIndicator &&
                            <div className="absolute top-2 right-2 pa3 bg-pear-yellow br2 z-999">You need to select an action first!</div>
                        }
                    </div>
                    <div className="absolute right--2 top-3 slide-left-3 flex flex-column z-999">
                        { myTurn(me, game, players) && isWaitingForSubmit &&
                            <div className="flex flex-column mb4">
                                <p className="f6 silver mv0">SUBMIT ACTION</p>
                                <input
                                    type="button"
                                    className={`db mv1 input-reset ba bg-pear-blue b--pear-blue pa3 br2 white pointer slide-left-1 ${ isMoveValid ? '' : 'pointer-none o-30' }`}
                                    value="Submit Action"
                                    onClick={ this.handleSubmitActionClick }
                                />
                                <input
                                    type="button"
                                    className="db mv1 input-reset ba bg-red b--red pa3 br2 near-white pointer slide-left-1"
                                    value="Cancel Action"
                                    onClick={ this.handleCancelAction }
                                />
                            </div>
                        }
                        { myTurn(me, game, players) && !isWaitingForSubmit &&
                            <div className="flex flex-column mb4">
                                <p className="f6 silver mv0">ACTIONS</p>
                                <input
                                    type="button"
                                    className="db mv1 input-reset ba bg-pear-blue b--pear-blue pa3 br2 white pointer slide-left-1"
                                    value="Write Code"
                                    onClick={ this.handleWriteMoveClick }
                                />
                                <input
                                    type="button"
                                    className="db mv1 input-reset ba bg-pear-purple b--pear-purple pa3 br2 white pointer slide-left-1"
                                    value="Consume Card"
                                    onClick={ this.handleConsumeMoveClick }
                                />
                                <input
                                    type="button"
                                    className="db mv1 input-reset ba bg-pear-yellow b--pear-yellow pa3 br2 near-black pointer slide-left-1"
                                    value="Discard Card"
                                    onClick={ this.handleDiscardMoveClick }
                                />
                            </div>
                        }
                        <div className="flex flex-column mb4">
                            <p className="f6 silver mb0">RUN AND SUBMIT</p>
                            { myTurn(me, game, players) &&
                                <input
                                    type="button"
                                    className={`db mv1 input-reset ba bg-pear-green b--pear-green pa3 br2 white pointer slide-left-1 ${ isMoveValid ? '' : 'pointer-none o-30' }`}
                                    value="Run Code"
                                    onClick={ this.handleRunCodeClick }
                                />
                            }
                            <input
                                type="button"
                                className={`db mv1 input-reset ba bg-pear-green b--pear-green pa3 br2 white pointer slide-left-1`}
                                value="Submit Code"
                                onClick={ this.handleSubmitCodeClick }
                            />
                        </div>
                        { myTurn(me, game, players) &&
                            <div className="flex flex-column">
                                <p className="f6 silver mb0">END TURN</p>
                                <input
                                    type="button"
                                    className="db mv1 input-reset ba bg-pear-near-white b--pear-light-gray pa3 br2 silver pointer slide-left-1"
                                    value="End Turn"
                                    onClick={ this.handleEndTurnClick }
                                />
                            </div>
                        }
                    </div>
                </div>
                <div className={`absolute absolute--fill bg-near-black ${ this.shouldDisplayOverlay() ? 'o-60 z-9999' : 'o-0 z-0 dn' }`}></div>
                <div>
                    <div 
                        className="absolute bottom-5 w-50 left-0 z-9 ph2 flex flex-column self-end"
                        ref={ e => this.partnersHandContainerElement = e }
                    >
                        <p className="silver f6 mv2 pa2 br2 dib bg-pear-near-white self-end ba b--pear-light-gray">{ `${ this.getPartner().name }'s hand` }</p>
                        <div className="flex-none relative">
                            <Hand
                                cards={ this.getPartnersHand() }
                                inverse
                                handContainer={ this.partnersHandContainerElement }
                            />
                        </div>
                    </div>
                    <div 
                        className={`absolute bottom-5 w-50 right-0 ph2 flex flex-column ${ this.shouldDisplayOverlay() ? 'z-9999' : 'z-99'}`}
                        ref={ e => this.myHandContainerElement = e }
                    >
                        <div className="flex justify-between">
                            <p className="pear-near-white f6 mv2 pa2 br2 dib bg-pear-blue self-start ba b--pear-blue">Your hand</p>
                            { this.shouldDisplayOverlay() &&
                                <input
                                    type="button"
                                    className="db mv1 input-reset ba bg-red b--red pa3 br2 near-white pointer"
                                    value="Cancel Action"
                                    onClick={ this.handleCancelAction }
                                />
                            }
                        </div>
                        <div className="flex-none relative">
                            <Hand
                                cards={ this.getMyHand() }
                                selectedCard={ selectedCard }
                                handleCardClick={ this.shouldDisplayOverlay() ? this.handleCardClick : null }
                                handContainer={ this.myHandContainerElement }
                            />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
