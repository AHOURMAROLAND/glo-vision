import requests
import os
import base64

def get_base_url():
    instance_id = os.getenv('GREEN_API_INSTANCE_ID')
    token = os.getenv('GREEN_API_TOKEN')
    return f"https://api.green-api.com/waInstance{instance_id}", token

def envoyer_message(numero, message):
    base_url, token = get_base_url()
    payload = {
        "chatId": f"{numero}@c.us",
        "message": message
    }
    response = requests.post(f"{base_url}/sendMessage/{token}", json=payload)
    return response.json()

def verifier_numero(numero):
    base_url, token = get_base_url()
    payload = {"phoneNumber": f"{numero}@c.us"}
    response = requests.post(f"{base_url}/checkWhatsapp/{token}", json=payload)
    return response.json()

def envoyer_image(numero, url_image, caption=""):
    base_url, token = get_base_url()
    payload = {
        "chatId": f"{numero}@c.us",
        "urlFile": url_image,
        "fileName": "photo.jpg",
        "caption": caption
    }
    response = requests.post(f"{base_url}/sendFileByUrl/{token}", json=payload)
    return response.json()

def envoyer_pdf(numero, pdf_buffer, nom_fichier, caption=""):
    base_url, token = get_base_url()
    pdf_base64 = base64.b64encode(pdf_buffer.read()).decode('utf-8')
    payload = {
        "chatId": f"{numero}@c.us",
        "file": pdf_base64,
        "fileName": nom_fichier,
        "caption": caption
    }
    response = requests.post(f"{base_url}/sendFileByUpload/{token}", json=payload)
    return response.json()