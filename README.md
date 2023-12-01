# AWS-Tic-Tac-Toe

1. Group Members: Jadyn Barrett
2. API Gateway: https://lwu2s3d8oc.execute-api.us-east-1.amazonaws.com/prod
3. Instructions for CLI Usage:
   1. You do not need to run 'source env2.sh' as I installed an extensions ___________
   2. cd into application and then run 'node app.js'
   3. Make sure you have access to both emails you plan to play with as this game does not support playing ____________
   4. You will be asked if you want to register or login.
        1. Register:
             1. If you choose the register option, you will be asked to confirm your choice. Type in Y or N (not case-sensitive). If you type N, you will be taken back to the previous page where you can choose to either register or login.
             2. Enter your email.
             3. Enter your password. Your input will be hidden.
             4. You will see the message 'User created successfully: {email: <your_email>}'.
             5. You will be taken back to the register/login page where you can register another user or you can login.
        2. Login:
             1. Enter your email.
             2. Enter your password. Your input will be hidden.
             3. You see the message 'What do you want to do?'. You have three choices, Create Game, Join Game, and Register a New Player.
                  1. Create Game:
                       1. You will be asked to confirm your choice with the message 'Are you sure you want to create a new game? (y/N). Type in Y or N (not case-sensitive) to confirm your choice. If you type N, you will be taken back to the previous page where you can choose between the three options again.
                       2. If you typed in Y on the confirmation question, you will be asked to enter the email of who you want to play against, your opponent. Again, make sure you have access to this email.
                       3. The game will send the creator -- the one who created the game, and the opponent an SNS Subscription opt-in. Make sure to click on the link as this makes sure you get the correct game updates. The opponent will also get an email with a game Id to join your game. 
                       4. Re-run 'node app.js', log in with either the creator email or the opponent email and move to the Join Game step.
                  3. Join Game:
                       1. You will be asked to confirm your choice with the message 'Are you sure you want to join a game? (y/N). Type in Y or N (not case-sensitive) to confirm your choice. If you type N, you will be taken back to the previous page where you can choose between the three options again.
                       2. If you confirmed yes, you will get the message 'Enter game id'. Enter a game id and press enter.
                  4. Register a New Player:
                       1. Repeat the register steps
   5. Playing the Game: Now that you're all set up to play the game, whichever email you signed in with will be the first player to go. Input a number 0 though 8. Pressing enter will confirm your move and will send a game update to the other player saying it's their turn to move. The way the game is set up, one person is able to play by themselves and the emails will switch off with each move, keeping track of their own inputs. You will switch between the creator and opponent until one player wins the game! At this point, a message will be sent to both emails stating the game is over, congratulating the winner, and showing the final board state. A message will also be sent to the loser as well explaining that the game is over, the other player won, and show the final board state. If the game ends in a tie, a message will be sent to both emails stating that the game ended in a tie and show the final board state.
4. Challenges Encountered: One of the most challenging part of this assignment was getting the win conditions to work and sending the resulting SES notifications. I had a very difficult time getting the game to stop after a player got three in a row as I wasn't passing in the game information correctly. Eventually I figured it out by using print statements to see what was undefined and where the disconnect happened. Once the win conditions worked, I had troubles getting the SES notifications to work. I kept getting the error: sendMessage is not a function. This is my first time ever coding in JavaScript so this was a challenge because I don't know the syntax of the language very well. I ended up figuring out that I needed to add brackets around the export module line like : module.exports = {sendMessage2}. This fixed my issue and I was able to successfully send SES notifications to both emails. This was completely done by trial and error to see what worked and what didn't. 
5. Buggy/Unimplemented Features: With more time, I would have liked to figure out how to display a previous game board before the player had to move if the user re-joined the game. Right now, it's showing an empty board state because, the way the program is written, an empty board is displayed before calling the function to perform a move. This is a difficult fix because printing the updated board state requires many unique variables that I'm unable to pass into the function as they aren't being defined until after the performMove runs. 


