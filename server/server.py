from http.server import BaseHTTPRequestHandler, HTTPServer
import json
import difflib

import numpy as np
import mss
import pyautogui
import cv2
import pytesseract

pytesseract.pytesseract.tesseract_cmd = "C:/Program Files/Tesseract-OCR/tesseract.exe"

HOSTNAME = "localhost"
SERVER_PORT = 23453

# get scren resolution
W, H = pyautogui.size()

# Define range of white color in BGR
LOWER_WHITE = np.array([150, 150, 150])
UPPER_WHITE = np.array([255, 255, 255])


def loadTraits():
    traits = []
    whitelistSet = set()
    with open("../packages/overwolf/public/app/data/TFTSet9_Stage2/traits.json") as json_file:
        traitsData = json.load(json_file)

        for t in traitsData:
            traits.append(t["name"])
            for c in t["name"]:
                whitelistSet.add(c)

    return traits, "".join(sorted(whitelistSet, key=lambda x: ord(x))).replace(" ", "")  # + "123456789"


TRAITS, WHITELIST_CHARS = loadTraits()

print("TRAITS:", TRAITS)
print("WHITELIST_CHARS:", WHITELIST_CHARS)

TESSERACT_CONFIG = f"-c tessedit_char_whitelist={WHITELIST_CHARS} --oem 3 --psm 6"  # --oem 3 --psm 6

print("TESSERACT_CONFIG:", TESSERACT_CONFIG)


def ocrTraits(img: cv2.typing.MatLike):
    # Threshold the BGR image to get only white colors
    mask = cv2.inRange(img, LOWER_WHITE, UPPER_WHITE)

    # Bitwise-AND mask and original image
    img = cv2.bitwise_and(img, img, mask=mask)

    str = pytesseract.image_to_string(img, config=TESSERACT_CONFIG, output_type=pytesseract.Output.STRING)

    slitStr = str.split()

    similarTraits = []
    for word in slitStr:
        closeMatches = difflib.get_close_matches(word, TRAITS, n=1, cutoff=0.8)
        if len(closeMatches) > 0:
            similarTraits.append(closeMatches[0])

    return similarTraits


class TFTPoolServer(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path.startswith("/screenshot"):
            monitor = (0, H // 4, W // 8, H // 2)  # x, y, w, h
            with mss.mss() as sct:
                img = sct.grab(monitor)
                img = np.array(img)

                # convert to bgr
                img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)

                # get traits
                traits = ocrTraits(img)

                if len(traits) > 0:
                    cv2.imwrite(f"./tests/TFTSet9_Stage2/{traits}.png", img)

                self.send_response(200)
                self.send_header("Content-type", "application/json")
                self.end_headers()
                self.wfile.write(bytes(json.dumps(traits), "utf-8"))
                return


if __name__ == "__main__":
    webServer = HTTPServer((HOSTNAME, SERVER_PORT), TFTPoolServer)
    print("Server started http://%s:%s" % (HOSTNAME, SERVER_PORT))

    try:
        webServer.serve_forever()
    except KeyboardInterrupt:
        pass

    webServer.server_close()
    print("Server stopped.")

# img = cv2.imread("./tests/Shotcut_00_23_44_967.png")
# print(ocrTraits(img))
