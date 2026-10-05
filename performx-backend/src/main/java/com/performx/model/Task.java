package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "tasks")
public class Task {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "task_id")
    public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "supervisor_id") public Supervisor supervisor;
    @ManyToOne(optional = false) @JoinColumn(name = "employee_id") public Employee employee;
    @Column(nullable = false) public String title;
    @Column(length = 2000) public String description;
    @Column(name = "assigned_date") public LocalDate assignedDate;
    @Column(name = "due_date") public LocalDate dueDate;
    @Enumerated(EnumType.STRING) public Entities.Priority priority;
    @Enumerated(EnumType.STRING) public Entities.TaskStatus status;
    @Column(name = "completed_at") public LocalDateTime completedAt;
    // Extensions required by the UI spec
    public int progress;
    @Column(name = "expected_result", length = 1000) public String expectedResult;
    @Column(name = "performance_weight") public int performanceWeight = 5;
    @Column(name = "employee_update", length = 2000) public String employeeUpdate;
    @Column(name = "supervisor_feedback", length = 2000) public String supervisorFeedback;
    public boolean reviewed;
}
