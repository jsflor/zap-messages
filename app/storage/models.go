package storage

import "time"

type Conversation struct {
	ID              string        `json:"id"`
	Title           string        `json:"title"`
	IsGroup         bool          `json:"isGroup"`
	IsPinned        bool          `json:"isPinned"`
	LastMessageText string        `json:"lastMessageText"`
	LastMessageAt   *time.Time    `json:"lastMessageAt"`
	UnreadCount     int           `json:"unreadCount"`
	CreatedAt       time.Time     `json:"createdAt"`
	UpdatedAt       time.Time     `json:"updatedAt"`
	Participants    []Participant `json:"participants"`
}

type Participant struct {
	ID             string  `json:"id"`
	ConversationID string  `json:"conversationId"`
	UserID         string  `json:"userId"`
	Name           string  `json:"name"`
	AvatarURL      *string `json:"avatarUrl,omitempty"`
	PhoneNumber    *string `json:"phoneNumber,omitempty"`
	Email          *string `json:"email,omitempty"`
	IsSelf         bool    `json:"isSelf"`
}

type Message struct {
	ID             string     `json:"id"`
	ConversationID string     `json:"conversationId"`
	SenderID       string     `json:"senderId"`
	SenderName     string     `json:"senderName"`
	Text           string     `json:"text"`
	IsOutgoing     bool       `json:"isOutgoing"`
	Status         string     `json:"status"` // pending, sent, delivered, read, failed
	SentAt         time.Time  `json:"sentAt"`
	DeliveredAt    *time.Time `json:"deliveredAt,omitempty"`
	ReadAt         *time.Time `json:"readAt,omitempty"`
	Reactions      []Reaction `json:"reactions"`
}

type Reaction struct {
	ID           string    `json:"id"`
	MessageID    string    `json:"messageId"`
	UserID       string    `json:"userId"`
	ReactionType string    `json:"reactionType"` // heart, like, dislike, laugh, emphasize, question
	CreatedAt    time.Time `json:"createdAt"`
}
