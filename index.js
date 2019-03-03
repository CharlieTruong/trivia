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
          case "AMAZON.YesIntent":
          case "getQuestion": {
            let answered = false;
            if (event.session.attributes) {
              answered = event.session.attributes.answered;
            }
            if (name == "AMAZON.YesIntent" && !answered) {
              return;
            }

            const questionResponse = await axios.get(
              "http://jservice.io/api/random"
            );
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
