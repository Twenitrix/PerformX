package com.performx.model;

import jakarta.persistence.*;

@Entity
@Table(name = "supervisors")
public class Supervisor {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "supervisor_id")
    public Long id;
    @OneToOne(optional = false) @JoinColumn(name = "user_id", unique = true)
    public User user;
    public String department;
}
