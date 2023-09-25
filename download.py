import requests
import json 

setMutator = "TFTSet9_Stage2"

res = requests.get('https://raw.communitydragon.org/latest/cdragon/tft/en_us.json')
response = json.loads(res.text)

for setData in response["setData"]:
    print(setData["number"], setData["name"], setData["mutator"])
    if setData["mutator"] == setMutator:
        traits = setData["traits"]
        champions = []

        for champion in setData["champions"]:
            if len(champion["traits"]) > 0 and champion["cost"] > 0 and champion["cost"] < 6:
                champions.append(champion)


with open("./public/data/" + setMutator + "/traits.json", "w") as outfile:
    outfile.write(json.dumps(traits, indent=4))


with open("./public/data/" + setMutator + "/champions.json", "w") as outfile:
    outfile.write(json.dumps(champions, indent=4))
