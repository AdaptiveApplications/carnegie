import json
import csv
import urllib.request
import ssl
import os
import re
import sys
import csv
import time
import io
import argparse
import collections
import warnings 
import pymysql	
import pymysql.cursors
from pprint import pprint
pymysql.install_as_MySQLdb()
	


# CSV to MySQL Utilities credited to --> https://bitbucket.org/richardpenman/csv2mysql
# suppress annoying mysql warnings
#warnings.filterwarnings(action='ignore', category=pymysql.Warning) 

def get_type(s):
	"""Find type for this string
	"""
	# try integer type
	try:
		v = int(s)
	except ValueError:
		pass
	else:
		if abs(v) > 2147483647:
			return 'bigint'
		else:
			return 'int'
	# try float type
	try:
		float(s)
	except ValueError:
		pass
	else:
		return 'double'

	# check for timestamp
	dt_formats = (
		('%Y-%m-%d %H:%M:%S', 'datetime'),
		('%Y-%m-%d %H:%M:%S.%f', 'datetime'),
		('%Y-%m-%d', 'date'),
		('%H:%M:%S', 'time'),
	)
	for dt_format, dt_type in dt_formats:
		try:
			time.strptime(s, dt_format)
		except ValueError:
			pass
		else:
			return dt_type
	
	# doesn't match any other types so assume text
	if len(s) > 255:
		return 'text'
	else:
		return 'varchar(255)'


def most_common(l, default='varchar(255)'):
	"""Return most common value from list
	"""
	# some formats trump others
	if l:
		for dt_type in ('text', 'bigint'):
			if dt_type in l:
				return dt_type
			return max(l, key=l.count)
	return default


def get_col_types(input_file, max_rows=1000):
	"""Find the type for each CSV column
	"""
	csv_types = collections.defaultdict(list)

	context = ssl._create_unverified_context()

	with urllib.request.urlopen(input_file, context=context) as response:
		csv_str = io.StringIO(response.read().decode('utf-8'))
		reader = csv.reader(csv_str, dialect='excel', delimiter=',', quotechar='"', skipinitialspace=True, lineterminator="\r\n")
		# test the first few rows for their data types
		
		rows = enumerate(reader)

		for row_i, row in rows:
			if row_i == 0:
				header = row
			else:
				for col_i, s in enumerate(row):
					data_type = get_type(s)
					csv_types[header[col_i]].append(data_type)
	 
			if row_i == max_rows:
				break

	# take the most common data type for each row

	return [most_common(csv_types[col]) for col in header]


def get_schema(table, header, col_types):
	"""Generate the schema for this table from given types and columns
	"""
	schema_sql = """CREATE TABLE IF NOT EXISTS %s ( 
		#id int NOT NULL AUTO_INCREMENT,""" % table 

	#print(header)
	#print(col_types)
	
	for col_name, col_type in zip(header, col_types):
		schema_sql += '\n%s %s,' % (col_name, col_type)

	schema_sql += """\nPRIMARY KEY (id)
		) DEFAULT CHARSET=utf8;"""
	return schema_sql


def get_insert(table, header):
	"""Generate the SQL for inserting rows
	"""
	field_names = ', '.join(header)
	field_markers = ', '.join('%s' for col in header)
	return 'INSERT INTO %s (%s) VALUES (%s);' % \
		(table, field_names, field_markers)


def format_header(row):
	"""Format column names to remove illegal characters and duplicates
	"""
	safe_col = lambda s: re.sub('\W+', '_', s.lower()).strip('_')
	header = []
	counts = collections.defaultdict(int)
	for col in row:
		col = safe_col(col)
		counts[col] += 1
		if counts[col] > 1:
			col = '{}{}'.format(col, counts[col])
		header.append(col)
	return header


def main(input_file, user, password, host, table, database, max_inserts=10000):
	print("Importing `%s' into MySQL database `%s.%s'" % (input_file, database, table))
	db = pymysql.connect(host=host, user=user, passwd=password, charset='utf8')
	cursor = db.cursor()
	# create database and if doesn't exist
	#cursor.execute('CREATE DATABASE IF NOT EXISTS %s;' % database)
	db.select_db(database)

	# define table
	print('Analyzing column types ...')
	col_types = get_col_types(input_file)
	print(col_types)

	header = None

	print("url: '{}'".format(input_file))

	context = ssl._create_unverified_context()

	with urllib.request.urlopen(input_file, context=context) as response:
		#print(response.read().decode('utf-8'))
		csv_str = io.StringIO(response.read().decode('utf-8'))
		reader = csv.reader(csv_str, dialect='excel', delimiter=',', quotechar='"', skipinitialspace=True)
		#data = response.read()
		#for i, row in enumerate(csv.reader(open(input_file))):
		for i, row in enumerate(reader):
			if header:
				while len(row) < len(header):
					row.append('') # this row is missing columns so pad blank values
				cursor.execute(insert_sql, row)
				if i % max_inserts == 0:
					db.commit()
					if(i % 10):
						print('.')
					if(i%100):
						print('\r\n')
			else:
				header = format_header(row)
				schema_sql = get_schema(table, header, col_types)
				print(schema_sql)
				# create table
				cursor.execute('DROP TABLE IF EXISTS %s;' % table)
				cursor.execute(schema_sql)
				# create index for more efficient access
				try:
					cursor.execute('CREATE INDEX ids ON %s (id);' % table)
				except pymysql.OperationalError:
					pass # index already exists

				print('Inserting rows ...')
				# SQL string for inserting data
				insert_sql = get_insert(table, header)

	# commit rows to database
	print('Committing rows to database ...')
	db.commit()
	print('Done!')

def get_crime_datasets():
	
	context = ssl._create_unverified_context()
	
	distributions = []
	
	with urllib.request.urlopen("https://data.louisvilleky.gov/data.json", context=context) as data_file:
		data = json.load(data_file)
		
		crime_dataset = [dataset for dataset in data["dataset"] 
			if dataset["identifier"] == "a0c75ea8-ef9e-458b-91a2-b9e42013009f"] #Crime Data identifier
		
		distributions = [ distribution for distribution in crime_dataset[0]["distribution"]]
			
		print(distributions[0]["title"])
	
	return distributions


def lambda_handler(event, context):
	#print("Received event: " + json.dumps(event, indent=2))
	print("beginning handler")

	#main(args.input_file, args.user, args.password, args.host, args.table, args.database)
	# example file: https://data.louisvilleky.gov/sites/default/files/Crime_Data_2017_2.csv
	print('executing main... ')

	for dataset in get_crime_datasets():
		crimefile = dataset["downloadURL"]
		if("2017" in crimefile):
			print(crimefile)
			main(crimefile, 'rw', 'civicdataalliance', 'civicdata.crogewynsqom.us-east-1.rds.amazonaws.com', 'crimeData', 'louisvilleky', max_inserts=10)

	return "handler completed"
    
#lambda_handler(None, None)

