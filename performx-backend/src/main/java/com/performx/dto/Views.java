package com.performx.dto;

import com.performx.model.*;

import java.time.Duration;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/** Entity → JSON view mappers. Never expose password hashes or raw entity graphs. */
public final class Views {
    private Views() {}

    public static Map<String, Object> user(User u) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", u.id);
        m.put("name", u.name);
        m.put("email", u.email);
        m.put("employeeCode", u.employeeCode);
        m.put("role", u.role);
        m.put("department", u.department);
        m.put("phone", u.phone);
        m.put("active", u.active);
        m.put("createdAt", u.createdAt);
        return m;
    }

    public static Map<String, Object> task(Task t) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", t.id);
        m.put("title", t.title);
        m.put("description", t.description);
        m.put("employeeId", t.employee.id);
        m.put("employeeName", t.employee.user.name);
        m.put("supervisorId", t.supervisor.id);
        m.put("supervisorName", t.supervisor.user.name);
        m.put("assignedDate", t.assignedDate);
        m.put("dueDate", t.dueDate);
        m.put("priority", t.priority);
        m.put("status", effectiveStatus(t));
        m.put("progress", t.progress);
        m.put("expectedResult", t.expectedResult);
        m.put("performanceWeight", t.performanceWeight);
        m.put("employeeUpdate", t.employeeUpdate);
        m.put("supervisorFeedback", t.supervisorFeedback);
        m.put("reviewed", t.reviewed);
        m.put("completedAt", t.completedAt);
        return m;
    }

    /** Overdue is derived: past due and not completed. */
    public static Entities.TaskStatus effectiveStatus(Task t) {
        if (t.status != Entities.TaskStatus.COMPLETED && t.dueDate != null && t.dueDate.isBefore(LocalDate.now()))
            return Entities.TaskStatus.OVERDUE;
        return t.status;
    }

    public static Map<String, Object> log(LoginLog l) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", l.id);
        m.put("userId", l.user.id);
        m.put("userName", l.user.name);
        m.put("role", l.user.role);
        m.put("department", l.user.department);
        m.put("loginTime", l.loginTime);
        m.put("logoutTime", l.logoutTime);
        Long mins = (l.loginTime != null && l.logoutTime != null) ? Duration.between(l.loginTime, l.logoutTime).toMinutes() : null;
        m.put("sessionMinutes", mins);
        m.put("device", l.device);
        m.put("ipAddress", l.ipAddress);
        m.put("status", l.status);
        return m;
    }

    public static Map<String, Object> message(Message msg) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", msg.id);
        m.put("chatId", msg.chat.id);
        m.put("senderId", msg.sender.id);
        m.put("senderName", msg.sender.name);
        m.put("senderRole", msg.sender.role);
        m.put("text", msg.messageText);
        m.put("sentAt", msg.sentAt);
        m.put("read", msg.read);
        return m;
    }

    public static Map<String, Object> chat(Chat c, List<Message> msgs, Long viewerId) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", c.id);
        m.put("sender", user(c.sender));
        m.put("receiver", user(c.receiver));
        m.put("createdAt", c.createdAt);
        Message last = msgs.isEmpty() ? null : msgs.get(msgs.size() - 1);
        m.put("lastMessage", last == null ? null : last.messageText);
        m.put("lastAt", last == null ? c.createdAt : last.sentAt);
        m.put("messageCount", msgs.size());
        m.put("unread", viewerId == null ? 0 : msgs.stream().filter(x -> !x.read && !x.sender.id.equals(viewerId)).count());
        return m;
    }

    public static Map<String, Object> performance(Performance p) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", p.id);
        m.put("employeeId", p.employee.id);
        m.put("employeeName", p.employee.user.name);
        m.put("supervisorName", p.supervisor.user.name);
        m.put("reviewPeriod", p.reviewPeriod);
        m.put("productivityScore", p.productivityScore);
        m.put("qualityScore", p.qualityScore);
        m.put("attendanceScore", p.attendanceScore);
        m.put("overallScore", p.overallScore);
        m.put("comments", p.comments);
        m.put("performanceArea", p.performanceArea);
        m.put("rating", p.rating);
        m.put("reviewDate", p.reviewDate);
        return m;
    }
}
