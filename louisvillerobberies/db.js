var mysql = require('mysql');
var step = require('step');
var moment = require('moment');
var constants = require('./constants.js');

var connection = mysql.createConnection(
    {
      host     : 'civicdata.crogewynsqom.us-east-1.rds.amazonaws.com',
      user     : 'ro',
      password : 'civicdataalliance',
      database : 'louisvilleky',
    }
);

const MONTH_MAP = new Map();
const CRIME_MAP = new Map(); // TODO this will eventually be a database lookup
const CRIME_MAP_SINGULAR = new Map();
const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function init() {
    // there's probably a library or service out there for this kind of thing.
    // this was quick and dirty and doesn't account for leap years.
    // TODO possibly make use of some moment.js magic.
    MONTH_MAP.set("january", " '{year}-01-01 00:00:00' and '{year}-01-31 23:59:59' ");
    MONTH_MAP.set("february", " '{year}-02-01 00:00:00' and '{year}-02-28 23:59:59' ");
    MONTH_MAP.set("march", " '{year}-03-01 00:00:00' and '{year}-03-31 23:59:59' ");
    MONTH_MAP.set("april", " '{year}-04-01 00:00:00' and '{year}-04-30 23:59:59' ");
    MONTH_MAP.set("may", " '{year}-05-01 00:00:00' and '{year}-05-31 23:59:59' ");
    MONTH_MAP.set("june", " '{year}-06-01 00:00:00' and '{year}-06-30 23:59:59' ");
    MONTH_MAP.set("july", " '{year}-07-01 00:00:00' and '{year}-07-31 23:59:59' ");
    MONTH_MAP.set("august", " '{year}-08-01 00:00:00' and '{year}-08-31 23:59:59' ");
    MONTH_MAP.set("september", " '{year}-09-01 00:00:00' and '{year}-09-30 23:59:59' ");
    MONTH_MAP.set("october", " '{year}-10-01 00:00:00' and '{year}-10-31 23:59:59' ");
    MONTH_MAP.set("november", " '{year}-11-01 00:00:00' and '{year}-11-30 23:59:59' ");
    MONTH_MAP.set("december", " '{year}-12-01 00:00:00' and '{year}-12-31 23:59:59' ");

    // map the user's request to various CRIME_TYPEs in the crimeData DB.
    CRIME_MAP.set("murders", "HOMICIDE");
    CRIME_MAP.set("homicides", "HOMICIDE");
    CRIME_MAP.set("robberies", "ROBBERY");
    CRIME_MAP.set("assaults", "ASSAULT");
    CRIME_MAP.set("sex crimes", "SEX CRIMES");
    CRIME_MAP.set("DUIs", "DUI");

    CRIME_MAP_SINGULAR.set("murder", "HOMICIDE");
    CRIME_MAP_SINGULAR.set("homicide", "HOMICIDE");
    CRIME_MAP_SINGULAR.set("robbery", "ROBBERY");
    CRIME_MAP_SINGULAR.set("assault", "ASSAULT");
    CRIME_MAP_SINGULAR.set("sex crime", "SEX CRIMES");
    CRIME_MAP_SINGULAR.set("DUI", "DUI");
}

