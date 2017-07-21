# Git Branching Model: http://nvie.com/posts/a-successful-git-branching-model/ 

# Amazon Developer (Alexa) accounts
* Login --> https://developer.amazon.com/home.html
* Summary of User Permissions
	* Administrator (Aaron)
	* Developer (let me know if you need a new invitation)
	* Marketer
	* Analyst

# AWS accounts
* Everyone has an IAM account that is your first name
* Please login and change your password -> https://165284110550.signin.aws.amazon.com/console
* Summary of groups, roles, and roles is below. If you feel that you need additional permissions or to another user with a specific set of  permissions, please post it on slack
	* alexa (role) has RDSFullAccess, LambdaFullAccess, S3FullAccess
	* lambda (role) has RDSFullAccess
	* Developers (group) has RDSFullAccess, EC2FullAccess, LambdaFullAccess, S3FullAccess

# Build Lambda NodeJS 
1. Create a zip archive containing *.js and the entire node_modules directory.
2. Upload the zip archive to the Lambda dev console.
3. Profit.


# Geolocation Accounts
* http://www.geonames.org/
	* username: adaptiveapplications
	* password: reach out to ajdrake for password

# Python setup (v2.7)

~~~~
$ pip install numpy
$ pip install quantities
$ pip install geopy
$ pip install Geocoder

$ python gtfs_realtime_client.py <POLL INTERVAL> <BUS NUMBER> <MAX BUSES>
~~~~

# Python setup (v3.*)

~~~~
$ pip3 install pymsql
$ pip install requests

$ python3 louisvillekygov-to-awscivicdata.py

Package
$ conda install virtualenv
$ virtualenv ./carnegie-ve
$ pip install carnegie-ve pymysql
$ cd carnegie-ve/lib/python3.6/site-packages
$ zip -r -X "carnegie-ve.zip" ./*

Upload the zip to AWS Lambda for testing
~~~~

# Notes and Tools
* https://dev.mysql.com/downloads/workbench/
	* civicdata.crogewynsqom.us-east-1.rds.amazonaws.com:3306
	* username: ro / password: civicdataalliance
* AWS Console https://165284110550.signin.aws.amazon.com/console
* Slack: adaptiveapplications.slack.com
* Package data script
* Zipcode/neighborhood source: https://suburbanstats.org/zip-codes/kentucky  (and some other source I forgot + general knowledge)