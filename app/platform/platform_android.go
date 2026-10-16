//go:build android

package platform

import (
	"os"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func PlatformName() string {
	return "android"
}

func SetupLifecycle(app *application.App) {
	// Android lifecycle event hooks
}

func StoragePath() string {
	// Android app internal storage directory
	filesDir := os.Getenv("FILES_DIR")
	if filesDir != "" {
		return filesDir
	}
	return "."
}
