🌿 LeafScan – AI-Based Plant Identification System

📌 Overview

LeafScan is a deep learning–based plant identification system that recognizes plant species using leaf images. The system allows users to upload a leaf image through a web interface and receive predicted plant species along with confidence scores.

The project demonstrates the practical application of Convolutional Neural Networks (CNN) and transfer learning in image classification.

🎯 Features

Upload and preview leaf image

AI-based plant classification

Top-3 predicted plant species

Confidence score visualization

Plant information and reference images

Web-based user interface

Flask REST API backend

🧠 Methodology

Image preprocessing (resize + normalization)

Transfer learning using a pretrained CNN

Fine-tuned classification layer for 10 plant species

Softmax probability output

Top-3 prediction selection

🏗 System Architecture

User → Web Interface → Flask API → CNN Model → Prediction Results → Web Interface

The frontend sends the uploaded image to the backend API.
The backend preprocesses the image and passes it to the trained CNN model.
The model returns class probabilities, and the top predictions are displayed to the user.

🛠 Technology Stack
Backend

Python

TensorFlow / Keras

Flask

Flask-CORS

OpenCV

NumPy

Frontend

HTML

Tailwind CSS

JavaScript

Development Tools

Jupyter Notebook

VS Code

Git & GitHub
