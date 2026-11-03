import sys
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.main import app

def test_app_attributes():
    assert app.title == "ANTAH — The Unheard Signals Network"
    print("Backend App Title:", app.title)
    print("Backend App Version:", app.version)
    print("Health check endpoint registered:", any(route.path == "/api/v1/health" for route in app.routes))
    assert any(route.path == "/api/v1/health" for route in app.routes)
    print("All backend sanity checks passed successfully!")

if __name__ == "__main__":
    test_app_attributes()

