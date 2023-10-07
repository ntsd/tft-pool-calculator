package main

import (
	"encoding/json"
	"flag"
	"fmt"
	"image"
	"image/png"
	"io/ioutil"
	"log"
	"os"

	"github.com/bytedance/sonic"
	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/kbinani/screenshot"
	"github.com/otiai10/gosseract/v2"
)

var (
	port = flag.String("port", "23453", "The server port")
)

type tftPoolHandler struct {
	displayNum int
	bounds     image.Rectangle
	traits     []string
	ocr        *gosseract.Client
}

func loadTraits() ([]string, string) {
	content, err := ioutil.ReadFile("packages/overwolf/public/app/data/TFTSet9_Stage2/traits.json")
	if err != nil {
		log.Fatal("Error when opening file: ", err)
	}

	payload := []struct{ Name string }{}
	err = json.Unmarshal(content, &payload)
	if err != nil {
		log.Fatal("Error during Unmarshal(): ", err)
	}

	taits := []string{}
	whitelistMap := map[rune]struct{}{}

	for i := 0; i < len(payload); i++ {
		for _, char := range payload[i].Name {
			whitelistMap[char] = struct{}{}
		}

		taits = append(taits, payload[i].Name)
	}

	whitelist := ""
	for r := range whitelistMap {
		whitelist += string(r)
	}

	return taits, whitelist
}

func (t *tftPoolHandler) Screenshot(c *fiber.Ctx) error {
	img, err := screenshot.CaptureRect(t.bounds)
	if err != nil {
		log.Printf("capture rect failed: %v", err)
		return err
	}

	fileName := "temp.png"
	file, _ := os.Create(fileName)
	defer file.Close()
	png.Encode(file, img)

	fmt.Printf("#%d: %v \"%s\"\n", t.displayNum, t.bounds, fileName)

	c.JSON([]string{})

	return nil
}

func newHandler() *tftPoolHandler {
	displayNum := 0

	bounds := screenshot.GetDisplayBounds(displayNum)
	bounds.Max = image.Point{bounds.Max.X / 8, bounds.Max.Y / 2}

	traits, whitelist := loadTraits()

	fmt.Println(traits, whitelist)

	client := gosseract.NewClient()
	client.SetWhitelist(whitelist)

	s := &tftPoolHandler{
		displayNum: displayNum,
		bounds:     bounds,
		traits:     traits,
		ocr:        client,
	}
	return s
}

func main() {
	handler := newHandler()

	app := fiber.New(fiber.Config{
		Prefork:     false,
		JSONEncoder: sonic.Marshal,
		JSONDecoder: sonic.Unmarshal,
	})

	app.Use(recover.New())

	app.Use(cors.New(cors.Config{
		AllowOrigins: "http://localhost:" + *port,
		AllowHeaders: "Origin, Content-Type, Accept",
	}))

	app.Get("/screenshot", handler.Screenshot)

	log.Fatal(app.Listen("localhost:" + *port))
}
