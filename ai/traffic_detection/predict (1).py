import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

# Load model
model = tf.keras.models.load_model("model.h5")

# Class labels (⚠️ MUST match your training order)
classes = ["High", "Low", "Medium"]  # change if needed

# Image path
img_path = "high.jpg"  # put your image in same folder

# Load and preprocess image
img = image.load_img(img_path, target_size=(224, 224))
img_array = image.img_to_array(img)
img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

# Predict
prediction = model.predict(img_array)

# Output
print("Raw Output:", prediction)

predicted_class = classes[np.argmax(prediction)]
print("Prediction:", predicted_class)