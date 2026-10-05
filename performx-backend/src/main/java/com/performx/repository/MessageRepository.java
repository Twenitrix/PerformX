package com.performx.repository;

import com.performx.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MessageRepository extends JpaRepository<Message, Long> {
    List<Message> findByChatIdAndDeletedFalseOrderBySentAtAsc(Long chatId);
}
