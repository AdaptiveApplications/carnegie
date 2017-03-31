exports.handler = (event, context, callback) => {
    var mysql = require('mysql');
    var step = require('step');
    
    var connection = mysql.createConnection(
        {
          host     : 'civicdata.crogewynsqom.us-east-1.rds.amazonaws.com',
          user     : 'admin',
          password : 'bloodsweatandtears',
          database : 'louisvilleky',
        }
    );
    
    var numberOfDays = 30;
    var crimesSql 	= 	" SELECT crime_type, COUNT(*) as crime_count FROM louisvilleky.crimeData ";
    crimesSql		+=	" WHERE date_reported >  DATE_ADD(CURDATE(), INTERVAL -" + numberOfDays.toString() + " DAY) ";
    crimesSql		+= 	" GROUP BY crime_type ";
    crimesSql		+=	" ORDER BY COUNT(*) DESC ";
    //crimesSql		+=	" LIMIT 3 ";
    
    step(
        function start(){
            connection.connect();
            
            connection.query(crimesSql, this);
        },
        function finish(err, rows, fields) {
            if (!err){
                console.log('The number of rows: ', rows.length);
                
                var crimeSummary = "";
                
                for(var i = 0; i<rows.length; i++){
                	crimeSummary+=" " + rows[i]['crime_count'].toString() + " " + rows[i]['crime_type'];
                
                
                	if( i == rows.length-1 ){
                		crimeSummary += "."
                	}
                	else{
                		crimeSummary += ", ";
                	}
                }
                
                var mainText = "The following is a summary of crime in Louisville, Kentucky in the past " + numberOfDays.toString() + " days: " + crimeSummary;
                mainText += "This summary is provided by the Louisville Metrol Open Data portal. For more detail visit data.louisvilleky.gov."
                var alexaResponse = [
                						  {
                						    "uid": "EXAMPLE_CHANNEL_MULTI_ITEM_JSON_TTS_1",
                						    "updateDate": "2016-04-10T00:00:00.0Z",
                						    "titleText": "Crime stats in Louisville, KY",
                						    "mainText": mainText,
                						    "redirectionUrl": "https://data.louisvilleky.gov"
                						   }
                					];
                
                
                console.log(mainText);
            }
            else
                console.log('Error while performing Query.');
            
            connection.end();
            
            callback(null, alexaResponse);
        }
    )
};