function getCrimeCount(alexa, crime, neighborhood, month) {
    // There is a method to the toUpper/toLower madness here. Alexa pronounces 'DUI' properly when it's an acronym but falters on 'dui'. 
    // The goal is to strike a good balance between pronunciation and properly formatted text in the Alexa app on 'tellWithCard' responses.
    var crimeCount = -1;

    step (
        function getCrimeCount() {
            var crimeType = CRIME_MAP.get(crime);

            if(typeof crimeType !== 'undefined' && crimeType) {
                var sql = " select count(CRIME_TYPE) as cnt " +
                          " from crimeData " +
                          " where CRIME_TYPE = ? and ";
                if(neighborhood.toUpperCase() != 'LOUISVILLE')
                    sql += " ZIP_CODE in (select zip from zipCodeLookup where neighborhood = '" + neighborhood.toLowerCase() + "') and ";

                switch(month.toUpperCase()) {
                    case 'LAST_MONTH':
                        sql += buildDateBetweenClauseLastMonth();
                        break;
                    case 'THIS_YEAR':
                        sql += buildDateBetweenClauseThisYear();
                        break;
                    case 'LAST_YEAR':
                        sql += buildDateBetweenClauseLastYear();
                        break;
                    default:
                        sql += buildDateBetweenClause(month);
                }

                console.log(sql);
                connection.query(sql, [crimeType], this);
            } else {
                speak = "I'm sorry, I don't support the crime type " + crime + ". To hear a list of which types I understand, please say: " +
                        "Alexa, ask " + constants.SKILL_NAME + " which crime types are supported.";
                alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
                return;
            }
        },
        function finish(err, rows, fields) {
            var speak;

            if(err) {
                speak = "I'm having trouble getting that information. Please try again later.";
                console.log(err);
            } else {
                crimeCount = rows[0].cnt;

                if(crimeCount == 0) {
                    step (
                        // if crimeCount = 0 we want to check that we have zip entries for the requested neighborhood.
                        // it's possible that the user supplied something for which we haven't accounted.
                        function getNeighborhoodCount() {
                            var sql = " select count(zip) as cnt from zipCodeLookup where neighborhood = ? ";
                            connection.query(sql, [neighborhood], this);
                        },
                        function finish(err, rows, fields) {
                            var neighborhoodCount = -1;
                            
                            if(err) {
                                console.log(err);
                            } else {
                                neighborhoodCount = rows[0].cnt;

                                if(neighborhoodCount > 0 || neighborhood.toUpperCase() === 'LOUISVILLE') {
                                    speak = buildSpeechOutput(crimeCount, neighborhood, month, crime);
                                } else {
                                    speak = "I don't have any zip codes configured for " + neighborhood + ".";
                                    console.log("No zips configured for " + neighborhood);
                                }
                            }

                            // commented out these connection.end() statements. 
                            // they were causing issues during testing where every other test would fail.
                            // bonus is that requests respond faster but need to figure out how to check # of open DB connections on RDS.
                            //connection.end();
                            alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
                        }
                    );
                } else {
                    speak = buildSpeechOutput(crimeCount, neighborhood, month, crime);
                    //connection.end();
                    alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
                }
            }
        }
    );
}

function getSupportedCrimeTypes(alexa) {

    var speak = "I currently understand the following crime types: " + Array.from(CRIME_MAP.keys()).toString();

    alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
}

