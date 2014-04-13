import json


class Map:
    """
    Map class handles finding nearest bike parking location algorithm.
    TO DO: apply space harsh algorithms like KD-Tree search rather than O(n) search.
    """

	@classmethod
	def all_coordinates(cls):
		return cache.ram("all_coords", lambda: db().select(db.bike_parking.COORDINATES), None)
	
	@classmethod
	def nearest_coordinate(cls, lat, lng):
		coords = cls.all_coordinates();
		min_coord = coords[0]
		min_dist = cls.distance(float(min_coord["COORDINATES"][0]), float(min_coord["COORDINATES"][1]),
			lat, lng)
	
		for coord in coords:
			ilat = float(coord["COORDINATES"][0])
			ilng = float(coord["COORDINATES"][1])
			dist = cls.distance(ilat, ilng, lat, lng)
			if dist < min_dist:
				min_dist = dist
				min_coord = coord
	
		return min_coord
	
	@classmethod
	def distance(cls, lat_a, lng_a, lat_b, lng_b):
		return (lat_a - lat_b) * (lat_a - lat_b) + (lng_a - lng_b) * (lng_a - lng_b)


@request.restful()
def nearest_api():
    """
    Rest API to get nearest bike parking location of given coordinate.
    """

    def GET(*args, **coord):
        try:
            ncoord = Map.nearest_coordinate(float(coord["lat"]), float(coord["lng"]))["COORDINATES"]
            data = db.bike_parking(COORDINATES=ncoord)
            return data.as_json()
        except Exception, e:
            return e
    return locals()


def populate_db():
    """
    Load Json file and populate the bike parking table.
    """

	data_path = os.path.join(request.folder, 'static/resource', 'bike_data.json') 
	data_file = open(data_path, 'r')
	data_json = json.load(data_file)
	
	# Load column meta info
	# create column name - index map
	meta_column = data_json["meta"]["view"]["columns"]
	dict_column = dict()
	for index, column in enumerate(meta_column):
		dict_column[column["name"]] = index
	
	entries = data_json["data"]
	for id,entry in enumerate(entries):
		insert_entry = {
			"LOC": entry[dict_column["LOCATION"]],
			"ADDRESS": entry[dict_column["ADDRESS"]],
			"BIKE_PARKING": entry[dict_column["BIKE_PARKING"]],
			"PLACEMENT": entry[dict_column["PLACEMENT"]],
			"RACKS": entry[dict_column["RACKS"]],
			"SPACES": entry[dict_column["SPACES"]],
			"YR_INSTALLED": entry[dict_column["YR_INSTALLED"]],
			"COORDINATES": [entry[dict_column["COORDINATES"]][1], entry[dict_column["COORDINATES"]][2]]
		}
		result = db.bike_parking.insert(**insert_entry)
	return {"status": "success"}
