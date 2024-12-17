from flask import Flask, request, jsonify
from flask_cors import CORS
from PyPDF2 import PdfReader
import openai
import os
from dotenv import load_dotenv
import tempfile

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Configure OpenAI
openai.api_key = os.getenv("OPENAI_API_KEY")

def extract_text_from_pdf(file):
    try:
        # Create a temporary file to save the uploaded file
        with tempfile.NamedTemporaryFile(delete=False) as temp_file:
            file.save(temp_file.name)
            pdf_reader = PdfReader(temp_file.name)
            
            text = ""
            for page in pdf_reader.pages:
                page_text = page.extract_text() or ""
                text += page_text
            
            # Clean up the temporary file
            os.unlink(temp_file.name)
            
            text = text.strip()
            if not text:
                raise Exception("PDF_REQUIRES_OCR")
                
            return text
    except Exception as e:
        if str(e) == "PDF_REQUIRES_OCR":
            raise
        raise Exception(f"Error al procesar el PDF: {str(e)}")

def summarize_text_with_openai(text):
    try:
        response = openai.ChatCompletion.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "Eres un asistente experto en resumir documentos. Genera resúmenes concisos y claros."},
                {"role": "user", "content": f"Resume el siguiente texto en español, manteniendo los puntos más importantes:\n\n{text}"}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content.strip()
    except Exception as e:
        raise Exception(f"Error al generar el resumen: {str(e)}")

@app.route('/process-pdf', methods=['POST'])
def process_pdf():
    if 'file' not in request.files:
        return jsonify({"error": "No se proporcionó ningún archivo PDF"}), 400

    file = request.files['file']
    if not file.filename.lower().endswith('.pdf'):
        return jsonify({"error": "El archivo debe ser un PDF"}), 400

    try:
        # Extract text from PDF
        extracted_text = extract_text_from_pdf(file)
        
        # Generate summary with OpenAI
        summary = summarize_text_with_openai(extracted_text)
        
        return jsonify({
            "summary": summary,
            "text": extracted_text
        }), 200
        
    except Exception as e:
        error_message = str(e)
        if error_message == "PDF_REQUIRES_OCR":
            return jsonify({"error": "PDF_REQUIRES_OCR"}), 400
        return jsonify({"error": error_message}), 500

if __name__ == '__main__':
    app.run(debug=True)