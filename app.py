import os
import io
import traceback
from flask import Flask, request, jsonify
from flask_cors import CORS
# NEW: Import the correct preprocessor for InceptionV3
from tensorflow.keras.applications.inception_v3 import preprocess_input

# --- REMOVED: os.environ['TF_USE_LEGACY_KERAS'] = '1' ---
# Not needed for this model.

# =============== BASIC SETUP ==================
os.environ['TF_CPP_MIN_LOG_LEVEL'] = '2'   # Suppress TF warnings
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'  # Fix macOS compatibility
app = Flask(__name__)
CORS(app)

# UPDATED: Point to the InceptionV3 model at the correct path
MODEL_PATH = '/Users/akshat/projects/Track_Fusion-1/model_inception_v3.h5'
model = None
tf = None
np = None
Image = None

# =============== LAZY IMPORT TENSORFLOW ==================
def _import_tf():
    global tf, np, Image
    if tf is None:
        import tensorflow as tf
        import numpy as np
        from PIL import Image
        # Threading fix for macOS
        try:
            tf.config.threading.set_intra_op_parallelism_threads(1)
            tf.config.threading.set_inter_op_parallelism_threads(1)
        except:
            pass
        print("✅ TensorFlow imported successfully")
    return tf, np, Image


# =============== MODEL LOADING (Simplified for InceptionV3) ==================
def load_model():
    global model
    if model is None:
        tf, _, _ = _import_tf()
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(f"❌ Model not found at {MODEL_PATH}")
        try:
            # Use the simple, direct loading method that works for this model
            model = tf.keras.models.load_model(MODEL_PATH, compile=False)
            print(f"✅ Model loaded successfully from {MODEL_PATH}")
            
        except Exception as e:
            # Fallback for general errors
            print(f"❌ Critical Error loading model: {e}")
            traceback.print_exc()
            raise
    return model

# =============== IMAGE PREPROCESS (for InceptionV3) ==================
def preprocess_image(image_bytes, target_size=(448, 448)):
    _, np, Image = _import_tf()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB").resize(target_size)
    # Convert to array but do not divide by 255.0
    img_array = np.array(image, dtype=np.float32)
    img_array = np.expand_dims(img_array, axis=0)
    
    # Use the InceptionV3-specific preprocessing (scales pixels from -1 to 1)
    img_array = preprocess_input(img_array)
    
    return img_array


# =============== ROUTES ==================

@app.route('/')
def home():
    return jsonify({
        "message": "✅ Flask AI Model API is running.",
        "endpoints": {
            "/health": "Check if model is loaded",
            "/predict": "POST image for prediction"
        }
    })


@app.route('/health', methods=['GET'])
def health():
    try:
        model_loaded = load_model() is not None
        return jsonify({"status": "healthy", "model_loaded": model_loaded})
    except Exception as e:
        return jsonify({"status": "unhealthy", "error": str(e)}), 500


@app.route('/predict', methods=['POST'])
def predict():
    try:
        if 'file' not in request.files:
            return jsonify({'error': 'No file uploaded'}), 400

        file = request.files['file']
        image_bytes = file.read()

        model = load_model()
        tf, np, _ = _import_tf()

        # Determine input size from the loaded model
        try:
            input_shape = model.input_shape
            if isinstance(input_shape, list):
                input_shape = input_shape[0]
            
            if len(input_shape) >= 3 and input_shape[1] is not None and input_shape[2] is not None:
                target_size = (int(input_shape[1]), int(input_shape[2]))
            else:
                target_size = (448, 448) # Default from your notebook
                print("⚠️ Could not determine model input size, defaulting to (448, 448)")
        except Exception as e:
            print(f"Error determining input shape: {e}, defaulting to (448, 448)")
            target_size = (448, 448)

        img_array = preprocess_image(image_bytes, target_size=target_size)
        preds = model.predict(img_array, verbose=0)

        # Logic from your notebook
        # ... inside your predict() function ...

# This logic was already here
        if preds.shape[-1] == 1:
            score = float(preds[0][0])
            label = "Defective" if score > 0.5 else "Non Defective"
            confidence = score if label == "Defective" else 1 - score
            raw_score = score # This is the raw score
        else:
            class_idx = int(np.argmax(preds))
            label = ['Defective', 'Non Defective'][class_idx]
            confidence = float(np.max(preds))
            raw_score = confidence # This is the raw score

        # I added "raw_score" to the response
        return jsonify({
            "predicted_class": label,
            "confidence": round(float(confidence), 4),
            "raw_score": round(float(raw_score), 4) # <-- THIS IS THE FIX
        })
    except Exception as e:
        print("❌ Prediction error:", e)
        traceback.print_exc()
        return jsonify({'error': str(e)}), 500


# =============== SERVER START ==================
if __name__ == '__main__':
    print("🚀 Starting Flask server on http://127.0.0.1:5001/")
    app.run(host='0.0.0.0', port=5001, debug=True, threaded=False, use_reloader=False)

