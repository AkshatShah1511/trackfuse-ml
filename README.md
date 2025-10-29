TrackFuse ML

A web-based dashboard that uses a machine learning (TensorFlow/Keras) model to detect defects in uploaded images.

Features

🖼️ Image Upload – Select or drag-and-drop images for analysis.

🧠 AI-Powered Analysis – Uses an InceptionV3 model to classify images as "Defective" or "Non Defective".

📊 Confidence Score – Displays the model's confidence in its prediction.

🚀 Vite + React Frontend – A modern, fast, and responsive user interface.

🐍 Python + Flask Backend – A lightweight Python server to run the TensorFlow model.

Tech Stack

Frontend: React, Vite, TypeScript, Tailwind CSS

Backend: Python, Flask, TensorFlow/Keras

How to Run This Project

This project has two parts: the Python backend and the React frontend. You must run both at the same time in two separate terminals.

1. Clone the Repository

git clone [https://github.com/AkshatShah1511/trackfuse-ml.git](https://github.com/AkshatShah1511/trackfuse-ml.git)
cd trackfuse-ml


2. Run the Backend (Terminal 1)

This terminal will run your Python/Flask server.

# 1. Create and activate a Python virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install Python dependencies
pip install -r requirements.txt

# 3. Make sure your model file is present in the root
# (You should have model_inception_v3.h5 in this folder)

# 4. Start the Flask server
python3 app.py

# ➡️ Your backend is now running at http://localhost:5001


3. Run the Frontend (Terminal 2)

Open a new terminal window in the same trackfuse-ml folder.

# 1. Install Node.js dependencies
# (Use npm, yarn, or bun)
npm install

# 2. Start the Vite development server
npm run dev

# ➡️ Your frontend is now running at http://localhost:8080


Now you can open http://localhost:8080 in your browser to use the application. The frontend will automatically talk to the backend thanks to the proxy in vite.config.ts.

Project Structure

trackfuse-ml/
│
├── src/                # React/Vite frontend source
│   ├── components/
│   │   └── ui/         # Shadcn UI components
│   └── DetectionTab.tsx  # Main React component
│
├── venv/               # Python virtual environment (ignored)
│
├── app.py              # Flask backend server
├── model_inception_v3.h5 # AI Model (ignored)
├── requirements.txt    # Python dependencies
│
├── vite.config.ts      # Vite config (with proxy for /predict)
├── package.json        # Node.js dependencies
├── .gitignore          # Files ignored by Git
└── README.md


Future Improvements

    ✅ Backend integration for live railway ticketing

    ✅ Secure login & authentication

    ✅ Cloud-based PDF storage

    ✅ Analytics dashboard for usage tracking

Contributing

Contributions are welcome!
Fork the repo and create a pull request with improvements.
License

This project is licensed under the MIT License.
