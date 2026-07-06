# pyrefly: ignore [missing-import]
from flask import Flask, request, jsonify
from sklearn.preprocessing import OneHotEncoder
from sklearn.neighbors import NearestNeighbors
# pyrefly: ignore [missing-import]
import numpy as np
import os
import sqlite3

app = Flask(__name__)

# Fallback judgements for immediate testing
fallback_judgments = [
    {
        "id": 1001, 
        "title": "Kesavananda Bharati v. State of Kerala", 
        "year": 1973, 
        "filename": "Kesavananda_Bharati_v_State_of_Kerala.pdf", 
        "specialization": "Constitutional & Criminal", 
        "summary": "Landmark decision outlining the 'Basic Structure Doctrine' of the Indian Constitution, limiting parliament's power to amend fundamental structures."
    },
    {
        "id": 1002, 
        "title": "Maneka Gandhi v. Union of India", 
        "year": 1978, 
        "filename": "Maneka_Gandhi_v_Union_of_India.pdf", 
        "specialization": "Constitutional & Criminal", 
        "summary": "Significantly expanded the scope of Article 21 (Right to Life and Personal Liberty), ruling that procedures must be fair, just and reasonable."
    },
    {
        "id": 1003, 
        "title": "State of Madras v. Champakam Dorairajan", 
        "year": 1951, 
        "filename": "State_of_Madras_v_Champakam_Dorairajan.pdf", 
        "specialization": "Property & Civil", 
        "summary": "Led to the First Amendment of the Constitution of India, addressing reservations and fundamental rights in educational institutions."
    },
    {
        "id": 1004, 
        "title": "Golaknath v. State of Punjab", 
        "year": 1967, 
        "filename": "Golaknath_v_State_of_Punjab.pdf", 
        "specialization": "Property & Civil", 
        "summary": "Supreme Court ruled that Parliament could not curtail any of the Fundamental Rights in the Constitution of India."
    },
    {
        "id": 1005, 
        "title": "Mohd. Ahmed Khan v. Shah Bano Begum", 
        "year": 1985, 
        "filename": "Shah_Bano_Begum.pdf", 
        "specialization": "Family Law", 
        "summary": "Landmark maintenance lawsuit regarding rights of divorced Muslim women under Section 125 of the Code of Criminal Procedure."
    },
    {
        "id": 1006,
        "title": "Minerva Mills v. Union of India",
        "year": 1980,
        "filename": "Minerva_Mills_v_Union_of_India.pdf",
        "specialization": "Constitutional & Criminal",
        "summary": "Strengthened the Basic Structure doctrine, asserting that judicial review is an essential feature of the Constitution."
    },
    {
        "id": 1007,
        "title": "M.C. Mehta v. Union of India",
        "year": 1986,
        "filename": "MC_Mehta_v_Union_of_India.pdf",
        "specialization": "Civil Law",
        "summary": "Introduced the concept of absolute liability for industries engaged in hazardous or inherently dangerous activities."
    }
]

lawyers = [
    {
        'name': 'Ava Deshmukh',
        'specialization': 'Family',
        'experience': 12,
        'success_rate': 88,
        'availability': 'High',
        'active_cases': 4,
        'location': 'Colombo',
    },
    {
        'name': 'Dilan Fernando',
        'specialization': 'Criminal',
        'experience': 9,
        'success_rate': 82,
        'availability': 'Medium',
        'active_cases': 6,
        'location': 'Galle',
    },
    {
        'name': 'Niranjani Perera',
        'specialization': 'Property',
        'experience': 14,
        'success_rate': 91,
        'availability': 'High',
        'active_cases': 3,
        'location': 'Kandy',
    },
    {
        'name': 'Sameer Kottegoda',
        'specialization': 'Civil',
        'experience': 11,
        'success_rate': 86,
        'availability': 'Low',
        'active_cases': 8,
        'location': 'Negombo',
    },
    {
        'name': 'Anjali Perera',
        'specialization': 'Employment',
        'experience': 8,
        'success_rate': 78,
        'availability': 'High',
        'active_cases': 5,
        'location': 'Colombo',
    },
]

