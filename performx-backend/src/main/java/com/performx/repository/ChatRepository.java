package com.performx.repository;

import com.performx.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;

public interface ChatRepository extends JpaRepository<Chat, Long> {
    List<Chat> findByDeletedFalseOrderByCreatedAtDesc();
    @Query("select c from Chat c where c.deleted = false and (c.sender.id = ?1 or c.receiver.id = ?1) order by c.createdAt desc")
    List<Chat> findForUser(Long userId);
}
