package com.performx.repository;

import com.performx.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PerformanceRepository extends JpaRepository<Performance, Long> {
    List<Performance> findByEmployeeIdOrderByReviewDateAsc(Long employeeId);
    List<Performance> findBySupervisorIdOrderByReviewDateDesc(Long supervisorId);
}
