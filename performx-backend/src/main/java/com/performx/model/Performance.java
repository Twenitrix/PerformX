package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "performance")
public class Performance {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) @Column(name = "performance_id")
    public Long id;
    @ManyToOne(optional = false) @JoinColumn(name = "employee_id") public Employee employee;
    @ManyToOne(optional = false) @JoinColumn(name = "supervisor_id") public Supervisor supervisor;
    @Column(name = "review_period") public String reviewPeriod;
    @Column(name = "productivity_score") public double productivityScore;
    @Column(name = "quality_score") public double qualityScore;
    @Column(name = "attendance_score") public double attendanceScore;
    @Column(name = "overall_score") public double overallScore;
    @Column(length = 2000) public String comments;
    @Column(name = "performance_area") public String performanceArea;
    public int rating;
    @Column(name = "review_date") public LocalDate reviewDate;
}
