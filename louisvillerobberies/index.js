var Alexa = require('alexa-sdk');
var db = require('./db.js');

const SKILL_NAME = "Louisville Robberies";

var handlers = {
    "GetRobberies": function() {
        db.getRobberyCount(this, this.event.request.intent.slots.Area.value.toLowerCase(), this.event.request.intent.slots.Month.value.toLowerCase(), SKILL_NAME);
    },
    "GetRobberiesThisYear": function() {
        db.getRobberyCount(this, this.event.request.intent.slots.Area.value.toLowerCase(), "THIS_YEAR", SKILL_NAME);
    },
    "GetRobberiesLastYear": function() {
        db.getRobberyCount(this, this.event.request.intent.slots.Area.value.toLowerCase(), "LAST_YEAR", SKILL_NAME);
    },
    "GetRobberiesLastMonth": function() {
        db.getRobberyCount(this, this.event.request.intent.slots.Area.value.toLowerCase(), "LAST_MONTH", SKILL_NAME);
    },

    "AMAZON.HelpIntent": function() {
        var speak = "Here are some questions you can ask: ";
        speak += "How many robberies occurred in January in The Highlands?";
        speak += "Or, how many robberies happened last month in Fairdale?";
        speak += "You can also say stop if you're done. ";
        this.emit(':ask', speak, speak);
    },

    "AMAZON.StopIntent": function() {
        this.emit(':tell', "Goodbye");
    },

    "AMAZON.CancelIntent": function() {
        this.emit(':tell', "Goodbye");
    },

    "LaunchRequest": function() {
        var speak = "Welcome to " + SKILL_NAME + ". ";
        speak += "You can ask questions about the number of robberies in a certain neighborhood.";
        var repromptText = "For instructions on what you can say, please say help me.";
        this.emit(':ask', speak, repromptText);
    }
};

exports.handler = function(event, context) {
    var alexa = Alexa.handler(event, context);

    //alexa.appId = "amzn1.ask.skill.f1666054-3195-4e05-9e59-d32d227c9c87"; // scott's
    alexa.appId = "amzn1.ask.skill.adb80810-23d3-4b83-96d4-ec6a407bc831";
    alexa.registerHandlers(handlers);
    alexa.execute();
};