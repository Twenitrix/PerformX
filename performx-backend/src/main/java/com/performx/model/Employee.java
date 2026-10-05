package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "employees")
public class Employee {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "employee_id")
    public Long id;
    @OneToOne(optional = false) @JoinColumn(name = "user_id", unique = true)
    public User user;
    /** SUPERVISOR manages EMPLOYEE (1:N) */
    @ManyToOne @JoinColumn(name = "supervisor_id")
    public Supervisor supervisor;
    @Column(name = "joining_date") public LocalDate joiningDate;
    public String designation;
}
