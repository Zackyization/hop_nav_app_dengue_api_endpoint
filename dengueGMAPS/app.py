#api endpoint url steps:
# cd dengueGMAPS
# python app.py
# run ngroks, type "ngrok http 5000"
# get link under Forwarding 
# replace in homepage file


from flask import Flask, jsonify, send_from_directory
import json

app = Flask(__name__)

@app.route('/api/dengue_clusters', methods=['GET'])
def get_dengue_clusters():
    try:
        with open('data/data-latest.json', 'r') as file:
            data = json.load(file)
        return jsonify(data)
    except Exception as e:
        return jsonify({'error': str(e)})

if __name__ == '__main__':
    app.run(debug=True)
