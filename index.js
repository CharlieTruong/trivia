/**
 * This modules defines a lambda function to handle the Alexa trivia skill
 */
const axios = require("axios");

/**
 * Returns an Alexa response object
 *
 * @param {string} response - the text response that Alexa should say
 * @param {Object} sessionAttributes - any session params to pass back to the
 *  Alexa device
 * @param {boolean} shouldEndSession - whether the session should be ended
 * @returns the Alexa response object
 */
const respond = (
  response,
  sessionAttributes = {},
  shouldEndSession = false
) => ({
  response: {
    shouldEndSession,
    outputSpeech: {
      type: "PlainText",
      text: response
    }
  },
  sessionAttributes,
  version: "1.0"
});

/**
 * The lambda function that handles an Alexa event
 *
 * @param {Object} event - the event object that initiated the lambda. This
 *  includes metadata on the event request type and intent.
 * @param {Object} context - an object that provides methods about the
 *  invocation and execution environment
 * @param {Function} callback - the method to invoke to respond to the Alexa
 *  event
 */
exports.handler = async (event, context, callback) => {
  try {
    switch (event.request.type) {
      // Handle the initial invocation
      case "LaunchRequest": {
        callback(null, respond("Welcome to Charlie's trivia game."));
        break;
      }

      // Handle a session close request
      case "SessionEndedRequest": {
        callback(null, respond("See you next time."));
        break;
      }

      // Handle Intents
      case "IntentRequest": {
        const { name, slots } = event.request.intent;
        switch (name) {
          // Ask a question including the case where a user wants to play
          // again after answering a previous question.
          case "AMAZON.YesIntent":
          case "getQuestion": {
            const answered =
              event.session.attributes && event.session.attributes.answered;
            // Only handle a Yes Intent if the question was already answered
            if (name == "AMAZON.YesIntent" && !answered) {
              return;
            }

            // Fetch a random question from jservice.io
            const questionResponse = await axios.get(
              "http://jservice.io/api/random"
            );

            // Ask the question
            const { answer, category, question } = questionResponse.data[0];
            const questionText = `In the category "${
              category.title
            }", ${question}`;
            callback(
              null,
              respond(questionText, { answer, category, question })
            );
            break;
          }

          // Check if the answer is correct and ask if the user wants to
          // play again.
          case "answerQuestion": {
            const { answer } = event.session.attributes;
            if (answer.toLowerCase() === slots.answer.value.toLowerCase()) {
              callback(
                null,
                respond("that's correct. would you like another question?", {
                  answered: true
                })
              );
            } else {
              callback(
                null,
                respond("that's wrong. would you like another question?", {
                  answered: true
                })
              );
            }
            break;
          }

          // If the user does not want to play again, then end the session.
          case "AMAZON.NoIntent": {
            if (
              event.session.attributes &&
              !event.session.attributes.answered
            ) {
              return;
            }
            callback(null, respond("It was fun playing", {}, true));
          }
        }
        break;
      }
    }
  } catch (e) {
    console.log(e);
    callback(`Error: ${e}`, respond("Something went wrong"));
  }
};
