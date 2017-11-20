import sys
import os
import urllib
import urllib2
import json
import StringIO
from datetime import datetime
import numpy as np
import quantities as pq

sys.path.append("./protobuf-2.5.0/pb_python_tutorial")
sys.path.append("./protobuf-2.5.0/python")
sys.path.append("./pygeocoder-1.2.4")

import pygeocoder # only google geocoder
import geopy # multiple geocoders, but reverse geocoding is giving overuse error
import fileinput
import google.protobuf
import gtfs_realtime_pb2
import threading

from pygeocoder import Geocoder

from geopy import geocoders

# http://www.geonames.org/export/geonames-search.html
# https://en.wikipedia.org/wiki/ISO_3166-1
g = geocoders.GeoNames('US', 'adaptiveapplications')

if(len(sys.argv) == 0):
	poll_int = 60
	route_id = "15"
	max_vehicles = 100

if(len(sys.argv) >= 1):
	poll_int = int(sys.argv[1])
if(len(sys.argv) >= 2):
	route_id = str(sys.argv[2])
if(len(sys.argv) >= 3):
	max_vehicles = sys.argv[3]

def RouteReport(route_id, vehicle_positions):
	report = ""

	tu = TripUpdates()
	for pos in vehicle_positions:
		trips = filter((lambda tu: tu.id == pos.vehicle.trip.trip_id), tu.entity)
		# should only be a single trip
		#print(trips.__len__())

		
		# TODO : get direction
		# TODO : get speed
		# TODO : calculate ETA and arrival location


		# NOTE : Geocoder is tied to google, and eventually we see an exception thrown indicating overuse
		#        may need to optionally include the location description
		loc_desc_full = str(Geocoder.reverse_geocode(pos.vehicle.position.latitude, pos.vehicle.position.longitude))
		loc_desc_short = str.split(loc_desc_full,',')[0];
		report = report + "    " + loc_desc_short
		#report = report + " is " + str(distance) + " away\n"
		report = report + "\n"

	return report

def VehiclePositions():
	vp_filehandle = urllib.urlopen("http://gtfsrealtime.ridetarc.org/vehicle/VehiclePositions.pb")
	vp_message = gtfs_realtime_pb2.FeedMessage()
	vp_message.ParseFromString(vp_filehandle.read())
	return vp_message

def TripUpdates():
	tu_filehandle = urllib.urlopen("http://gtfsrealtime.ridetarc.org/trip_update/TripUpdates.pb")
	tu_message = gtfs_realtime_pb2.FeedMessage()
	tu_message.ParseFromString(tu_filehandle.read())
	return tu_message

def GetVehiclePositions(route_id):
	report = ""
	
	trip_updates = filter(lambda tu: tu.trip_update.trip.route_id == route_id, TripUpdates().entity)
	
	vehicle_positions = list()
	
	vps = VehiclePositions()
	for trip_update in trip_updates:
		route_filter = (lambda vp: vp.vehicle.trip.trip_id == trip_update.trip_update.trip.trip_id)
		vehicle_positions.extend(filter((route_filter), vps.entity))

	return vehicle_positions

def Distance(pos):
	mapsurl_base = "http://maps.googleapis.com/maps/api/distancematrix/json"

	# debug values
	#origin_byaddr = "2642 Longview Ave, Louisville KY 40206"
	#destination_byaddr = "400 W Market St, Louisville KY 40202"

	# for testing
	origin_home = "38.2500069,-85.692903" 		# 2642 Longview Ave, Louisville KY 40206
	destination_work = "38.255147,-85.757106" 	# 400 W Market St, Louisville KY 40202 
	destination = str(pos.vehicle.position.latitude) + "," + str(pos.vehicle.position.longitude)

	mapsurl_params = urllib.urlencode({ "origins" : origin_home, "destinations": destination, "mode" : "bicycling", "sensor" : "false"}) 
	mapsurl = mapsurl_base + "?" + mapsurl_params
	map_filehandle = urllib.urlopen(mapsurl)
	dist_map_json = map_filehandle.read()
	dist_map = json.loads(dist_map_json)
	#print(dist_map["status"])
	distance_meters = int(dist_map["rows"][0]["elements"][0]["distance"]["value"])
	distance = distance_meters * pq.meter
	distance.units = 'miles'

	return distance

def PositionsMovingCloser(curr_vehicle_positions, prev_1_vehicle_positions, prev_2_vehicle_positions):

	positions = list()

	for i in range(0, curr_vehicle_positions.__len__()-1):
		curr_pos = curr_vehicle_positions[i]
		prev_1_pos = prev_1_vehicle_positions[i]
		prev_2_pos = prev_2_vehicle_positions[i]

		distance_curr = Distance(curr_pos)
		distance_prev_1 = Distance(prev_1_pos)
		distance_prev_2 = Distance(prev_2_pos)

		if(distance_curr <= distance_prev_1):
			positions.append(curr_pos)
		else:
			print("removing: " + str(curr_pos))
	
		print("positions len: " + str(positions.__len__()))

	return positions

print("Requesting report for route #" + route_id + "... \n")
print("First " + str(max_vehicles) + " vehicles actively running on route " + route_id + "... \n")

prev_1_vehicle_positions = None
prev_2_vehicle_positions = None

while (1==1):
	print(datetime.now())

	# get current vehicle positions
	curr_vehicle_positions = GetVehiclePositions(route_id)

	# compare current to previous positions, and filter
	#if(prev_1_vehicle_positions != None and prev_2_vehicle_positions != None):
	#	vehicle_positions = PositionsMovingCloser(curr_vehicle_positions, prev_1_vehicle_positions, prev_1_vehicle_positions)
	#else:
	vehicle_positions = curr_vehicle_positions

	max_vehicles = min(int(max_vehicles), vehicle_positions.__len__())

	# sort vehicle positions
	print(RouteReport(route_id, vehicle_positions[:max_vehicles]))
	threading.Event().wait(poll_int)

	# set previous vehicle positions
	#prev_2_vehicle_positions = prev_1_vehicle_positions
	#prev_1_vehicle_positions = curr_vehicle_positions


#exit(1)
