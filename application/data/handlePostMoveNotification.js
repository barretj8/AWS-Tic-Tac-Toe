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
    let winner = null;
    
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        const cellA = game.gameState[a];
        const cellB = game.gameState[b];
        const cellC = game.gameState[c];

        if (cellA !== undefined && cellA !== '-' && cellA === cellB && cellA === cellC) {
            gameOver = true;
            winner = cellA;
            const sendingMessage = messages (game, currentMover, opponentPlayer, gameOver);
            return { 
                gameOver: true
            };
        } 
        // need an else if statement for if there is a tie
    }
};

// Helper function to check and see if there's a draw/tie
// const checkIfBoardIsFull = (gameState) => {
//     return gameState.every(position => position !== '-');
// };

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
const messages = (game, currentMover, opponentPlayer, gameOver) => {
    if (gameOver) {
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
            console.log('Sent move updates successfully');
        } catch (error) {
            console.log('Error sending SES from postMove: ', error.message);
            // Handle error or retry logic if necessary
        }
    }
}

        
    // } else if (isBoardFull) {
    //     console.log("It's a tie! The game ended in a draw.");
        
    //     const drawMessageToCurrentPlayer = {
    //         subject: `Tic Tac Toe Game ${game.gameId} Ended in a Draw!`,
    //         body: `Hi ${currentMover}! Your game ended in a draw! Here's the final board: ${formattedGameStateForEmail(game.gameState)}`
    //     };
        
    //     const drawMessageToOpponent = {
    //         subject: `Tic Tac Toe Game ${game.gameId} Ended in a Draw!`,
    //         body: `Hi ${opponentPlayer}! Your game ended in a draw! Here's the final board: ${formattedGameStateForEmail(game.gameState)}`
    //     };
        
    //     sendMessage2({
    //         senderEmailAddress: opponentPlayer,
    //         receiverEmailAddress: currentMover,
    //         message: drawMessageToCurrentPlayer
    //     })
    //     .then(() => {
    //         console.log(`Sent draw update to ${currentMover} successfully`);
    //         return sendMessage2({
    //             senderEmailAddress: currentMover,
    //             receiverEmailAddress: opponentPlayer,
    //             message: drawMessageToOpponent
    //         });
    //     })
    //     .then(() => console.log(`Sent draw updat to ${opponentPlayer} successfully`))
    //     .catch((error) => console.log('Error sending SES: ', error.message));
        
    //     return {
    //         isGameEnded: true
    //     };
        
    // } 
    // else {
    //     return null;   
    // }
// }

module.exports = handlePostMoveNotification;
