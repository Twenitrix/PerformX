package com.performx.repository;

import com.performx.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByEmployeeIdOrderByDueDateAsc(Long employeeId);
    List<Task> findBySupervisorIdOrderByDueDateAsc(Long supervisorId);
    long countByStatus(Entities.TaskStatus status);
}
