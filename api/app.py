from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
import cv2
import json

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})


@app.route("/")
def home():
    return {"message": "LeafScan API is running"}


MODEL_PATH = "models/leaf_scan_model.h5"
model = tf.keras.models.load_model(MODEL_PATH)

with open("models/class_names.json") as f:
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

    img = cv2.resize(img, (224, 224))
    img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
    img = np.expand_dims(img, axis=0).astype(float32)

    preds = model.predict(img)[0]

    top_indices = preds.argsort()[-3:][::-1]
    top_predictions = []

    for i in top_indices:
        top_predictions.append(
            {"plant": CLASS_NAMES[i], "confidence": round(float(preds[i]) * 100, 2)}
        )

    top1 = top_predictions[0]
    top2 = top_predictions[1] if len(top_predictions) > 1 else None

    status = "known"
    final_plant = top1["plant"]
    confidence = top1["confidence"]

    if confidence < 50:
        status = "unknown"
        final_plant = "Unknown plant"
    elif top2 and (confidence - top2["confidence"] < 10):
        status = "uncertain"
        final_plant = f"Uncertain ({top1['plant']})"

    return jsonify(
        {
            "status": status,
            "plant": final_plant,
            "confidence": confidence,
            "top_predictions": top_predictions,
        }
    )


if __name__ == "__main__":
    app.run(debug=True)
