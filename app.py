# app.py
import os
from flask import Flask, render_template, request, redirect, url_for, jsonify
from werkzeug.utils import secure_filename
from transformers import pipeline

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = 'uploads/'
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)

# Initialize Hugging Face pipelines
asr_pipeline = pipeline("automatic-speech-recognition", model="Messam174/wav2vec2-large-xls-r-300m-en")
translation_pipeline = pipeline("text2text-generation", model="Messam174/mbart-large-50-many-to-many-mmt")

@app.route('/')
def home():
    return render_template('about.html')

@app.route('/convert', methods=['GET', 'POST'])
def convert():
    if request.method == 'POST':
        if 'audio_file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['audio_file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file:
            filename = secure_filename(file.filename)
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)

            # Convert audio to text
            transcription = asr_pipeline(filepath)
            text = transcription['text']

            return jsonify({'transcription': text})

    return render_template('index.html')

@app.route('/translate', methods=['POST'])
def translate():
    data = request.get_json()
    text = data.get('text', '')
    if not text:
        return jsonify({'error': 'No text provided'}), 400

    # Translate text
    translated = translation_pipeline(text)
    translated_text = translated[0]['generated_text']

    return jsonify({'translation': translated_text})

if __name__ == "__main__":
    app.run(host='0.0.0.0', port=80)

