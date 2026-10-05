package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "chats")
public class Chat {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "chat_id")
    public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "sender_id") public User sender;
    @ManyToOne(optional = false) @JoinColumn(name = "receiver_id") public User receiver;
    @Column(name = "created_at") public LocalDateTime createdAt = LocalDateTime.now();
    public boolean deleted;
}
