package com.performx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "admins")
public class Admin {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "admin_id")
    public Long id;
    @OneToOne(optional = false) @JoinColumn(name = "user_id", unique = true)
    public User user;
}
