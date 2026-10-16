package sync

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"sync"
	"time"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"github.com/wailsapp/wails/v3/pkg/application"

	"zap-messages/app/storage"
)

type EventType string

const (
	EventNewMessage     EventType = "msg:new"
	EventMessageStatus  EventType = "msg:status"
	EventTyping         EventType = "msg:typing"
	EventAddReaction    EventType = "react:add"
	EventRemoveReaction EventType = "react:remove"
	EventSyncDelta      EventType = "sync:delta"
)

type Envelope struct {
	Type      EventType       `json:"type"`
	Payload   json.RawMessage `json:"payload"`
	Timestamp time.Time       `json:"timestamp"`
}

type Client struct {
	db          *storage.DB
	conn        *websocket.Conn
	mu          sync.RWMutex
	isConnected bool
	serverURL   string
	token       string
	ctx         context.Context
	cancel      context.CancelFunc
}

func NewClient(db *storage.DB) *Client {
	ctx, cancel := context.WithCancel(context.Background())
	return &Client{
		db:     db,
		ctx:    ctx,
		cancel: cancel,
	}
}

func (c *Client) IsConnected() bool {
	c.mu.RLock()
	defer c.mu.RUnlock()
	return c.isConnected
}

func (c *Client) Connect(serverURL, token string) error {
	c.mu.Lock()
	c.serverURL = serverURL
	c.token = token
	c.mu.Unlock()

	return c.connectWithRetry()
}

func (c *Client) connectWithRetry() error {
	c.mu.Lock()
	url := c.serverURL
	c.mu.Unlock()

	if url == "" {
		return fmt.Errorf("server url is required")
	}

	go func() {
		delay := 1 * time.Second
		maxDelay := 30 * time.Second

		for {
			select {
			case <-c.ctx.Done():
				return
			default:
			}

			ctx, cancel := context.WithTimeout(c.ctx, 10*time.Second)
			conn, _, err := websocket.Dial(ctx, url, nil)
			cancel()

			if err == nil {
				c.mu.Lock()
				c.conn = conn
				c.isConnected = true
				c.mu.Unlock()

				log.Printf("[Sync] Connected to %s", url)
				application.Get().Event.Emit("sync:connected", true)

				// Flush pending messages and sync cursor
				_ = c.flushPendingMessages()
				_ = c.syncDelta()

				// Read loop blocks until disconnect
				c.readLoop(conn)

				c.mu.Lock()
				c.isConnected = false
				c.conn = nil
				c.mu.Unlock()

				application.Get().Event.Emit("sync:connected", false)
				log.Printf("[Sync] Disconnected from server")
				delay = 1 * time.Second
			} else {
				log.Printf("[Sync] Connection failed: %v. Retrying in %v...", err, delay)
			}

			time.Sleep(delay)
			delay *= 2
			if delay > maxDelay {
				delay = maxDelay
			}
		}
	}()

	return nil
}

func (c *Client) readLoop(conn *websocket.Conn) {
	for {
		var env Envelope
		err := wsjson.Read(c.ctx, conn, &env)
		if err != nil {
			break
		}

		c.handleIncomingEnvelope(&env)
	}
}