function getCrimeDetails(alexa, crime, neighborhood) {
    var crimeType = '';

    step (
        function getCrimeDetails() {
            crimeType = CRIME_MAP_SINGULAR.get(crime);

            if(typeof crimeType !== 'undefined' && crimeType) {
                var sql = " select date_reported, uor_desc, premise_type, trim(block_address) as block_address " +
                          " from crimeData " +
                          " where CRIME_TYPE = ? ";
                if(neighborhood.toUpperCase() != 'LOUISVILLE')
                    sql += " and ZIP_CODE in (select zip from zipCodeLookup where neighborhood = ? ) ";

                sql += " order by date_reported desc limit 1";

                console.log(sql);
                connection.query(sql, [crimeType], this);
            } else {
                speak = "I'm sorry, I don't support the crime type " + crime + ". To hear a list of which types I understand, please say: " +
                        "Alexa, ask " + constants.SKILL_NAME + " which crime types are supported.";
                alexa.emit(':tell', speak, constants.SKILL_NAME, speak);
                return;
            }
        },
        function finish(err, rows, fields) {
            var speak;

            if(err) {
                speak = "I'm having trouble getting that information. Please try again later.";
                console.log(err);
            } else {
                //crimeCount = rows[0].cnt;
                var dateTimeReported = moment(rows[0].date_reported).format('dddd, MMMM Mo, [at] h:mm a');
                speak = "The most recent " + crime + " was a " + rows[0].uor_desc + " charge, reported on " + dateTimeReported + ". ";
                speak += "It occurred at a " + rows[0].premise_type + ", at " + rows[0].block_address + ".";

                alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
                /*
                if(crimeCount == 0) {
                    step (
                        // if crimeCount = 0 we want to check that we have zip entries for the requested neighborhood.
                        // it's possible that the user supplied something for which we haven't accounted.
                        function getNeighborhoodCount() {
                            var sql = " select count(zip) as cnt from zipCodeLookup where neighborhood = ? ";
                            connection.query(sql, [neighborhood], this);
                        },
                        function finish(err, rows, fields) {
                            var neighborhoodCount = -1;
                            
                            if(err) {
                                console.log(err);
                            } else {
                                neighborhoodCount = rows[0].cnt;

                                if(neighborhoodCount > 0 || neighborhood.toUpperCase() === 'LOUISVILLE') {
                                    speak = buildSpeechOutput(crimeCount, neighborhood, month, crime);
                                } else {
                                    speak = "I don't have any zip codes configured for " + neighborhood + ".";
                                    console.log("No zips configured for " + neighborhood);
                                }
                            }

                            // commented out these connection.end() statements. 
                            // they were causing issues during testing where every other test would fail.
                            // bonus is that requests respond faster but need to figure out how to check # of open DB connections on RDS.
                            //connection.end();
                            alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
                        }
                    );
                } else {
                    speak = buildSpeechOutput(crimeCount, neighborhood, month, crime);
                    //connection.end();
                    alexa.emit(':tellWithCard', speak, constants.SKILL_NAME, speak);
                }
                */
            }
        }
    );
}

function buildSpeechOutput(count, neighborhood, month, crime) {
    var out = "There were " + count + " " + crime + " reported in " + neighborhood;

    switch(month) {
        case 'LAST_MONTH':
            out += " last month.";
            break;
        case 'THIS_YEAR':
            out = "There have been " + count + " " + crime + " reported in " + neighborhood + " this year.";
            break;
        case 'LAST_YEAR':
            out += " last year.";
            break;
        default:
             out += " in " + month + ".";
    }

    return out;
}

function buildDateBetweenClause(month) {
    var year = new Date().getFullYear();
    var mapVal = MONTH_MAP.get(month.toLowerCase());
    var betweenClause = ' 1 = 1 ';

    if(typeof mapVal !== 'undefined' && mapVal) {
        betweenClause = ' (DATE_OCCURED between ' + mapVal.replace(new RegExp('{year}', 'g'), year) + ') ';
    } else {
        console.log("Month value [" + month + "] not found in MONTH_MAP.");
    }

    return betweenClause;
}

function buildDateBetweenClauseThisYear() {
    // clause encompasses first day of this year to present
    var betweenClause = " (DATE_OCCURED between '" + moment().startOf('year').format(DATE_FORMAT) + "' and '" + moment().format(DATE_FORMAT) + "')";

    return betweenClause;
}

function buildDateBetweenClauseLastYear() {
    // clause encompasses first and last days of previous year
    var lastYear = moment().subtract(1, 'years');
    var betweenClause = " (DATE_OCCURED between '" + lastYear.startOf('year').format(DATE_FORMAT) + "' and '" + lastYear.endOf('year').format(DATE_FORMAT) + "')";

    return betweenClause;
}

function buildDateBetweenClauseLastMonth() {
    var lastMonth = moment().subtract(1, 'months');
    var betweenClause = " (DATE_OCCURED between '" + lastMonth.startOf('month').format(DATE_FORMAT) + "' and '" + lastMonth.endOf('month').format(DATE_FORMAT) + "')";

    return betweenClause;
}

init();

module.exports.getCrimeCount = getCrimeCount;
module.exports.getSupportedCrimeTypes = getSupportedCrimeTypes;
module.exports.getCrimeDetails = getCrimeDetails;
