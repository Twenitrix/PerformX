package com.performx.repository;

import com.performx.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface LoginLogRepository extends JpaRepository<LoginLog, Long> {
    List<LoginLog> findAllByOrderByLoginTimeDesc();
    List<LoginLog> findByUserIdInOrderByLoginTimeDesc(Collection<Long> userIds);
    List<LoginLog> findByUserIdOrderByLoginTimeDesc(Long userId);
    long countByLoginTimeAfter(LocalDateTime t);
    long countByStatus(Entities.LogStatus s);
}
