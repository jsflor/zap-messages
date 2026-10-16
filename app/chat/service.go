package chat

import (
	"fmt"
	"time"

	"zap-messages/app/storage"
	"zap-messages/app/sync"
)

type ChatService struct {
	db     *storage.DB
	client *sync.Client
}

func NewChatService(db *storage.DB, client *sync.Client) *ChatService {
	return &ChatService{
		db:     db,
		client: client,
	}
}

func (s *ChatService) GetConversations() ([]storage.Conversation, error) {
	return s.db.GetConversations()
}

func (s *ChatService) GetConversation(id string) (*storage.Conversation, error) {
	return s.db.GetConversation(id)
}

func (s *ChatService) GetMessages(conversationID string, limit, offset int) ([]storage.Message, error) {
	return s.db.GetMessages(conversationID, limit, offset)
}

func (s *ChatService) SendMessage(conversationID, text string) (*storage.Message, error) {
	msg := &storage.Message{
		ID:             fmt.Sprintf("msg-%d", time.Now().UnixNano()),
		ConversationID: conversationID,
		SenderID:       "self",
		SenderName:     "You",
		Text:           text,
		IsOutgoing:     true,
		Status:         "pending",
		SentAt:         time.Now(),
		Reactions:      []storage.Reaction{},
	}

	if err := s.db.SaveMessage(msg); err != nil {
		return nil, fmt.Errorf("failed to save message locally: %w", err)
	}

	// Dispatch to sync client if connected
	if s.client != nil && s.client.IsConnected() {
		if err := s.client.SendMessage(msg); err != nil {
			msg.Status = "pending"
		} else {
			msg.Status = "sent"
			_ = s.db.SaveMessage(msg)
		}
	}

	return msg, nil
}

func (s *ChatService) AddReaction(messageID, reactionType string) error {
	reaction := &storage.Reaction{
		ID:           fmt.Sprintf("react-%d", time.Now().UnixNano()),
		MessageID:    messageID,
		UserID:       "self",
		ReactionType: reactionType,
		CreatedAt:    time.Now(),
	}

	if err := s.db.AddReaction(reaction); err != nil {
		return err
	}

	if s.client != nil && s.client.IsConnected() {
		_ = s.client.SendReaction(reaction)
	}
	return nil
}

func (s *ChatService) RemoveReaction(messageID, reactionType string) error {
	if err := s.db.RemoveReaction(messageID, "self", reactionType); err != nil {
		return err
	}
	if s.client != nil && s.client.IsConnected() {
		_ = s.client.SendRemoveReaction(messageID, reactionType)
	}
	return nil
}

func (s *ChatService) SetPinned(conversationID string, isPinned bool) error {
	return s.db.SetPinned(conversationID, isPinned)
}

func (s *ChatService) MarkAsRead(conversationID string) error {
	if err := s.db.MarkAsRead(conversationID); err != nil {
		return err
	}
	if s.client != nil && s.client.IsConnected() {
		_ = s.client.SendReadReceipt(conversationID)
	}
	return nil
}

func (s *ChatService) Search(query string, limit int) ([]storage.SearchResult, error) {
	return s.db.Search(query, limit)
}

func (s *ChatService) ConnectSync(serverURL, token string) error {
	if s.client == nil {
		return fmt.Errorf("sync client not initialized")
	}
	return s.client.Connect(serverURL, token)
}
