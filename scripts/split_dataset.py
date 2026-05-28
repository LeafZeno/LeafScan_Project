import os
import shutil
import random
from pathlib import Path

# =========================
# CONFIG
# =========================

SOURCE_DIR = "../dataset/leafscan_training_dataset"
OUTPUT_DIR = "../dataset/dataset_split"

TRAIN_RATIO = 0.7
VAL_RATIO = 0.15
TEST_RATIO = 0.15

SEED = 42

# =========================
# SET RANDOM SEED
# =========================

random.seed(SEED)

# =========================
# CREATE OUTPUT FOLDERS
# =========================

for split in ["train", "val", "test"]:
    os.makedirs(os.path.join(OUTPUT_DIR, split), exist_ok=True)

# =========================
# SPLIT DATASET
# =========================

for class_name in os.listdir(SOURCE_DIR):

    class_dir = os.path.join(SOURCE_DIR, class_name)

    # Skip non-folder files
    if not os.path.isdir(class_dir):
        continue

    images = os.listdir(class_dir)

    # Shuffle images
    random.shuffle(images)

    total_images = len(images)

    train_end = int(total_images * TRAIN_RATIO)
    val_end = train_end + int(total_images * VAL_RATIO)

    train_images = images[:train_end]
    val_images = images[train_end:val_end]
    test_images = images[val_end:]

    splits = {
        "train": train_images,
        "val": val_images,
        "test": test_images
    }

    for split_name, split_images in splits.items():

        split_class_dir = os.path.join(
            OUTPUT_DIR,
            split_name,
            class_name
        )

        os.makedirs(split_class_dir, exist_ok=True)

        for image_name in split_images:

            src_path = os.path.join(class_dir, image_name)
            dst_path = os.path.join(split_class_dir, image_name)

            shutil.copy2(src_path, dst_path)

    print(f"{class_name} done")

print("\nDataset splitting completed!")