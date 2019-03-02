const axios = require("axios");

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

exports.handler = async (event, context, callback) => {
  console.log(event);
  try {
    switch (event.request.type) {
      case "LaunchRequest": {
        callback(null, respond("Welcome to comic book trivia"));
        break;
      }
      case "SessionEndedRequest": {
        callback(null, respond("See you next time"));
        break;
      }
      case "IntentRequest": {
        const { name, slots } = event.request.intent;
        switch (name) {
          case "getQuestion": {
            const questionResponse = await axios.get(
              "http://jservice.io/api/random"
            );
            const { answer, question } = questionResponse.data[0];
            callback(null, respond(`${question}`, { answer, question }));
            callback(null, respond("there was an error"));
            break;
          }
          case "answerQuestion": {
            const { answer } = event.session.attributes;
            if (answer.toLowerCase() === slots.answer.value.toLowerCase()) {
              callback(null, respond("that's correct. good job."));
            } else {
              callback(null, respond("sorry that was the wrong answer"));
            }
            break;
          }
          default: {
            callback(null, respond(`Intent type is ${name}`));
            break;
          }
        }
        break;
      }
    }
  } catch (e) {
    console.log(e);
    callback(`Error: ${e}`);
  }
};
