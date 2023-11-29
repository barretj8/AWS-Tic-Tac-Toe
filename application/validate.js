// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const Joi = require("joi");

const extractError = error => {
  return error.details[0].message;
};

// Request body validation for the POST /users endpoint
const validateCreateUser = body => {
  const schema = Joi.object().keys({
    email: Joi.string().email({ minDomainAtoms: 2 }).required(),
    password: Joi.string().min(8).max(20).required(),
    username: Joi.string().min(4).max(20).required()
  });

  const result = Joi.validate(body, schema);
  if (result.error) {
    return {
      valid: false,
      message: extractError(result.error)
    };
  }
  return {
    valid: true
  };
};

// Request body validation for the POST /games endpoint
const validateCreateGame = body => {
  const schema = Joi.object().keys({
    opponent: Joi.string().min(4).max(20).required()
  });

  const result = Joi.validate(body, schema);
  if (result.error) {
    return {
      valid: false,
      message: extractError(result.error)
    };
  }
  return {
    valid: true
  };
};

const validatePerformMove = (gameState, position, currentPlayer) => {
    // Check if the position is within the valid range (0-8 for a 3x3 grid)
    if (position < 0 || position > 8) {
        return {
            valid: false,
            message: 'Position must be between 0 and 8 (inclusive).'
        };
    }

    // Check if the selected position is already occupied
    if (gameState[position] !== '-') {
        return {
            valid: false,
            message: 'Selected position is already occupied.'
        };
    }

    // Validate that the move is made by the correct player (X or O)
    const expectedSymbol = currentPlayer === 'Creator' ? 'X' : 'O';
    if (gameState[position] !== expectedSymbol) {
        return {
            valid: false,
            message: `It's not ${currentPlayer}'s turn.`
        };
    }

    // If all checks pass, the move is valid
    return {
        valid: true
    };
};

module.exports = {
  validateCreateUser,
  validateCreateGame,
  validatePerformMove
};
