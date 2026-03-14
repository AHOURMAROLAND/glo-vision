import requests
import os

def get_base_url():
    instance_id = os.getenv('GREEN_API_INSTANCE_ID')
    token = os.getenv('GREEN_API_TOKEN')
    return f"https://api.green-api.com/waInstance{instance_id}", token

def envoyer_message(numero, message):
    base_url, token = get_base_url()
    numero_formate = f"{numero}@c.us"
    payload = {
        "chatId": numero_formate,
        "message": message
    }
    response = requests.post(
        f"{base_url}/sendMessage/{token}",
        json=payload
    )
    return response.json()

def verifier_numero(numero):
    base_url, token = get_base_url()
    numero_formate = f"{numero}@c.us"
    payload = {"phoneNumber": numero_formate}
    response = requests.post(
        f"{base_url}/checkWhatsapp/{token}",
        json=payload
    )
    return response.json()

def envoyer_image(numero, url_image, caption=""):
    base_url, token = get_base_url()
    numero_formate = f"{numero}@c.us"
    payload = {
        "chatId": numero_formate,
        "urlFile": url_image,
        "fileName": "photo.jpg",
        "caption": caption
    }
    response = requests.post(
        f"{base_url}/sendFileByUrl/{token}",
        json=payload
    )
    return response.json()