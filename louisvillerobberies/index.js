var Alexa = require('alexa-sdk');
var db = require('./db.js');
var constants = require('./constants.js');

var handlers = {
    "GetCrime": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, this.event.request.intent.slots.Area.value, this.event.request.intent.slots.Month.value);
    },
    "GetCrimeThisYear": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, this.event.request.intent.slots.Area.value, "THIS_YEAR");
    },
    "GetCrimeLastYear": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, this.event.request.intent.slots.Area.value, "LAST_YEAR");
    },
    "GetCrimeLastMonth": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, this.event.request.intent.slots.Area.value, "LAST_MONTH");
    },
    "GetCrimeLastYearLouisville": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, constants.CITY, "LAST_YEAR");
    },
    "GetCrimeLastMonthLouisville": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, constants.CITY, "LAST_MONTH");
    },
    "GetCrimeThisYearLouisville": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, constants.CITY, "THIS_YEAR");
    },
    "GetCrimeLouisville": function() {
        db.getCrimeCount(this, this.event.request.intent.slots.Crime.value, constants.CITY, this.event.request.intent.slots.Month.value);
    },
    "GetSupportedCrimeTypes": function() {
        db.getSupportedCrimeTypes(this);
    },
    "GetCrimeDetailsLouisville": function() {
        var neighborhood = !this.event.request.intent.slots.Area ? null : this.event.request.intent.slots.Area.value;

        db.getCrimeDetails(this, this.event.request.intent.slots.CrimeSingular.value, neighborhood);
    },

    "AMAZON.HelpIntent": function() {
        var speak = "Here are some sample questions: ";
        speak += "Alexa, ask " + constants.SKILL_NAME + " how many robberies occurred in January in The Highlands. ";
        speak += "Or, Alexa, ask " + constants.SKILL_NAME + " how many assaults happened last month in Fairdale. ";
        speak += "To hear a list of supported crime types, say, Alexa, ask " + constants.SKILL_NAME + " what crime types are supported.";
        
        this.emit(':tell', speak, speak);
    },

    "AMAZON.StopIntent": function() {
        this.emit(':tell', "Goodbye");
    },

    "AMAZON.CancelIntent": function() {
        this.emit(':tell', "Goodbye");
    },

    "LaunchRequest": function() {
        var repromptText = "For instructions on what you can say, please say help.";

        var speak = "Welcome to " + constants.SKILL_NAME + "! ";
        speak += "You can ask questions about crime in certain neighborhoods. " + repromptText;
        
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