package storage

import (
	"database/sql"
	"fmt"
	"time"
)

func (s *DB) GetConversations() ([]Conversation, error) {
	query := `SELECT id, title, is_group, is_pinned, last_message_text, last_message_at, unread_count, created_at, updated_at
		FROM conversations
		ORDER BY is_pinned DESC, last_message_at DESC, updated_at DESC`

	rows, err := s.conn.Query(query)
	if err != nil {
		return nil, fmt.Errorf("failed to query conversations: %w", err)
	}
	defer rows.Close()

	var convs []Conversation
	for rows.Next() {
		var c Conversation
		var lastMsgAt sql.NullTime
		if err := rows.Scan(&c.ID, &c.Title, &c.IsGroup, &c.IsPinned, &c.LastMessageText, &lastMsgAt, &c.UnreadCount, &c.CreatedAt, &c.UpdatedAt); err != nil {
			return nil, fmt.Errorf("failed to scan conversation: %w", err)
		}
		if lastMsgAt.Valid {
			c.LastMessageAt = &lastMsgAt.Time
		}
		convs = append(convs, c)
	}

	for i := range convs {
		participants, err := s.GetParticipants(convs[i].ID)
		if err == nil {
			convs[i].Participants = participants
		}
	}

	return convs, nil
}

func (s *DB) GetConversation(id string) (*Conversation, error) {
	query := `SELECT id, title, is_group, is_pinned, last_message_text, last_message_at, unread_count, created_at, updated_at
		FROM conversations WHERE id = ?`

	var c Conversation
	var lastMsgAt sql.NullTime
	err := s.conn.QueryRow(query, id).Scan(&c.ID, &c.Title, &c.IsGroup, &c.IsPinned, &c.LastMessageText, &lastMsgAt, &c.UnreadCount, &c.CreatedAt, &c.UpdatedAt)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get conversation: %w", err)
	}
	if lastMsgAt.Valid {
		c.LastMessageAt = &lastMsgAt.Time
	}

	participants, err := s.GetParticipants(c.ID)
	if err == nil {
		c.Participants = participants
	}

	return &c, nil
}

func (s *DB) SaveConversation(c *Conversation) error {
	now := time.Now()
	if c.CreatedAt.IsZero() {
		c.CreatedAt = now
	}
	c.UpdatedAt = now

	query := `INSERT INTO conversations (id, title, is_group, is_pinned, last_message_text, last_message_at, unread_count, created_at, updated_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			title = excluded.title,
			is_group = excluded.is_group,
			is_pinned = excluded.is_pinned,
			last_message_text = excluded.last_message_text,
			last_message_at = excluded.last_message_at,
			unread_count = excluded.unread_count,
			updated_at = excluded.updated_at`

	_, err := s.conn.Exec(query, c.ID, c.Title, c.IsGroup, c.IsPinned, c.LastMessageText, c.LastMessageAt, c.UnreadCount, c.CreatedAt, c.UpdatedAt)
	if err != nil {
		return fmt.Errorf("failed to save conversation: %w", err)
	}

	for _, p := range c.Participants {
		p.ConversationID = c.ID
		_ = s.SaveParticipant(&p)
	}

	return nil
}

func (s *DB) SetPinned(id string, isPinned bool) error {
	query := `UPDATE conversations SET is_pinned = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`
	_, err := s.conn.Exec(query, isPinned, id)
	return err
}

