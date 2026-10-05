package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "login_logs")
public class LoginLog {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "log_id")
    public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "user_id") public User user;
    @Column(name = "login_time") public LocalDateTime loginTime;
    @Column(name = "logout_time") public LocalDateTime logoutTime;
    @Column(name = "ip_address") public String ipAddress;
    public String device;
    @Enumerated(EnumType.STRING) public Entities.LogStatus status;
}
