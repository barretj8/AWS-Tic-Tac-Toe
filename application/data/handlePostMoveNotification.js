// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
// TEST FUNCTION 
const sendMessage2 = require('./sendMessage');

const handlePostMoveNotification = async ({ game, mover, opponent }) => {
    let winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    let isGameOver = false;
    let winner = null;

    console.log('test test');
    
    for (let tuple of winConditions) {
        if (game.gameState[tuple[0]] !== '-' && 
            game.gameState[tuple[0]] === game.gameState[tuple[1]] && 
            game.gameState[tuple[1]] === game.gameState[tuple[2]]) {
            isGameOver = true;
            winner = game.gameState[tuple[0]]; // 'X' or 'O'
            break;
        }
    }
    let winnerMessage = '';
    let loserMessage = '';
        
    console.log('test 2');
    
    if (isGameOver) {
        winnerMessage = `Congratulations! You beat ${mover} in Tic Tac Toe!`;
        loserMessage = `Oh no! You lost to ${mover} in Tic Tac Toe!`;
        
        console.log('test 23');
    
        // await Promise.all([
        //     sendMessage2({ 
        //         senderEmailAddress: mover.username, 
        //         receiverEmailAddress: opponent.email, 
        //         message: winnerMessage }),
        //     sendMessage2({ 
        //         senderEmailAddress: opponent.email, 
        //         receiverEmailAddress: mover.username, 
        //         message: loserMessage })
        // ]);
    // } else {
    //     // const nextturnMessage = `${mover.username} has moved. It's your turn next in Game ID ${game.gameId}!`;
    //     await sendMessage2({ senderEmailAddress: opponent.email, receiverEmailAddress: mover.email, message: nextturnMessage });
    }


    return { 
        isGameOver, 
        winner, 
        winnerMessage, 
        loserMessage
    };
};

module.exports = handlePostMoveNotification;