func (s *DB) MarkAsRead(conversationID string) error {
	tx, err := s.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if _, err := tx.Exec(`UPDATE conversations SET unread_count = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, conversationID); err != nil {
		return err
	}

	if _, err := tx.Exec(`UPDATE messages SET status = 'read', read_at = CURRENT_TIMESTAMP WHERE conversation_id = ? AND is_outgoing = 0 AND read_at IS NULL`, conversationID); err != nil {
		return err
	}

	return tx.Commit()
}

func (s *DB) GetParticipants(conversationID string) ([]Participant, error) {
	query := `SELECT id, conversation_id, user_id, name, avatar_url, phone_number, email, is_self
		FROM participants WHERE conversation_id = ?`

	rows, err := s.conn.Query(query, conversationID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var list []Participant
	for rows.Next() {
		var p Participant
		var avatar, phone, email sql.NullString
		if err := rows.Scan(&p.ID, &p.ConversationID, &p.UserID, &p.Name, &avatar, &phone, &email, &p.IsSelf); err != nil {
			return nil, err
		}
		if avatar.Valid {
			p.AvatarURL = &avatar.String
		}
		if phone.Valid {
			p.PhoneNumber = &phone.String
		}
		if email.Valid {
			p.Email = &email.String
		}
		list = append(list, p)
	}

	return list, nil
}

func (s *DB) SaveParticipant(p *Participant) error {
	query := `INSERT INTO participants (id, conversation_id, user_id, name, avatar_url, phone_number, email, is_self)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			name = excluded.name,
			avatar_url = excluded.avatar_url,
			phone_number = excluded.phone_number,
			email = excluded.email,
			is_self = excluded.is_self`

	_, err := s.conn.Exec(query, p.ID, p.ConversationID, p.UserID, p.Name, p.AvatarURL, p.PhoneNumber, p.Email, p.IsSelf)
	return err
}

func (s *DB) GetMessages(conversationID string, limit, offset int) ([]Message, error) {
	if limit <= 0 {
		limit = 50
	}
	query := `SELECT id, conversation_id, sender_id, sender_name, text, is_outgoing, status, sent_at, delivered_at, read_at
		FROM messages
		WHERE conversation_id = ?
		ORDER BY sent_at ASC
		LIMIT ? OFFSET ?`

	rows, err := s.conn.Query(query, conversationID, limit, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to query messages: %w", err)
	}
	defer rows.Close()

	var msgs []Message
	for rows.Next() {
		var m Message
		var delAt, readAt sql.NullTime
		if err := rows.Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.SenderName, &m.Text, &m.IsOutgoing, &m.Status, &m.SentAt, &delAt, &readAt); err != nil {
			return nil, fmt.Errorf("failed to scan message: %w", err)
		}
		if delAt.Valid {
			m.DeliveredAt = &delAt.Time
		}
		if readAt.Valid {
			m.ReadAt = &readAt.Time
		}
		msgs = append(msgs, m)
	}

	for i := range msgs {
		reactions, err := s.GetReactions(msgs[i].ID)
		if err == nil {
			msgs[i].Reactions = reactions
		}
	}

	return msgs, nil
}

func (s *DB) SaveMessage(m *Message) error {
	now := time.Now()
	if m.SentAt.IsZero() {
		m.SentAt = now
	}

	tx, err := s.conn.Begin()
	if err != nil {
		return err
	}
	defer tx.Rollback()

	query := `INSERT INTO messages (id, conversation_id, sender_id, sender_name, text, is_outgoing, status, sent_at, delivered_at, read_at)
		VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		ON CONFLICT(id) DO UPDATE SET
			status = excluded.status,
			delivered_at = excluded.delivered_at,
			read_at = excluded.read_at`

	_, err = tx.Exec(query, m.ID, m.ConversationID, m.SenderID, m.SenderName, m.Text, m.IsOutgoing, m.Status, m.SentAt, m.DeliveredAt, m.ReadAt)
	if err != nil {
		return fmt.Errorf("failed to insert message: %w", err)
	}

	unreadIncrement := 0
	if !m.IsOutgoing {
		unreadIncrement = 1
	}

	updateConvQuery := `UPDATE conversations SET
		last_message_text = ?,
		last_message_at = ?,
		unread_count = unread_count + ?,
		updated_at = CURRENT_TIMESTAMP
		WHERE id = ?`

	_, err = tx.Exec(updateConvQuery, m.Text, m.SentAt, unreadIncrement, m.ConversationID)
	if err != nil {
		return fmt.Errorf("failed to update conversation last message: %w", err)
	}

	return tx.Commit()
}

func (s *DB) GetReactions(messageID string) ([]Reaction, error) {
	query := `SELECT id, message_id, user_id, reaction_type, created_at FROM reactions WHERE message_id = ?`
	rows, err := s.conn.Query(query, messageID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var reactions []Reaction
	for rows.Next() {
		var r Reaction
		if err := rows.Scan(&r.ID, &r.MessageID, &r.UserID, &r.ReactionType, &r.CreatedAt); err != nil {
			return nil, err
		}
		reactions = append(reactions, r)
	}
	return reactions, nil
}

func (s *DB) AddReaction(r *Reaction) error {
	if r.CreatedAt.IsZero() {
		r.CreatedAt = time.Now()
	}
	query := `INSERT INTO reactions (id, message_id, user_id, reaction_type, created_at)
		VALUES (?, ?, ?, ?, ?)
		ON CONFLICT(message_id, user_id, reaction_type) DO NOTHING`
	_, err := s.conn.Exec(query, r.ID, r.MessageID, r.UserID, r.ReactionType, r.CreatedAt)
	return err
}

func (s *DB) RemoveReaction(messageID, userID, reactionType string) error {
	query := `DELETE FROM reactions WHERE message_id = ? AND user_id = ? AND reaction_type = ?`
	_, err := s.conn.Exec(query, messageID, userID, reactionType)
	return err
}

func (s *DB) GetSyncCursor(key string) (string, error) {
	var val string
	err := s.conn.QueryRow(`SELECT value FROM sync_state WHERE key = ?`, key).Scan(&val)
	if err == sql.ErrNoRows {
		return "", nil
	}
	return val, err
}

func (s *DB) SetSyncCursor(key, value string) error {
	query := `INSERT INTO sync_state (key, value, updated_at) VALUES (?, ?, CURRENT_TIMESTAMP)
		ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP`
	_, err := s.conn.Exec(query, key, value)
	return err
}
