package main

import (
	"embed"
	"log"
	"path/filepath"

	"github.com/wailsapp/wails/v3/pkg/application"

	"zap-messages/app/chat"
	"zap-messages/app/platform"
	"zap-messages/app/storage"
	"zap-messages/app/sync"
)

//go:embed all:frontend/dist
var assets embed.FS

func main() {
	storageDir := platform.StoragePath()
	dbPath := filepath.Join(storageDir, "messages.db")

	db, err := storage.Open(dbPath)
	if err != nil {
		log.Fatalf("failed to initialize sqlite database: %v", err)
	}
	defer db.Close()

	syncClient := sync.NewClient(db)
	defer syncClient.Close()

	chatService := chat.NewChatService(db, syncClient)

	app := application.New(application.Options{
		Name:        "Messages",
		Description: "Self-hosted, open-source Messages clone",
		Assets: application.AssetOptions{
			Handler: application.AssetFileServerFS(assets),
		},
		Services: []application.Service{
			application.NewService(chatService),
		},
		Mac: application.MacOptions{
			ApplicationShouldTerminateAfterLastWindowClosed: true,
		},
		Server: application.ServerOptions{
			Port: 8080,
		},
	})

	app.Window.NewWithOptions(application.WebviewWindowOptions{
		Title:     "Messages",
		Width:     880,
		Height:    720,
		MinWidth:  640,
		MinHeight: 480,
		Mac: application.MacWindow{
			TitleBar:   application.MacTitleBarHiddenInset,
			Appearance: application.DefaultAppearance,
		},
		Windows: application.WindowsWindow{
			BackdropType: application.Auto,
		},
		URL: "/",
	})

	platform.SetupLifecycle(app)

	err = app.Run()
	if err != nil {
		log.Fatal(err)
	}
}
