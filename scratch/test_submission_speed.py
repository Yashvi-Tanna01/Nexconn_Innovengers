import time
import requests

def test_speed():
    resp = requests.post('http://127.0.0.1:8000/api/v1/auth/login', json={
        'email': 'rajbusa5435@gmail.com',
        'password': 'Password123!'
    })
    token = resp.json()['access_token']
    
    t1 = time.time()
    rep = requests.post(
        'http://127.0.0.1:8000/api/v1/reports',
        json={
            'title': 'Civic Network Speed Test',
            'description': 'Testing single-commit submission speed',
            'category': 'water_leakage',
            'location': 'Indiranagar Commercial Arterial (GPS: 12.9716, 77.5946)',
            'urgency': 3,
            'latitude': 12.9716,
            'longitude': 77.5946
        },
        headers={'Authorization': f'Bearer {token}'}
    )
    t2 = time.time()
    duration = round((t2 - t1) * 1000)
    data = rep.json()
    print(f"Status: {rep.status_code}, ID: {data.get('id')}, Duration: {duration}ms")

if __name__ == '__main__':
    test_speed()
