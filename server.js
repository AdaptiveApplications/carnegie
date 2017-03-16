var express = require('express')
var app = express()
var mysql = require('mysql');
var step = require('step');

var connection = mysql.createConnection(
    {
      host     : 'civicdata.crogewynsqom.us-east-1.rds.amazonaws.com',
      //host     : 'civicdata.c9qgje8x7uj8.us-east-1.rds.amazonaws.com',
      user     : 'admin',
      password : 'bloodsweatandtears',
      database : 'louisvilleky',
    }
);

const MONTH_MAP = new Map();

init();
//app.get('/', function (req, res) {
	var count = -999;
	var month = 'january';
	var neighborhood = 'the highland';

	step (
		function start() {
			var query = " select count(CRIME_TYPE) as crimeCount " +
						" from crimeData " +
						" where CRIME_TYPE = 'robbery' " +
						" and ZIP_CODE in (select zip from zipCodeLookup where area = ? ) " +
						" and " + buildDateBetweenClause(month);

			console.log(query);
			connection.query(query, [neighborhood], this);		    
	    },
		function finish(err, rows, fields) {
			var speechOutput;

			if(err) {
				speechOutput = "I'm having trouble getting that information. Please try again later.";
				console.log(err);
			} else {
				crimeCount = rows[0].crimeCount;

				if(crimeCount == 0) {
					step (
						function start2() {
							var query = " select count(zip) as cnt from zipCodeLookup where area = ? ";
							console.log('executing zipCodeLookup query... ' + neighborhood);
							connection.query(query, [neighborhood], this);
						},
						function finish2(err, rows, fields) {
							console.log("inside finish()");
							if(err) {
								console.log(err);
							} else {
								var neighborhoodCount = rows[0].cnt;

								if(neighborhoodCount > 0) {
				        			speechOutput = "There were " + crimeCount + " robberies reported in " + neighborhood + " in " + month + ".";
					        	} else {
					        		speechOutput = "I don't have any zip codes configured for " + neighborhood + ".";
					        		console.log("No zips configured for " + neighborhood);
					        	}
							}

							connection.end();
	        				console.log(speechOutput);
						}
					);
				} else {
					speechOutput = "There were " + crimeCount + " robberies reported in " + neighborhood + " in " + month + ".";
					console.log(speechOutput);
				}
		    }
			
	        
	        //my_alexa.emit(':tellWithCard', speechOutput, SKILL_NAME, speechOutput);
		}
	);

app.listen(3000, function () {
	console.log('Example app listening on port 3000!')
})

function buildDateBetweenClause(month) {
	var year = new Date().getFullYear();
	var mapVal = MONTH_MAP.get(month);
	var betweenClause = ' 1 = 1 ';

	if(typeof mapVal !== 'undefined' && mapVal) {
		betweenClause = ' (DATE_OCCURED between ' + mapVal.replace(new RegExp('{year}', 'g'), year) + ') ';
	} else {
		console.log("Month value [" + month + "] not found in MONTH_MAP.");
	}

	return betweenClause;
}

function init() {
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
}