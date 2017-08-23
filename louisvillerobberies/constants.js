// map the user's request to various CRIME_TYPEs in the crimeData DB.
// TODO get these into a DB
const CRIME_MAP = new Map();
const CRIME_MAP_SINGULAR = new Map();

CRIME_MAP.set("murders", "HOMICIDE");
CRIME_MAP.set("homicides", "HOMICIDE");
CRIME_MAP.set("robberies", "ROBBERY");
CRIME_MAP.set("assaults", "ASSAULT");
CRIME_MAP.set("sex crimes", "SEX CRIMES");
CRIME_MAP.set("DUIs", "DUI");
CRIME_MAP.set("weapons charges", "WEAPONS");
CRIME_MAP.set("thefts", "THEFT/LARCENY");
CRIME_MAP.set("vehicle thefts", "MOTOR VEHICLE THEFT");
CRIME_MAP.set("vandalism charges", "VANDALISM");
CRIME_MAP.set("fraud charges", "FRAUD");
CRIME_MAP.set("burglaries", "BURGLARY");
CRIME_MAP.set("arson charges", "ARSON");
CRIME_MAP.set("drug charges", "DRUGS/ALCOHOL VIOLATIONS");
CRIME_MAP.set("vehicle break ins", "VEHICLE BREAK-IN/THEFT");

CRIME_MAP_SINGULAR.set("murder", "HOMICIDE");
CRIME_MAP_SINGULAR.set("homicide", "HOMICIDE");
CRIME_MAP_SINGULAR.set("robbery", "ROBBERY");
CRIME_MAP_SINGULAR.set("assault", "ASSAULT");
CRIME_MAP_SINGULAR.set("sex crime", "SEX CRIMES");
CRIME_MAP_SINGULAR.set("DUI", "DUI");
CRIME_MAP_SINGULAR.set("weapons charge", "WEAPONS");
CRIME_MAP_SINGULAR.set("theft", "THEFT/LARCENY");
CRIME_MAP_SINGULAR.set("vehicle theft", "MOTOR VEHICLE THEFT");
CRIME_MAP_SINGULAR.set("vandalism charge", "VANDALISM");
CRIME_MAP_SINGULAR.set("fraud charge", "FRAUD");
CRIME_MAP_SINGULAR.set("burglary", "BURGLARY");
CRIME_MAP_SINGULAR.set("arson charge", "ARSON");
CRIME_MAP_SINGULAR.set("vehicle break in", "VEHICLE BREAK-IN/THEFT");
CRIME_MAP_SINGULAR.set("drug charge", "DRUGS/ALCOHOL VIOLATIONS");


module.exports.SKILL_NAME = "Louisville Crime";
module.exports.CITY = "Louisville";

module.exports.UNRECOGNIZED_CRIME_TYPE_RESPONSE = "I'm sorry, I don't support the crime type {crime}. To hear a list of which types I understand, please say: " +
        										  "Alexa, ask " + this.SKILL_NAME + " which crime types are supported.";
module.exports.ERROR_RESPONSE = "I'm having trouble getting that information. Please try again later.";

module.exports.CRIME_MAP = CRIME_MAP;
module.exports.CRIME_MAP_SINGULAR = CRIME_MAP_SINGULAR;