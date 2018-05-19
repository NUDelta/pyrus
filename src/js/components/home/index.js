import React, { Component } from "react";
import Game from "../game";
import { newGame } from "../../lib/api";
import { Redirect } from "react-router-dom";

export default class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      promptTitle: "",
      gameId: "",
      gameReady: false,
      shouldDisplaySpectatorViewInput: false
    };
  }

  handlePromptTitleFormSubmit = e => {
    e.preventDefault();
    const { promptTitle } = this.state;

    if (!promptTitle) {
      return;
    }

    newGame(promptTitle)
      .then(({ gameId }) => {
        this.setState({
          gameId,
          gameReady: true
        });
      })
      .catch(err => console.log(err));
  };

  handleGameIdFormSubmit = e => {
    e.preventDefault();
    const { gameId } = this.state;
    this.setState({
      gameReady: true
    });
  };

  handlePromptTitleChange = e => {
    this.setState({
      promptTitle: e.target.value
    });
  };

  handleGameIdChange = e => {
    this.setState({
      gameId: e.target.value
    });
  };

  handleKeyDown = e => {
    if (e.keyCode === 27) {
      const { shouldDisplaySpectatorViewInput } = this.state;
      this.setState({
        shouldDisplaySpectatorViewInput: !shouldDisplaySpectatorViewInput
      });
    }
  };

  render() {
    const {
      promptTitle,
      gameId,
      gameReady,
      shouldDisplaySpectatorViewInput
    } = this.state;

    if (gameReady) {
      if (shouldDisplaySpectatorViewInput) {
        return <Redirect push to={`/spectator/${gameId}`} />;
      }

      return <Redirect push to={`/challenge/${gameId}`} />;
    }

    return (
      <div className="mw6 center mt6">
        <h1 className="tc f1 near-black">Programming Challenges</h1>
        <div>
          <form
            className="flex w-100 justify-between"
            onSubmit={this.handlePromptTitleFormSubmit}
          >
            <select
              className="flex-auto ba br2 br--left b--pear-light-gray bg-pear-near-white pl3 input-reset lh-copy"
              onChange={this.handlePromptTitleChange}
              defaultValue=""
            >
              <option value="" disabled>
                Select Challenge ⬇️
              </option>
              <option value="ExamplePrompt">Example Challenge</option>
              <option value="LengthOfTriplesPrompt">Length of Triples</option>
            </select>
            <input
              className="input-reset ba bg-pear-blue b--pear-blue pa3 br2 br--right white pointer"
              type="submit"
              value="Start new challenge"
            />
          </form>
        </div>
      </div>
    );
  }
}
