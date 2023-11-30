// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const { sendFinalMessage } = require("./sendMessage");

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
            messages (game, currentMover, opponentPlayer, gameOver, winner);
            return { 
                gameOver: true
            };
        }
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

async function messages(game, currentMover, opponentPlayer, gameOver, winner) {
    if (gameOver) {
        const winnersMessage = `Congratulations ${winner}! You've beat ${opponentPlayer} and won your Tic Tac Toe game ${game.gameId}! Here's what the final board looks like: ${formattedGameStateForEmail(game.gameState)}`;
        const losingMessage = `Oh no! ${winner} beat you in you Tic Tac Toe game ${game.gameId}. Here is the final board: ${formattedGameStateForEmail(game.gameState)}`;
        
        try {
            await Promise.all([
                sendFinalMessage({ senderEmailAddress: opponentPlayer.email,
                    receiverEmailAddress: currentMover.username,
                    message: winnersMessage
                }),
                sendFinalMessage({
                    senderEmailAddress: currentMover.username,
                    receiverEmailAddress: opponentPlayer.email,
                    message: losingMessage
                })
            ]);
            console.log('Sent move updates successfully');
        } catch (error) {
            console.log('Error sending SES: ', error.message);
            // Handle error or retry logic if necessary
        }
    }
}


// Helper function to check and see if there's a draw/tie
// const checkIfBoardIsFull = (gameState) => {
//     return gameState.every(position => position !== '-');
// };

// const handlePostMoveNotification = (game, currentMover, opponentPlayer, formattedGameStateForEmail)  => {
    // const winnerCheck = checkWinningCondition(game.gameState);
    // // const isBoardFull = checkIfBoardIsFull(game.gameState);
    // // let isGameEnded = false;

    // console.log(winnerCheck);
    // if (winnerCheck.gameOver) {
    //     // console.log(`Player ${winnerCheck} wins!`);
    //     // Handle the scenario where the game ends with a winner
    //     const winnersMessage = {
    //         subject: `Congratulations! You've Won Your Tic Tac Toe Game: ${game.gameId}`,
    //         body: `Congratulations ${currentMover}! You've beat ${opponentPlayer} and won your Tic Tac Toe game ${game.gameId}! Here's what the final board looks like: ${formattedGameStateForEmail(game.gameState)}`
    //         };
            
    //     sendMessage2({
    //         senderEmailAddress: opponentPlayer,
    //         receiverEmailAddress: currentMover,
    //         message: winnersMessage
    //     });
    //     const losingMessage = {
    //         subject: `Tic Tac Toe Game: ${game.gameId} Results`,
    //         body: `Oh no! ${currentMover} beat you in you Tic Tac Toe game ${game.gameId}. Here is the final board: ${formattedGameStateForEmail(game.gameState)}`
    //     };
        
    //     sendMessage2({
    //         senderEmailAddress: currentMover,
    //         receiverEmailAddress: opponentPlayer,
    //         message: losingMessage
    //     })
    //     .then(() => console.log('Sent move updates successfully'))
    //     .catch((error) => console.log('Error sending SES: ', error.message));
        
    //     return {
    //         isGameEnded: true
    //     };
        
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
