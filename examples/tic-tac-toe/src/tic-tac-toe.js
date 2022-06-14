import {NearContract, NearBindgen, call, view, near} from 'near-sdk-js'

const TURN_TIMEOUT = 100;
const BOARD_WIDTH = 3;

class State {
    constructor() {
        this.currentTurn = "";
        this.players = Array(2);
        this.board = Array(BOARD_WIDTH * BOARD_WIDTH);
        this.winner = "";
        this.draw = false;
        this.moveTimeout = 0;
    }
}

@NearBindgen
class TicTacToe extends NearContract {
    constructor() {
        super()
        this.state = new State();
        this.locked = false;
    }

    @call
    onCreate() {
        this.state = new State();
    }

    @call
    onJoin() {
        assert(!this.locked, "Game Locked");
        let account_id = near.predecessorAccountId();

        if (!this.state.players[0] && !this.state.players[1]) {
            this.state = new State();
        }

        if (!this.state.players[0]) {
            this.state.players[0] = account_id;
        }
        else if (!this.state.players[1]) {
            this.state.players[1] = account_id;
            this.state.currentTurn = this.state.players[0];

            // lock this room for new users
            this.locked = true;
            this.setMoveTimeout();
        }
    }

    @call
    playerAction({data}) {
        assert (!(this.state.winner || this.state.draw), "Already finished");

        let account_id = near.signerAccountId()
        assert(this.state.currentTurn === account_id, "Not your turn");

        const playerIds = this.state.players;

        const index = data.x + BOARD_WIDTH * data.y;

        assert(this.state.board[index] === null, "Field already assigned");

        const move = (account_id === playerIds[0]) ? 1 : 2;
        this.state.board[index] = move;

        if (this.checkWin(data.x, data.y, move)) {
            this.state.winner = account_id;
            this.locked = false;
            this.state.players = Array(2);

        } else if (this.checkBoardComplete()) {
            this.state.draw = true;
            this.locked = false;
            this.state.players = Array(2);
        } else {
            // switch turn
            const otherPlayerId = (account_id === playerIds[0]) ? playerIds[1] : playerIds[0];

            this.state.currentTurn = otherPlayerId;

            this.setMoveTimeout();
        }
    }

    setMoveTimeout() {
        this.state.moveTimeout = (near.blockTimestamp()  + BigInt(TURN_TIMEOUT) * BigInt(1_000_000_000)).toString();
    }

    checkBoardComplete () {
        return this.state.board
            .filter(item => item === null)
            .length === 0;
    }

    checkWin (x, y, move) {
        let won = false;
        let board = this.state.board;

        // horizontal
        for(let y = 0; y < BOARD_WIDTH; y++){
            const i = x + BOARD_WIDTH * y;
            if (board[i] !== move) { break; }
            if (y == BOARD_WIDTH-1) {
                won = true;
            }
        }

        // vertical
        for(let x = 0; x < BOARD_WIDTH; x++){
            const i = x + BOARD_WIDTH * y;
            if (board[i] !== move) { break; }
            if (x == BOARD_WIDTH-1) {
                won = true;
            }
        }

        // cross forward
        if(x === y) {
            for(let xy = 0; xy < BOARD_WIDTH; xy++){
                const i = xy + BOARD_WIDTH * xy;
                if(board[i] !== move) { break; }
                if(xy == BOARD_WIDTH-1) {
                    won = true;
                }
            }
        }

        // cross backward
        for(let x = 0;x<BOARD_WIDTH; x++){
            const y =(BOARD_WIDTH-1)-x;
            const i = x + BOARD_WIDTH * y;
            if(board[i] !== move) { break; }
            if(x == BOARD_WIDTH-1){
                won = true;
            }
        }

        return won;
    }

    @call
    onTimeoutEnds() {
        assert(near.blockTimestamp() > BigInt(this.state.moveTimeout), "Too early");
        this.locked = false;
        this.onCreate({});
    }

    @view
    get_game() {
        return [this.state.board, this.state.players, this.state.currentTurn, this.state.moveTimeout, this.locked, this.state.winner, this.state.draw];
    }
}

function assert(b, str) {
    if (b) {
        return
    } else {
        throw Error("assertion failed: " + str)
    }
}