import os
from dotenv import load_dotenv

load_dotenv()
from app import create_app

app = create_app()

if __name__ == "__main__":
    # Debug mode is on for development. Turn off in production.
    app.run(
        debug=os.getenv("DEBUG_MODE", False),
        host=os.getenv("HOST", "0.0.0.0"),
        port=os.getenv("PORT", 3001),
    )
