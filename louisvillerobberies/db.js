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

const DATE_FORMAT = 'YYYY-MM-DD HH:mm:ss';

function getCrimeCount(alexa, crime, neighborhood, month) {
    // There is a method to the toUpper/toLower madness here. Alexa pronounces 'DUI' properly when it's an acronym but falters on 'dui'. 
    // The goal is to strike a good balance between pronunciation and properly formatted text in the Alexa app on 'tellWithCard' responses.
    var crimeCount = -1;

    step (
        function getCrimeCount() {
            var crimeType = constants.CRIME_MAP.get(crime);

            if(typeof crimeType !== 'undefined' && crimeType) {
                var sql = " select count(CRIME_TYPE) as cnt " +
                          " from crimeData " +
                          " where CRIME_TYPE = ? and ";
                if(neighborhood.toUpperCase() != constants.CITY)
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
                var text = constants.UNRECOGNIZED_CRIME_TYPE_RESPONSE.replace('{crime}', crime);
                alexa.emit(':tellWithCard', text, constants.SKILL_NAME, text);
                return;
            }
        },
        function finish(err, rows, fields) {
            var text;

            if(err) {
                text = constants.ERROR_RESPONSE;
                console.log(err);
            } else {
                crimeCount = rows[0].cnt;

                if(crimeCount == 0) {
                    step (
                        // if crimeCount = 0, check that we have zip entries for the requested neighborhood.
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

                                if(neighborhoodCount > 0 || neighborhood.toUpperCase() === constants.CITY) {
                                    text = buildSpeechOutput(crimeCount, neighborhood, month, crime);
                                } else {
                                    text = "I don't have any zip codes configured for " + neighborhood + ".";
                                    console.log("No zips configured for " + neighborhood);
                                }
                            }

                            // commented out these connection.end() statements. 
                            // they were causing issues during testing where every other test would fail.
                            // bonus is that requests respond faster but need to figure out how to check # of open DB connections on RDS.
                            //connection.end();
                            alexa.emit(':tellWithCard', text, constants.SKILL_NAME, text);
                        }
                    );
                } else {
                    text = buildSpeechOutput(crimeCount, neighborhood, month, crime);
                    //connection.end();
                    alexa.emit(':tellWithCard', text, constants.SKILL_NAME, text);
                }
            }
        }
    );
}

function getSupportedCrimeTypes(alexa) {
    var text = "I currently understand the following crime types: " + Array.from(constants.CRIME_MAP.keys()).toString();

    alexa.emit(':tellWithCard', text, constants.SKILL_NAME, text);
}

function getCrimeDetails(alexa, crime, neighborhood) {
    step (
        function getCrimeDetails() {
            var crimeType = constants.CRIME_MAP_SINGULAR.get(crime);
            
            if(typeof crimeType !== 'undefined' && crimeType) {
                var vars = [crimeType];

                var sql = " select cd.date_reported, cd.uor_desc, cd.premise_type, trim(cd.block_address) as block_address, cd.zip_code, zc.neighborhood " +
                          " from crimeData as cd join zipCodeLookup as zc on cd.zip_code = zc.zip " +
                          " where cd.CRIME_TYPE = ? and zc.zip = cd.zip_code ";

                if(neighborhood) {
                    sql += " and cd.zip_code in (select zip from zipCodeLookup where neighborhood = ? ) ";
                    vars.push(neighborhood);
                }

                sql += " order by cd.date_reported desc limit 1";
                connection.query(sql, vars, this);

                console.log(sql);
            } else {
                var text = constants.UNRECOGNIZED_CRIME_TYPE_RESPONSE.replace('{crime}', crime);
                alexa.emit(':tellWithCard', text, constants.SKILL_NAME, text);
                return;
            }
        },
        function finish(err, rows, fields) {
            var text;

            if(err) {
                text = constants.ERROR_RESPONSE;
                console.log(err);
            } else {
                var dateTimeReported = moment(rows[0].date_reported).format('dddd, MMMM Do, [at] h:mm a');

                var desc = rows[0].uor_desc.replace("<", "less than")
                desc = desc.replace(">", "greater than");

                text = "The most recent " + crime;
                
                if(neighborhood) // slightly reformat response text if the user supplied a neighborhood
                    text += " in " + neighborhood;

                text += " was a " + desc + 
                        " charge, reported on " + dateTimeReported +
                        ". It occurred at a " + rows[0].premise_type + 
                        ", at " + rows[0].block_address;

                if(!neighborhood) // get neighborhood from query join
                    text += ", in " + rows[0].neighborhood + ".";

                alexa.emit(':tellWithCard', text, constants.SKILL_NAME, text);
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
    var desiredMonth = moment().month(month);
    var year = desiredMonth.month() > moment().month() ? moment().year() - 1 : moment().year();
   
    // clause encompasses first day and last day of month specified by the user
    var betweenClause = " (DATE_OCCURED between '" + desiredMonth.format(year + '-MM-01 00:00:00') + "' and '" + desiredMonth.endOf('month').format(year + '-MM-DD 23:59:59') + "')";

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

module.exports.getCrimeCount = getCrimeCount;
module.exports.getSupportedCrimeTypes = getSupportedCrimeTypes;
module.exports.getCrimeDetails = getCrimeDetails;
