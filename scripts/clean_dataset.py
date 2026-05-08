from pathlib import Path
import tensorflow as tf

DATASET_DIR = Path("dataset/leafscan_training_dataset")
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png"}

removed = 0
kept = 0

for file_path in DATASET_DIR.rglob("*"):
    if not file_path.is_file():
        continue

    ext = file_path.suffix.lower().strip()

    if ext not in ALLOWED_EXTENSIONS:
        print("Remove bad extension:", file_path)
        file_path.unlink()
        removed += 1
        continue

    try:
        img_bytes = tf.io.read_file(str(file_path))
        tf.io.decode_image(img_bytes, channels=3)
        kept += 1
    except Exception as e:
        print("Remove corrupted image:", file_path, "|", e)
        file_path.unlink()
        removed += 1

print("Done")
print("Kept:", kept)
print("Removed:", removed)