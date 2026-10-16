//go:build !ios && !android

package platform

import (
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func PlatformName() string {
	return "desktop"
}

func SetupLifecycle(app *application.App) {
	// Desktop lifecycle defaults
}

func StoragePath() string {
	homeDir, err := os.UserHomeDir()
	if err != nil {
		return ".zap-messages"
	}
	return filepath.Join(homeDir, ".zap-messages")
}
