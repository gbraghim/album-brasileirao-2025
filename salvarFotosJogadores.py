import os
import requests
import time
from serpapi import GoogleSearch

# Configurações
api_key = "a3f6f338fb38c847c04022292bb97df6d4188533fb816fd8c56d49a525c27e23"
output_folder = r"C:\\album\\public\\players"
max_tentativas = 5  # Tentar até 5 imagens por jogador

# Para guardar quem falhou
falhas = []

def baixar_imagem(jogador, clube):
    pasta_time = os.path.join(output_folder, clube)
    os.makedirs(pasta_time, exist_ok=True)

    termo_pesquisa = f"{jogador} jogador do {clube}"

    search = GoogleSearch({
        "q": termo_pesquisa,
        "tbm": "isch",
        "api_key": api_key,
    })

    try:
        results = search.get_dict()
        imagens = results.get("images_results", [])

        if not imagens:
            print(f"[SEM RESULTADOS] {jogador}")
            falhas.append((jogador, clube))
            return

        sucesso = False

        for idx, img in enumerate(imagens[:max_tentativas]):
            imagem_url = img["original"]
            try:
                response = requests.get(imagem_url, timeout=10)
                if response.status_code == 200:
                    nome_arquivo = f"{jogador.replace(' ', '')}.jpg"
                    caminho_arquivo = os.path.join(pasta_time, nome_arquivo)
                    with open(caminho_arquivo, "wb") as f:
                        f.write(response.content)
                    print(f"[OK] {jogador} salvo em {caminho_arquivo}")
                    sucesso = True
                    break
                else:
                    print(f"[ERRO DOWNLOAD] {jogador} tentativa {idx+1} Status {response.status_code}")
            except Exception as e:
                print(f"[ERRO REQUISIÇÃO] {jogador} tentativa {idx+1}: {str(e)}")

        if not sucesso:
            print(f"[FALHA FINAL] {jogador} não pôde ser baixado")
            falhas.append((jogador, clube))

    except Exception as e:
        print(f"[ERRO] {jogador}: {str(e)}")
        falhas.append((jogador, clube))

# Lista dos jogadores que falharam
jogadores_faltantes = [
    ("Weverton", "Palmeiras"),
    ("Gustavo Gómez", "Palmeiras"),
    ("Raphael Veiga", "Palmeiras"),
    ("Bustos", "Internacional"),
    ("Battaglia", "Atlético-MG"),
    ("Martínez", "Atlético-MG"),
    ("Matías Zaracho", "Atlético-MG"),
    ("Pavón", "Atlético-MG"),
    ("Paulinho", "Atlético-MG"),
]

for jogador, clube in jogadores_faltantes:
    print(f"[BÚSQUISA] {jogador} → {jogador} jogador do {clube}")
    baixar_imagem(jogador, clube)
    time.sleep(1)  # Espera 1 segundo entre buscas

# Exibe falhas ao final
if falhas:
    print("\n===== FALHAS =====")
    for jogador, clube in falhas:
        print(f"{jogador} ({clube})")
else:
    print("\nTodos os jogadores foram baixados com sucesso!")
