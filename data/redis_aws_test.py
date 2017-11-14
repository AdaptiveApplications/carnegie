import redis

redisCn = redis.StrictRedis(host='incident-cache.aqsren.ng.0001.use1.cache.amazonaws.com', port=6379, db=0)
#redisCn = redis.StrictRedis(host='127.0.0.1', port=6379, db=0)

def handler(event, context):
	key = 'srd1986'
	data_in = 'Scott,Daugherty,1974-06-03'
	
	redisCn.set(key, data_in)

	data_out = redisCn.get(key).decode("utf-8")

	if data_out == data_in:
		print("Success: Fetched value %s from Redis" % (data_out))
	else:
		raise Exception("Value is not the same as we put :(. Expected %s got %s" %(data_in, data_out))

	return "Fetched value from Redis: " + data_out

#handler(None, None)