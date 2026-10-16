//go:build ios

package platform

import (
	"os"
	"path/filepath"

	"github.com/wailsapp/wails/v3/pkg/application"
)

func PlatformName() string {
	return "ios"
}

func SetupLifecycle(app *application.App) {
	// iOS lifecycle event hooks
}

func StoragePath() string {
	// iOS app sandbox Documents directory
	homeDir := os.Getenv("HOME")
	if homeDir == "" {
		return "Documents"
	}
	return filepath.Join(homeDir, "Documents")
}