func (c *Client) handleIncomingEnvelope(env *Envelope) {
	switch env.Type {
	case EventNewMessage:
		var msg storage.Message
		if err := json.Unmarshal(env.Payload, &msg); err == nil {
			msg.IsOutgoing = false
			_ = c.db.SaveMessage(&msg)
			application.Get().Event.Emit("msg:received", msg)
		}
	case EventMessageStatus:
		var status struct {
			MessageID string `json:"messageId"`
			Status    string `json:"status"`
		}
		if err := json.Unmarshal(env.Payload, &status); err == nil {
			application.Get().Event.Emit("msg:status_updated", status)
		}
	case EventTyping:
		var typing struct {
			ConversationID string `json:"conversationId"`
			UserID         string `json:"userId"`
			IsTyping       bool   `json:"isTyping"`
		}
		if err := json.Unmarshal(env.Payload, &typing); err == nil {
			application.Get().Event.Emit("msg:typing", typing)
		}
	case EventAddReaction:
		var reaction storage.Reaction
		if err := json.Unmarshal(env.Payload, &reaction); err == nil {
			_ = c.db.AddReaction(&reaction)
			application.Get().Event.Emit("react:added", reaction)
		}
	case EventRemoveReaction:
		var remove struct {
			MessageID    string `json:"messageId"`
			UserID       string `json:"userId"`
			ReactionType string `json:"reactionType"`
		}
		if err := json.Unmarshal(env.Payload, &remove); err == nil {
			_ = c.db.RemoveReaction(remove.MessageID, remove.UserID, remove.ReactionType)
			application.Get().Event.Emit("react:removed", remove)
		}
	}
}

func (c *Client) SendMessage(msg *storage.Message) error {
	c.mu.RLock()
	conn := c.conn
	connected := c.isConnected
	c.mu.RUnlock()

	if !connected || conn == nil {
		return fmt.Errorf("sync client not connected")
	}

	payload, err := json.Marshal(msg)
	if err != nil {
		return err
	}

	env := Envelope{
		Type:      EventNewMessage,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	ctx, cancel := context.WithTimeout(c.ctx, 5*time.Second)
	defer cancel()

	return wsjson.Write(ctx, conn, env)
}

func (c *Client) SendReaction(r *storage.Reaction) error {
	return c.sendEnvelope(EventAddReaction, r)
}

func (c *Client) SendRemoveReaction(messageID, reactionType string) error {
	payload := map[string]string{
		"messageId":    messageID,
		"reactionType": reactionType,
	}
	return c.sendEnvelope(EventRemoveReaction, payload)
}

func (c *Client) SendReadReceipt(conversationID string) error {
	payload := map[string]string{
		"conversationId": conversationID,
	}
	return c.sendEnvelope(EventMessageStatus, payload)
}

func (c *Client) sendEnvelope(eventType EventType, data any) error {
	c.mu.RLock()
	conn := c.conn
	connected := c.isConnected
	c.mu.RUnlock()

	if !connected || conn == nil {
		return nil
	}

	payload, err := json.Marshal(data)
	if err != nil {
		return err
	}

	env := Envelope{
		Type:      eventType,
		Payload:   payload,
		Timestamp: time.Now(),
	}

	ctx, cancel := context.WithTimeout(c.ctx, 5*time.Second)
	defer cancel()

	return wsjson.Write(ctx, conn, env)
}

func (c *Client) flushPendingMessages() error {
	// Query messages with status = 'pending' and send them
	rows, err := c.db.Conn().Query(`SELECT id, conversation_id, sender_id, sender_name, text, is_outgoing, status, sent_at
		FROM messages WHERE status = 'pending' ORDER BY sent_at ASC`)
	if err != nil {
		return err
	}
	defer rows.Close()

	for rows.Next() {
		var m storage.Message
		if err := rows.Scan(&m.ID, &m.ConversationID, &m.SenderID, &m.SenderName, &m.Text, &m.IsOutgoing, &m.Status, &m.SentAt); err == nil {
			if err := c.SendMessage(&m); err == nil {
				m.Status = "sent"
				_ = c.db.SaveMessage(&m)
			}
		}
	}
	return nil
}

func (c *Client) syncDelta() error {
	cursor, err := c.db.GetSyncCursor("last_sync_timestamp")
	if err != nil {
		return err
	}

	return c.sendEnvelope(EventSyncDelta, map[string]string{"cursor": cursor})
}

func (c *Client) Close() error {
	c.cancel()
	c.mu.Lock()
	defer c.mu.Unlock()
	if c.conn != nil {
		return c.conn.Close(websocket.StatusNormalClosure, "client closing")
	}
	return nil
}
