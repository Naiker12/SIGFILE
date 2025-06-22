import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app import app

def handler(request):
    return app

if __name__ == "__main__":
    app.run(debug=True)