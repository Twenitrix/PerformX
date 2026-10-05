package com.performx.service;

import com.performx.common.Api.ApiException;
import com.performx.dto.Requests;
import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import com.performx.security.AuthUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Chat access rules:
 *  - ADMIN: read every conversation, may remove (soft-delete) conversations. Does not send.
 *  - SUPERVISOR: conversations where they or one of their team members participate. Send only to own team. No delete.
 *  - EMPLOYEE: only own conversations. Send only to assigned supervisor. No delete.
 */
@Service
public class ChatService {
    private final ChatRepository chats;
    private final MessageRepository messages;
    private final UserRepository users;
    private final ScopeService scope;

    public ChatService(ChatRepository chats, MessageRepository messages, UserRepository users, ScopeService scope) {
        this.chats = chats;
        this.messages = messages;
        this.users = users;
        this.scope = scope;
    }

    private Set<Long> visibleUserIds(AuthUser a) {
        if ("SUPERVISOR".equals(a.role())) {
            Set<Long> ids = scope.team(scope.supervisor(a)).stream().map(e -> e.user.id).collect(Collectors.toSet());
            ids.add(a.userId());
            return ids;
        }
        return Set.of(a.userId());
    }

    private boolean canSee(AuthUser a, Chat c) {
        if (c.deleted) return false;
        if ("ADMIN".equals(a.role())) return true;
        if ("EMPLOYEE".equals(a.role())) return c.sender.id.equals(a.userId()) || c.receiver.id.equals(a.userId());
        Set<Long> ids = visibleUserIds(a);
        return ids.contains(c.sender.id) && ids.contains(c.receiver.id)
                || c.sender.id.equals(a.userId()) || c.receiver.id.equals(a.userId());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(AuthUser a) {
        List<Chat> src = "ADMIN".equals(a.role()) ? chats.findByDeletedFalseOrderByCreatedAtDesc()
                : chats.findByDeletedFalseOrderByCreatedAtDesc().stream().filter(c -> canSee(a, c)).toList();
        Long viewer = "ADMIN".equals(a.role()) ? null : a.userId();
        List<Map<String, Object>> out = new ArrayList<>();
        for (Chat c : src) out.add(Views.chat(c, messages.findByChatIdAndDeletedFalseOrderBySentAtAsc(c.id), viewer));
        out.sort((x, y) -> ((LocalDateTime) y.get("lastAt")).compareTo((LocalDateTime) x.get("lastAt")));
        return out;
    }

    @Transactional
    public List<Map<String, Object>> messages(AuthUser a, Long chatId) {
        Chat c = chats.findById(chatId).orElseThrow(() -> ApiException.notFound("Conversation"));
        if (!canSee(a, c)) throw ApiException.forbidden();
        List<Message> ms = messages.findByChatIdAndDeletedFalseOrderBySentAtAsc(chatId);
        boolean participant = c.sender.id.equals(a.userId()) || c.receiver.id.equals(a.userId());
        if (participant) ms.stream().filter(m -> !m.sender.id.equals(a.userId())).forEach(m -> m.read = true);
        return ms.stream().map(Views::message).toList();
    }

    @Transactional
    public Map<String, Object> send(AuthUser a, Requests.SendMessage req) {
        if ("ADMIN".equals(a.role())) throw new ApiException(HttpStatus.FORBIDDEN, "Admins monitor chats in read-only mode");
        User me = scope.user(a);
        Chat chat;
        if (req.chatId() != null) {
            chat = chats.findById(req.chatId()).orElseThrow(() -> ApiException.notFound("Conversation"));
            if (chat.deleted || !(chat.sender.id.equals(me.id) || chat.receiver.id.equals(me.id))) throw ApiException.forbidden();
        } else {
            if (req.receiverId() == null) throw ApiException.bad("receiverId or chatId required");
            User other = users.findById(req.receiverId()).orElseThrow(() -> ApiException.notFound("Recipient"));
            assertCanMessage(a, other);
            chat = chats.findForUser(me.id).stream()
                    .filter(c -> c.sender.id.equals(other.id) || c.receiver.id.equals(other.id)).findFirst()
                    .orElseGet(() -> {
                        Chat c = new Chat();
                        c.sender = me;
                        c.receiver = other;
                        return chats.save(c);
                    });
        }
        Message m = new Message();
        m.chat = chat;
        m.sender = me;
        m.messageText = req.text().trim();
        return Views.message(messages.save(m));
    }

    private void assertCanMessage(AuthUser a, User other) {
        if ("EMPLOYEE".equals(a.role())) {
            Employee e = scope.employee(a);
            if (e.supervisor == null || !e.supervisor.user.id.equals(other.id)) throw ApiException.forbidden();
        } else if ("SUPERVISOR".equals(a.role())) {
            if (!visibleUserIds(a).contains(other.id) || other.id.equals(a.userId())) throw ApiException.forbidden();
        }
    }

    /** ADMIN only — enforced at route level (/api/v1/admin/**) and here. */
    @Transactional
    public void remove(AuthUser a, Long chatId) {
        if (!"ADMIN".equals(a.role())) throw ApiException.forbidden();
        Chat c = chats.findById(chatId).orElseThrow(() -> ApiException.notFound("Conversation"));
        c.deleted = true;
        messages.findByChatIdAndDeletedFalseOrderBySentAtAsc(chatId).forEach(m -> m.deleted = true);
    }
}
