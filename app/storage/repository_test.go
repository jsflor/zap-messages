package storage

import (
	"path/filepath"
	"testing"
	"time"
)

func TestStorageRepository(t *testing.T) {
	tempDir := t.TempDir()
	dbPath := filepath.Join(tempDir, "test.db")

	db, err := Open(dbPath)
	if err != nil {
		t.Fatalf("Open failed: %v", err)
	}
	defer db.Close()

	now := time.Now().Truncate(time.Second)
	conv := &Conversation{
		ID:              "conv-1",
		Title:           "Alice Smith",
		IsGroup:         false,
		IsPinned:        true,
		LastMessageText: "Hello there!",
		LastMessageAt:   &now,
		UnreadCount:     1,
		Participants: []Participant{
			{
				ID:             "part-1",
				ConversationID: "conv-1",
				UserID:         "user-alice",
				Name:           "Alice Smith",
			},
		},
	}

	if err := db.SaveConversation(conv); err != nil {
		t.Fatalf("SaveConversation failed: %v", err)
	}

	convs, err := db.GetConversations()
	if err != nil {
		t.Fatalf("GetConversations failed: %v", err)
	}
	if len(convs) != 1 {
		t.Fatalf("expected 1 conversation, got %d", len(convs))
	}
	if !convs[0].IsPinned {
		t.Errorf("expected conversation to be pinned")
	}

	msg := &Message{
		ID:             "msg-1",
		ConversationID: "conv-1",
		SenderID:       "user-alice",
		SenderName:     "Alice Smith",
		Text:           "Hello there!",
		IsOutgoing:     false,
		Status:         "sent",
		SentAt:         now,
	}

	if err := db.SaveMessage(msg); err != nil {
		t.Fatalf("SaveMessage failed: %v", err)
	}

	msgs, err := db.GetMessages("conv-1", 10, 0)
	if err != nil {
		t.Fatalf("GetMessages failed: %v", err)
	}
	if len(msgs) != 1 {
		t.Fatalf("expected 1 message, got %d", len(msgs))
	}
	if msgs[0].Text != "Hello there!" {
		t.Errorf("expected text 'Hello there!', got '%s'", msgs[0].Text)
	}

	reaction := &Reaction{
		ID:           "react-1",
		MessageID:    "msg-1",
		UserID:       "self",
		ReactionType: "heart",
	}
	if err := db.AddReaction(reaction); err != nil {
		t.Fatalf("AddReaction failed: %v", err)
	}

	reactions, err := db.GetReactions("msg-1")
	if err != nil {
		t.Fatalf("GetReactions failed: %v", err)
	}
	if len(reactions) != 1 || reactions[0].ReactionType != "heart" {
		t.Fatalf("unexpected reactions: %+v", reactions)
	}

	if err := db.MarkAsRead("conv-1"); err != nil {
		t.Fatalf("MarkAsRead failed: %v", err)
	}

	updatedConv, err := db.GetConversation("conv-1")
	if err != nil {
		t.Fatalf("GetConversation failed: %v", err)
	}
	if updatedConv.UnreadCount != 0 {
		t.Errorf("expected unread count to be 0, got %d", updatedConv.UnreadCount)
	}

	results, err := db.Search("Alice", 10)
	if err != nil {
		t.Fatalf("Search failed: %v", err)
	}
	if len(results) == 0 {
		t.Errorf("expected search results for 'Alice'")
	}
}
