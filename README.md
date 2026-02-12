LeafZeno – AI-Based Plant Identification System
===============================================

📌 Overview
-----------

LeafZeno is a deep learning–based plant identification system that recognizes plant species using leaf images.  
Users upload a leaf image through a web interface and receive predicted plant species with confidence scores.

This project demonstrates practical use of Convolutional Neural Networks (CNN) and transfer learning.

🎯 Features
-----------

- Upload and preview leaf image
- AI-based plant classification
- Top-3 predicted plant species
- Confidence score visualization
- Web-based interface
- Flask REST API backend

🧠 Methodology
--------------

- Image preprocessing (resize + normalization)
- Transfer learning with pretrained CNN
- Fine-tuned classification layer (10 plant species)
- Softmax probability output
- Top-3 prediction selection

🏗 System Architecture
----------------------

User → Web Interface → Flask API → CNN Model → Prediction Results → Web Interface

🛠 Technology Stack
-------------------

Backend
- Python
- TensorFlow / Keras
- Flask
- Flask-CORS
- OpenCV
- NumPy

Frontend
- HTML
- Tailwind CSS
- JavaScript

Tools
- Jupyter Notebook
- VS Code
- Git & GitHub

📂 Project Structure
--------------------

```
LeafScan/
├── api/
│   └── app.py
├── frontend/
│   └── index.html
├── notebooks/
├── models/
├── requirements.txt
├── .gitignore
└── README.md
```

🚀 Installation & Setup
-----------------------

1. Clone repository

```
git clone https://github.com/LeafZeno/LeafScan_Project.git
cd LeafScan
```

2. Create virtual environment

```
python -m venv venv
```

Activate (Windows)

```
venv\Scripts\activate
```

Activate (Mac/Linux)

```
source venv/bin/activate
```

3. Install dependencies

```
pip install -r requirements.txt
```

4. Run backend

```
cd api
python app.py
```

5. Open frontend

```
frontend/index.html
```

📊 Dataset
----------

Labeled leaf images for 10 plant species.  
Dataset not included due to size and license.

📈 Results
----------

Training Accuracy: ~89%  
Validation Accuracy: ~75–80%

⚠ Limitations
-------------

- Only 10 species
- Image quality affects accuracy
- Similar leaves may confuse model

🔮 Future Work
--------------

- Add more species
- Improve accuracy
- Deploy online
- Mobile friendly UI

👨‍🎓 Academic Context
---------------------

Developed as Project Practicum at Royal University of Phnom Penh.

📜 License
----------

Educational use only.

🏁 Final Note
-------------

LeafZeno is a complete AI-powered plant identification web application.
