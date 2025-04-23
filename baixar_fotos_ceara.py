import os
import requests
import shutil
import time
from duckduckgo_search import DDGS
from serpapi import GoogleSearch

# API KEY do SerpAPI já configurada
SERPAPI_API_KEY = "a3f6f338fb38c847c04022292bb97df6d4188533fb816fd8c56d49a525c27e23"

# Lista de jogadores
players = [
    "Bruno Ferreira",
    "Fernando Miguel",
    "Gabriel Lacerda",
    "Ramon Menezes",
    "David Ricardo",
    "Yago",
    "Eric Melo",
    "Jorge Recalde",
    "Lourenço",
    "Léo Rafael",
    "Lucas Mugni",
    "Caio Rafael",
    "Erick Pulga",
    "Daniel Mazerochi",
    "João Victor",
    "Aylon",
    "Saulo Mineiro"
]

DEST_FOLDER = r"C:\album\public\players\Ceará"
os.makedirs(DEST_FOLDER, exist_ok=True)

def limpar_nome(nome):
    return "".join(c for c in nome if c.isalnum())

def baixar_imagem(url, path_destino):
    try:
        resp = requests.get(url, stream=True, timeout=20)
        if resp.status_code == 200:
            with open(path_destino, 'wb') as f:
                shutil.copyfileobj(resp.raw, f)
            return True
        else:
            print(f"[ERRO HTTP] {resp.status_code} para {url}")
            return False
    except Exception as e:
        print(f"[EXCEÇÃO] {e}")
        return False

def buscar_duckduckgo(query):
    with DDGS() as ddgs:
        try:
            results = ddgs.images(query, safesearch='Moderate', max_results=1)
            if results:
                return results[0]['image']
            else:
                return None
        except Exception as e:
            print(f"[ERRO DuckDuckGo] {e}")
            return None

def buscar_google(query):
    try:
        params = {
            "q": query,
            "tbm": "isch",
            "api_key": SERPAPI_API_KEY
        }
        search = GoogleSearch(params)
        results = search.get_dict()
        if "images_results" in results and results["images_results"]:
            return results["images_results"][0]["original"]
        else:
            return None
    except Exception as e:
        print(f"[ERRO Google] {e}")
        return None

