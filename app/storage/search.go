package storage

type SearchResult struct {
	Type           string `json:"type"` // "conversation" or "message"
	ConversationID string `json:"conversationId"`
	Title          string `json:"title"`
	Snippet        string `json:"snippet"`
	SentAt         string `json:"sentAt"`
}

func (s *DB) Search(query string, limit int) ([]SearchResult, error) {
	if limit <= 0 {
		limit = 20
	}
	likePattern := "%" + query + "%"

	var results []SearchResult

	// 1. Search conversations and participants by name or title
	convQuery := `SELECT DISTINCT c.id, c.title, c.last_message_text, coalesce(c.last_message_at, c.updated_at)
		FROM conversations c
		LEFT JOIN participants p ON p.conversation_id = c.id
		WHERE c.title LIKE ? OR p.name LIKE ? OR p.phone_number LIKE ? OR p.email LIKE ?
		ORDER BY c.last_message_at DESC
		LIMIT ?`

	convRows, err := s.conn.Query(convQuery, likePattern, likePattern, likePattern, likePattern, limit)
	if err == nil {
		defer convRows.Close()
		for convRows.Next() {
			var r SearchResult
			r.Type = "conversation"
			var sentAt string
			if err := convRows.Scan(&r.ConversationID, &r.Title, &r.Snippet, &sentAt); err == nil {
				r.SentAt = sentAt
				results = append(results, r)
			}
		}
	}

	// 2. Search message text
	msgQuery := `SELECT m.conversation_id, c.title, m.text, m.sent_at
		FROM messages m
		JOIN conversations c ON c.id = m.conversation_id
		WHERE m.text LIKE ?
		ORDER BY m.sent_at DESC
		LIMIT ?`

	msgRows, err := s.conn.Query(msgQuery, likePattern, limit)
	if err == nil {
		defer msgRows.Close()
		for msgRows.Next() {
			var r SearchResult
			r.Type = "message"
			var sentAt string
			if err := msgRows.Scan(&r.ConversationID, &r.Title, &r.Snippet, &sentAt); err == nil {
				r.SentAt = sentAt
				results = append(results, r)
			}
		}
	}

	if len(results) > limit {
		results = results[:limit]
	}

	return results, nil
}
