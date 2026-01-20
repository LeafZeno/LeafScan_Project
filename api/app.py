from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import json

app = Flask(__name__)
CORS(app)

# Load model ONCE at startup
MODEL_PATH = "../models/leaf_scan_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

# Load class names
with open("../models/class_names.json") as f:
    CLASS_NAMES = json.load(f)


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    img_bytes = file.read()
    img_array = np.frombuffer(img_bytes, np.uint8)
    img = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

    if img is None:
        return jsonify({"error": "Invalid image"}), 400

    # Preprocess
    img = cv2.resize(img, (224, 224))
    img = img / 255.0
    img = np.expand_dims(img, axis=0)

    # Predict
    preds = model.predict(img)[0]

    # Top 3 predictions
    top_indices = preds.argsort()[-3:][::-1]
    top_predictions = []

    for i in top_indices:
        top_predictions.append({
            "plant": CLASS_NAMES[i],
            "confidence": round(float(preds[i]) * 100, 2)
        })

    # Unknown threshold (optional)
    if top_predictions[0]["confidence"] < 50:
        return jsonify({
            "plant": "Unknown plant",
            "top_predictions": top_predictions
        })

    return jsonify({
        "plant": top_predictions[0]["plant"],
        "confidence": top_predictions[0]["confidence"],
        "top_predictions": top_predictions
    })


if __name__ == "__main__":
    app.run(debug=True)
