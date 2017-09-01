import redis

redisCn = redis.StrictRedis(host='incident-cache.aqsren.ng.0001.use1.cache.amazonaws.com', port=6379, db=0)
#redisCn = redis.StrictRedis(host='127.0.0.1', port=6379, db=0)

def handler(event, context):
	
	print("Deleting all keys vis flushdb command...")
	redisCn.flushdb()
	print("flushdb complete.")
	print("dbsize: %d" % (redisCn.dbsize()))

#handler(None, None)