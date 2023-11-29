// module.exports = app;
// // Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// // SPDX-License-Identifier: MIT-0
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();
const { createGame, fetchGame, performMove, handlePostMoveNotification } = require("./data");
const { createCognitoUser, login, fetchUserByUsername, verifyToken } = require("./auth");
const { validateCreateUser, validateCreateGame, validatePerformMove } = require("./validate");


const inquirer = require("inquirer");

async function joinOrCreateGame(token) {
   const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: ['Create game', 'Join game']
        }
    ]);

    if (action === 'Create game') {
        await createNewGame(token);
    } else if (action === 'Join game') {
        console.log("join game");
        await joinGame(token); // token?
    }
}

async function main() {
    const { action } = await inquirer.prompt([
        {
            type: 'list',
            name: 'action',
            message: 'What do you want to do?',
            choices: ['Register', 'Login']
        }
    ]);

    if (action === 'Register') {
        await registerUser();
    } else if (action === 'Login') {
        await loginUser();
    }
}

async function registerUser() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter your email:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
       
    ]);

    try {
        const user = await createCognitoUser(answers.email, answers.password);
        console.log('User created successfully:', user);
        loginUser();
    } catch (error) {
        console.error('Error creating user:', error);
    }
}

async function getPlayerMove(player) {
    const { position } = await inquirer.prompt([
        {
            type: 'input',
            name: 'position',
            message: `${player}'s turn. Enter position (0-8) This is 0-indexed:`,
            validate: input => {
                // Ensure the input is a number between 0 and 8
                return !isNaN(input) && input >= 0 && input < 9;
            }
        }
    ]);
    return parseInt(position, 10);
}


// Helper function to format the game state into a 3x3 board
const formatGameState = (gameState) => {
    let formattedBoard = '';
    for (let i = 0; i < gameState.length; i++) {
        formattedBoard += gameState[i] + ' ';
        if ((i + 1) % 3 === 0) formattedBoard += '\n';
    }
    return formattedBoard;
};

async function createNewGame(token) {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'email', message: 'Enter email of opponent:' }
    ]);

    try {
        let userEmail='';
        
        verifyToken(token).then(decodedToken => {
            // Here, decodedToken contains the user's information.
            userEmail = decodedToken.email;
          })
          .catch(error => {
            // Handle any errors that occur during token verification
            console.error("Token verification failed:", error);
          });
          
        const opponent = await fetchUserByUsername(answers.email);
        const opponentEmail = opponent.email;
        const game = await createGame({
          creator: userEmail,
          opponent: opponentEmail
        });
              
    } catch (error) {
        console.error('Create new game failed:', error);
    }
}

async function playGame(gameId, token, creator) {
    const getParams = {
        TableName: 'turn-based-game',
        Key: { gameId: gameId }
    };
    const gameData = await documentClient.get(getParams).promise();
    let isGameEnded = false;
    
    // Print initial board
    let gameState = '---------'; // Initial game state of the board
    let formatgs = formatGameState(gameState);
    
    console.log('\n');
    console.log(formatgs);

    let userEmail = '';
    let currentPlayer = '';
    
    verifyToken(token).then(decodedToken => {
        // DecodedToken contains the user's information.
        userEmail = decodedToken.email;
        currentPlayer = userEmail === gameData.Item.user1 ? 'Creator' : 'Opponent';
        
    // Handle any errors that occur during token verification
    }).catch(error => {console.error("Token verification failed:", error);});

    while (!isGameEnded) {
        await new Promise(resolve => setTimeout(resolve, 250));
        const position = await getPlayerMove(currentPlayer);
        const symbol = currentPlayer === 'Creator' ? 'X' : 'O';
        
        try {
            const game = await performMove({ gameId, player: currentPlayer, position, symbol });
            let opponentUsername;
            if (game.user1 !== game.lastMoveBy) {
                opponentUsername = game.user1;
                console.log('opponent username:', opponentUsername);
              } else {
                opponentUsername = game.user2;
                console.log('opponent username:', opponentUsername);
              }
              const opponent = await fetchUserByUsername(opponentUsername);
              console.log('test after opponent creation', opponent);
              const mover = {username: userEmail};
            //   const result = await handlePostMoveNotification({ game, mover, opponentUsername }); // win state
            //   console.log('test after result creation', handlePostMoveNotification);
            //   if(result.isGameOver) {
            //       break;
            //   }
            //   console.log('currentPlaer check before assigning');
              currentPlayer = currentPlayer === 'Creator' ? 'Opponent' : 'Creator';
            //   console.log('test after assigning the new current player', currentPlayer);
        } catch (error) {
            console.error('error message when trying to performMove:', error.message);
            continue; // If move is invalid, retry
        }
    }
}


async function joinGame(token) {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'gameId', message: 'Enter game id:' }
    ]);

    try {
        const game = await fetchGame(answers.gameId);
        if (!game) {
            throw new Error("Game not found.");
        }
        
        await playGame(answers.gameId, token);
        
    } catch (error) {
        console.error('Join game failed:', error.message);
    }
}

// Ensure fetchGame and playGame are properly defined and handle errors

async function loginUser() {
    const answers = await inquirer.prompt([
        { type: 'input', name: 'username', message: 'Enter your username:' },
        { type: 'password', name: 'password', message: 'Enter your password:' }
    ]);

    try {
        const token = await login(answers.username, answers.password);
        console.log('Login successful.');
        joinOrCreateGame(token);
        
    } catch (error) {
        console.error('Login failed:', error);
    }
}

main();
