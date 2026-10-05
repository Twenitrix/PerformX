package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "users")
public class User {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "user_id")
    public Long id;
    @Column(nullable = false) public String name;
    @Column(nullable = false, unique = true) public String email;
    @Column(name = "employee_code", unique = true) public String employeeCode;
    @Column(nullable = false) public String password;
    @Enumerated(EnumType.STRING) @Column(nullable = false) public Entities.Role role;
    public String department;
    public String phone;
    public boolean active = true;
    @Column(name = "created_at") public LocalDateTime createdAt = LocalDateTime.now();
}
