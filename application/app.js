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
 //   const inquirer = await loadInquirer();
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

    // Additional CLI logic for your Tic Tac Toe game
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
    console.log('Received Position in getPlayerMove function: ', position)
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
        // Assuming idToken is the token you received after the user logs in
        let userEmail='';
        verifyToken(token)
          .then(decodedToken => {
            // Here, decodedToken contains the user's information.
            userEmail = decodedToken.email;
            console.log("User's email:", userEmail);
            
          })
          .catch(error => {
            // Handle any errors that occur during token verification
            console.error("Token verification failed:", error);
          });
          
        const opponent = await fetchUserByUsername(answers.email);
        const opponentEmail = opponent.email;
        console.log("opponent email", opponentEmail);
        // console.log("TOKEN", token);
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
    let gameState = '---------'; // Initial empty board
    let formatgs = formatGameState(gameState);
    
    console.log('\n');
    console.log(formatgs);
    // console.log('token', token);

    let userEmail = '';
    let currentPlayer = ''; // Declare currentPlayer outside the block
    
    verifyToken(token).then(decodedToken => {
        // Here, decodedToken contains the user's information.
        userEmail = decodedToken.email;
        currentPlayer = userEmail === gameData.Item.user1 ? 'Creator' : 'Opponent';
        console.log("User's email:", userEmail);
        
    // Handle any errors that occur during token verification
    }).catch(error => {console.error("Token verification failed:", error);});

    while (!isGameEnded) {
        await new Promise(resolve => setTimeout(resolve, 250));
        console.log('is this where the issue is the second time around?');
        const position = await getPlayerMove(currentPlayer);
        console.log('position', position);
        console.log('is this where the issue is the second time?');
        const symbol = currentPlayer === 'Creator' ? 'X' : 'O'; // Map '1' to 'X', '0' to 'O'
        console.log('symbol', symbol);
        try {

            const game = await performMove({ gameId, player: currentPlayer, position, symbol });
            console.log('printing game', game);
            console.log('test test');
            let opponentUsername;
            console.log('test1');
            if (game.user1 !== game.lastMoveBy) {
                console.log('test1.5');
                opponentUsername = game.user1
                console.log('opponent username is user1', opponentUsername);
              } else {
                opponentUsername = game.user2
                console.log('test 2');
              }
              const opponent = await fetchUserByUsername(opponentUsername);
              console.log('test after opponent creation');
              const mover = {username: userEmail}
              console.log('test after creating mover');
            //   const result = await handlePostMoveNotification({ game, mover, opponent }) // win state
            //   console.log('test after result creation', handlePostMoveNotification);
            //   if(result.isGameOver) {
            //       break;
            //   }
              console.log('currentPlaer check before assigning');
              currentPlayer = currentPlayer === '1' ? '2' : '1';
              console.log('test after assigning the new current player', currentPlayer);
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
        // create game or join game
        joinOrCreateGame(token);
        
        // Store the token for future use in your application
    } catch (error) {
        console.error('Login failed:', error);
    }
}

main();
