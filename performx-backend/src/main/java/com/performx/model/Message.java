package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "messages")
public class Message {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "message_id")
    public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "chat_id") public Chat chat;
    @ManyToOne(optional = false) @JoinColumn(name = "sender_id") public User sender;
    @Column(name = "message_text", length = 4000, nullable = false) public String messageText;
    @Column(name = "sent_at") public LocalDateTime sentAt = LocalDateTime.now();
    @Column(name = "is_read") public boolean read;
    public boolean deleted;
}
