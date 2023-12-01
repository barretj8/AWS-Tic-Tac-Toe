// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const {sendMessage2} = require("./sendMessage");

const handlePostMoveNotification = (game, currentMover, opponentPlayer ) => {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];
    
    let gameOver = false;
    
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        const cellA = game.gameState[a];
        const cellB = game.gameState[b];
        const cellC = game.gameState[c];

        if (cellA !== undefined && cellA !== '-' && cellA === cellB && cellA === cellC) {
            console.log(`${currentMover.username} won!`);
            gameOver = true; // might not need this but keeping for now
            WinAndLoseMessages (game, currentMover, opponentPlayer);
            return { 
                gameOver: true
            };
        }
    }
    
    let boardFilled = true;
    for (const cell of game.gameState) {
        if (cell === '-') {
            boardFilled = false;
            break;
        }
    }
    
    if (boardFilled) {
        console.log("It's a tie! The game ended in a draw.");
        TieMessage(game, currentMover, opponentPlayer);
        return { 
            gameOver: true
        };
    }
};

// Helper function to format the game state into a 3x3 board for HTML emails
const formattedGameStateForEmail = (gameState) => {
    let formattedBoard = '<table style="border-collapse: collapse; font-size: 20px;"><tbody>';
    for (let i = 0; i < gameState.length; i++) {
        if (i % 3 === 0) formattedBoard += '<tr>'; // Start new row every 3 characters
        formattedBoard += `<td style="border: 1px solid black; width: 30px; height: 30px; text-align: center;">${gameState[i]}</td>`;
        if ((i + 1) % 3 === 0) formattedBoard += '</tr>'; // End row every 3 characters
    }
    formattedBoard += '</tbody></table>';
    return formattedBoard;
};

const WinAndLoseMessages = (game, currentMover, opponentPlayer) => {
    const winningMessage =
    {
        subject: `You Won Game ${game.gameId}`,
        body: `Congratulations ${currentMover.username}! You've beat ${opponentPlayer.email} and won your Tic Tac Toe game ${game.gameId}! Here's what the final board looks like: ${formattedGameStateForEmail(game.gameState)}`
    }
    const losingMessage = 
    {
        subject: `You Lost Game ${game.gameId}`,
        body: `Oh no! ${currentMover.username} beat you in you Tic Tac Toe game ${game.gameId}. Better luck next time! Here is the final board: ${formattedGameStateForEmail(game.gameState)}`
    }
     
    try {
        Promise.all([
            sendMessage2({
                senderEmailAddress: opponentPlayer.email,
                receiverEmailAddress: currentMover.username,
                message: winningMessage
            }),
            sendMessage2({
                senderEmailAddress: currentMover.username,
                receiverEmailAddress: opponentPlayer.email,
                message: losingMessage
            })
        ]);
    } catch (error) {
        console.log('Error sending SES from postMove: ', error.message);
    }
};

const TieMessage = (game, currentMover, opponentPlayer) => {
    
    
    const drawMessageToCurrentPlayer = {
        subject: `Tic Tac Toe Game ${game.gameId} Ended in a Draw!`,
        body: `Hi ${currentMover.username}! Your game ended in a draw! Here's the final board: ${formattedGameStateForEmail(game.gameState)}`
    };
    
    const drawMessageToOpponent = {
        subject: `Tic Tac Toe Game ${game.gameId} Ended in a Draw!`,
        body: `Hi ${opponentPlayer.email}! Your game ended in a draw! Here's the final board: ${formattedGameStateForEmail(game.gameState)}`
    };
    
    try {
        Promise.all([
            sendMessage2({
                senderEmailAddress: opponentPlayer.email,
                receiverEmailAddress: currentMover.username,
                message: drawMessageToCurrentPlayer
            }),
            sendMessage2({
                senderEmailAddress: currentMover.username,
                receiverEmailAddress: opponentPlayer.email,
                message: drawMessageToOpponent
            })
        ]);
    } catch (error) {
        console.log('Error sending SES: ', error.message);
    }
};

module.exports = handlePostMoveNotification;
