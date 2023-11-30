// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const { sendMessage2 } = require("./sendMessage");

// const checkWinningCondition = (gameState) => {
//     const winConditions = [
//         [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
//         [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
//         [0, 4, 8], [2, 4, 6]             // Diagonal
//     ];

//     for (const condition of winConditions) {
//         const [a, b, c] = condition;
//         if (
//             gameState[a] !== '-' &&
//             gameState[a] === gameState[b] &&
//             gameState[a] === gameState[c]
//         ) {
//             return gameState[a]; // Returns 'X' or 'O' for the winner
//         }
//     }

//     return null; // No winner yet
// };

const handlePostMoveNotification = (game, currentMover, opponentPlayer ) => {
    // console.log('test');
    
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];
    
    let gameOver = false;
    let winner = null;
    
    console.log('test test')
    
    for (const condition of winConditions) {
        const [a, b, c] = condition;
        const cellA = game.gameState[a];
        // console.log("cellA", cellA)
        const cellB = game.gameState[b];
        // console.log("cellB", cellB)
        const cellC = game.gameState[c];
        // console.log("cellC", cellC)

        if (cellA !== undefined && cellA !== '-' && cellA === cellB && cellA === cellC) {
            // let finalMessage = '';
            // finalMessage = messages(game);
            gameOver = true;
            winner = cellA;
            return { 
                gameOver: true, 
                winner: cellA 
            }; // Returns 'X' or 'O' for the winner
        }
    }
    
    messages (game, currentMover, opponentPlayer, gameOver);

    console.log('test 2');

    
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

async function messages (game, currentMover, opponentPlayer, gameOver) {
    // let winnerMessage = '';
    // let loserMessage = '';
    
    if (gameOver) {
        // winnerMessage = `Congratulations! You beat ${currentMover} in Tic Tac Toe!`;
        // loserMessage = `Oh no! You lost to ${currentMover} in Tic Tac Toe!`;

        // console.log('test 23');

        // await Promise.all([
        //     sendMessage2({ 
        //         senderEmailAddress: currentMover.username, 
        //         receiverEmailAddress: opponentPlayer.email, 
        //         message: winnerMessage }),
        //     sendMessage2({ 
        //         senderEmailAddress: currentMover.email, 
        //         receiverEmailAddress: opponentPlayer.username, 
        //         message: loserMessage })
        // ]);
        const winnersMessage = {
            subject: `Congratulations! You've Won Your Tic Tac Toe Game: ${game.gameId}`,
            body: `Congratulations ${currentMover}! You've beat ${opponentPlayer} and won your Tic Tac Toe game ${game.gameId}! Here's what the final board looks like: ${formattedGameStateForEmail(game.gameState)}`
            };
            
        sendMessage2({
            senderEmailAddress: opponentPlayer,
            receiverEmailAddress: currentMover,
            message: winnersMessage
        });
        const losingMessage = {
            subject: `Tic Tac Toe Game: ${game.gameId} Results`,
            body: `Oh no! ${currentMover} beat you in you Tic Tac Toe game ${game.gameId}. Here is the final board: ${formattedGameStateForEmail(game.gameState)}`
        };
        
        sendMessage2({
            senderEmailAddress: currentMover,
            receiverEmailAddress: opponentPlayer,
            message: losingMessage
        })
        .then(() => console.log('Sent move updates successfully'))
        .catch((error) => console.log('Error sending SES: ', error.message));
    } else {
        // const nextturnMessage = `${mover.username} has moved. It's your turn next in Game ID ${game.gameId}!`;
        // await sendMessage2({ senderEmailAddress: opponentPlayer.email, receiverEmailAddress: currentMover.email, message: nextturnMessage });
    }
    // console.log('testing passing messages: ', game);
};


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
