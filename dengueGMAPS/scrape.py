# to run, php -S localhost:8000

from bs4 import BeautifulSoup
import json
import os
import requests

DATA_URL = 'https://www.nea.gov.sg/api/OneMap/GetMapData/DENGUE_CLUSTER'

OUTPUT_JSON_FILE_FORMAT = os.path.join('data', 'data-%s.json')
OUTPUT_JSON_LATEST_FILE = os.path.join('data', 'data-latest.json')

def get_map_clusters_date():
    data = requests.get(DATA_URL).json()
    metadata = data['SrchResults'][0]
    clusters = data['SrchResults'][1:]
    date = metadata['DateTime']['date'].split(' ')[0]
    return clusters, date


def format_geojson(clusters):

    def format_cluster(cluster):
        description = cluster['DESCRIPTION']
        coordinates = [[float(coord) for coord in latlng.split(',')][::-1] for latlng in cluster['LatLng'].split('|')]
        # info = get_matching_info_for_cluster(description, info_dict)
        return {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [coordinates]
            },
            'properties': {
                'description': description,
                'case_size': int(cluster['CASE_SIZE']),
            }
        }

    features = [format_cluster(cluster) for cluster in clusters]
    geojson = {'type': 'FeatureCollection', 'features': features}
    return geojson




if __name__ == '__main__':
    clusters, date = get_map_clusters_date()
    geojson = format_geojson(clusters)

    with open(OUTPUT_JSON_FILE_FORMAT % date, 'w') as file:
        json.dump(geojson, file)

    with open(OUTPUT_JSON_LATEST_FILE, 'w') as file:
        json.dump(geojson, file)
