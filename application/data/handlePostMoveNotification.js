// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
// TEST FUNCTION 
const sendMessage2 = require('./sendMessage');

const handlePostMoveNotification = (gameState) => {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Horizontal
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Vertical
        [0, 4, 8], [2, 4, 6]             // Diagonal
    ];

    for (const condition of winConditions) {
        const [a, b, c] = condition;
        if (
            gameState[a] !== '-' &&
            gameState[a] === gameState[b] &&
            gameState[a] === gameState[c]
        ) {
            return gameState[a]; // Returns 'X' or 'O' for the winner
        }
    }

    return null; // No winner yet
};

module.exports = handlePostMoveNotification;