categorical_features = ['specialization', 'availability', 'location']
encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')
encoded_data = encoder.fit_transform([[lawyer[key] for key in categorical_features] for lawyer in lawyers])

numerical_data = np.array([[lawyer['experience'], lawyer['success_rate'], lawyer['active_cases']] for lawyer in lawyers])
feature_matrix = np.concatenate([encoded_data, numerical_data], axis=1)
model = NearestNeighbors(n_neighbors=5, metric='euclidean').fit(feature_matrix)


def encode_request(payload):
    values = [[
        payload.get('specialization', 'General'),
        payload.get('availability', 'Medium'),
        payload.get('location', 'Colombo'),
    ]]
    encoded = encoder.transform(values)
    numeric = np.array([[payload.get('experience', 5), payload.get('successRate', 75), payload.get('activeCases', 5)]])
    return np.concatenate([encoded, numeric], axis=1)


@app.route('/recommend', methods=['POST'])
def recommend():
    payload = request.get_json() or {}
    features = encode_request(payload)
    distances, indices = model.kneighbors(features)
    recommendations = []
    for index, distance in zip(indices[0], distances[0]):
        lawyer = lawyers[index]
        recommendations.append({
            'name': lawyer['name'],
            'specialization': lawyer['specialization'],
            'experience': lawyer['experience'],
            'successRate': lawyer['success_rate'],
            'availability': lawyer['availability'],
            'location': lawyer['location'],
            'matchPercentage': round(100 - distance * 5, 2),
            'reason': f"Best fit for {payload.get('caseType', 'General')} cases in {lawyer['location']}.",
        })
    return jsonify(recommendations)


@app.route('/search-judgments', methods=['POST'])
def search_judgments():
    payload = request.get_json() or {}
    query = payload.get('query', '')
    year = payload.get('year', None)
    specialization = payload.get('specialization', None)
    limit = int(payload.get('limit', 50))
    
    db_path = os.path.join(os.path.dirname(__file__), "..", "judgments.db")
    
    # Check if SQLite DB is available, if not fallback to hardcoded list
    if not os.path.exists(db_path):
        # Filter fallback judgments in-memory for testing
        results = fallback_judgments
        if query:
            results = [r for r in results if query.lower() in r['title'].lower() or query.lower() in r['summary'].lower()]
        if year:
            results = [r for r in results if r['year'] == int(year)]
        if specialization and specialization != 'All':
            results = [r for r in results if r['specialization'].lower() == specialization.lower()]
        return jsonify({
            'source': 'fallback',
            'judgments': results[:limit]
        })
        
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        sql = "SELECT id, title, year, filename, specialization, summary FROM judgments WHERE 1=1"
        params = []
        
        if query:
            sql += " AND (title LIKE ? OR summary LIKE ?)"
            params.extend([f"%{query}%", f"%{query}%"])
        if year:
            sql += " AND year = ?"
            params.append(int(year))
        if specialization and specialization != 'All':
            sql += " AND specialization = ?"
            params.append(specialization)
            
        sql += " ORDER BY year DESC LIMIT ?"
        params.append(limit)
        
        cursor.execute(sql, params)
        rows = cursor.fetchall()
        
        results = []
        for r in rows:
            results.append({
                'id': r[0],
                'title': r[1],
                'year': r[2],
                'filename': r[3],
                'specialization': r[4],
                'summary': r[5]
            })
            
        conn.close()
        return jsonify({
            'source': 'database',
            'judgments': results
        })
    except Exception as e:
        # Any database read errors fallback to memory
        return jsonify({
            'source': 'error-fallback',
            'error': str(e),
            'judgments': fallback_judgments[:limit]
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8000)
