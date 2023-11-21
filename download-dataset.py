import requests
import json 
import os

def cdragonPath(path: str) :
    return f"https://raw.communitydragon.org/latest/game/{path}"

def downlaodIntoPath(filePath: str, downloadPath: str):

    os.makedirs(os.path.dirname(filePath), exist_ok=True)

    print(f"downloading {downloadPath}")

    r = requests.get(downloadPath, allow_redirects=True)
    open(filePath, 'wb').write(r.content)


print("loading communitydragon data")

setMutator = "TFTSet10"
assetDir = "./packages/core/src/data/"
staticDir = "./packages/overwolf/public/"

res = requests.get('https://raw.communitydragon.org/latest/cdragon/tft/en_us.json')

response = json.loads(res.text)

for setData in response["setData"]:
    print(setData["number"], setData["name"], setData["mutator"])
    if setData["mutator"] == setMutator:
        traits = setData["traits"]
        champions = []

        for champion in setData["champions"]:
            if len(champion["traits"]) > 0 and \
                    champion["cost"] > 0 and \
                    champion["cost"] < 6 and \
                    champion["tileIcon"].endswith(".tex"):

                champions.append(champion)

                # download tile image
                path = champion["tileIcon"].lower().replace('.tex', '.png')
                downlaodIntoPath(staticDir + path, cdragonPath(path))
        
        for trait in traits:
            if trait["icon"]:
                path = trait["icon"].lower().replace('.tex', '.png')
                downlaodIntoPath(staticDir + path, cdragonPath(path))


os.makedirs(assetDir + setMutator, exist_ok=True)
with open(assetDir + setMutator + "/traits.json", "w") as outfile:
    outfile.write(json.dumps(traits, separators=(',', ':')))

with open(assetDir + setMutator + "/champions.json", "w") as outfile:
    outfile.write(json.dumps(champions, separators=(',', ':')))
