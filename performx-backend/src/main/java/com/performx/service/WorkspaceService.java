package com.performx.service;

import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import com.performx.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/** Role-specific notifications and global search — both reuse the same scoping rules. */
@Service
public class WorkspaceService {
    private final ScopeService scope;
    private final TaskRepository tasks;
    private final PerformanceRepository performance;
    private final LoginLogRepository logs;
    private final UserRepository users;
    private final ChatService chats;

    public WorkspaceService(ScopeService scope, TaskRepository tasks, PerformanceRepository performance,
                            LoginLogRepository logs, UserRepository users, ChatService chats) {
        this.scope = scope; this.tasks = tasks; this.performance = performance; this.logs = logs;
        this.users = users; this.chats = chats;
    }

    private static Map<String, Object> n(String type, String text, LocalDateTime at, String link) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("id", type + "-" + Math.abs(Objects.hash(text, at)));
        m.put("type", type);
        m.put("text", text);
        m.put("at", at);
        m.put("link", link);
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> notifications(AuthUser a) {
        List<Map<String, Object>> out = new ArrayList<>();
        LocalDate today = LocalDate.now();
        switch (a.role()) {
            case "EMPLOYEE" -> {
                Employee e = scope.employee(a);
                for (Task t : tasks.findByEmployeeIdOrderByDueDateAsc(e.id)) {
                    if (!t.assignedDate.isBefore(today.minusDays(10)))
                        out.add(n("TASK", "Your supervisor assigned you a new task: " + t.title, t.assignedDate.atTime(9, 30), "/employee/tasks"));
                    if (t.status != Entities.TaskStatus.COMPLETED && t.dueDate.equals(today.plusDays(1)))
                        out.add(n("DEADLINE", "Task deadline is tomorrow: " + t.title, today.atStartOfDay(), "/employee/tasks"));
                    if (t.completedAt != null && t.completedAt.isAfter(LocalDateTime.now().minusDays(14)))
                        out.add(n("DONE", "Your task was marked as completed: " + t.title, t.completedAt, "/employee/tasks"));
                    if (t.supervisorFeedback != null && t.completedAt != null)
                        out.add(n("FEEDBACK", "New supervisor feedback received on " + t.title, t.completedAt.plusHours(3), "/employee/feedback"));
                }
                performance.findByEmployeeIdOrderByReviewDateAsc(e.id).stream().reduce((x, y) -> y).ifPresent(p ->
                        out.add(n("REVIEW", "Performance review updated (" + p.reviewPeriod + ")", p.reviewDate.atTime(16, 0), "/employee/performance")));
            }
            case "SUPERVISOR" -> {
                Supervisor s = scope.supervisor(a);
                for (Task t : tasks.findBySupervisorIdOrderByDueDateAsc(s.id)) {
                    if (t.status == Entities.TaskStatus.COMPLETED && !t.reviewed && t.completedAt != null)
                        out.add(n("DONE", t.employee.user.name + " completed \"" + t.title + "\" — awaiting review", t.completedAt, "/supervisor/tasks"));
                    if (Views.effectiveStatus(t) == Entities.TaskStatus.OVERDUE)
                        out.add(n("OVERDUE", "\"" + t.title + "\" assigned to " + t.employee.user.name + " is overdue", t.dueDate.plusDays(1).atStartOfDay(), "/supervisor/tasks"));
                }
            }
            default -> {
                logs.findAllByOrderByLoginTimeDesc().stream().filter(l -> l.status == Entities.LogStatus.FAILED).limit(5)
                        .forEach(l -> out.add(n("SECURITY", "Failed sign-in attempt for " + l.user.name + " from " + l.ipAddress, l.loginTime, "/admin/logs")));
                users.findAll().stream().filter(u -> !u.active)
                        .forEach(u -> out.add(n("ACCESS", u.name + "'s access is currently revoked", u.createdAt, "/admin/users")));
            }
        }
        logs.findByUserIdOrderByLoginTimeDesc(a.userId()).stream().skip(1).findFirst().ifPresent(l ->
                out.add(n("LOGIN", "New login detected on your account from " + l.device, l.loginTime, null)));
        out.removeIf(x -> ((LocalDateTime) x.get("at")).isAfter(LocalDateTime.now().plusDays(1)));
        out.sort((x, y) -> ((LocalDateTime) y.get("at")).compareTo((LocalDateTime) x.get("at")));
        return out.stream().limit(15).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> search(AuthUser a, String q) {
        String s = q == null ? "" : q.trim().toLowerCase();
        if (s.length() < 2) return List.of();
        List<Map<String, Object>> out = new ArrayList<>();
        switch (a.role()) {
            case "ADMIN" -> {
                users.findAll().stream().filter(u -> u.name.toLowerCase().contains(s) || u.email.contains(s)
                        || (u.employeeCode != null && u.employeeCode.toLowerCase().contains(s))).limit(8)
                        .forEach(u -> out.add(hit(u.role == Entities.Role.SUPERVISOR ? "Supervisor" : u.role == Entities.Role.ADMIN ? "Admin" : "Employee",
                                u.name, u.department + " · " + u.employeeCode, "/admin/users")));
                tasks.findAll().stream().filter(t -> t.title.toLowerCase().contains(s)).limit(6)
                        .forEach(t -> out.add(hit("Task", t.title, t.employee.user.name, "/admin/task-analytics")));
                logs.findAllByOrderByLoginTimeDesc().stream().filter(l -> l.user.name.toLowerCase().contains(s)).limit(4)
                        .forEach(l -> out.add(hit("Log", l.user.name + " · " + l.status, l.loginTime.toString().replace('T', ' ').substring(0, 16), "/admin/logs")));
            }
            case "SUPERVISOR" -> {
                scope.team(scope.supervisor(a)).stream().filter(e -> e.user.name.toLowerCase().contains(s)).limit(8)
                        .forEach(e -> out.add(hit("Team member", e.user.name, e.designation, "/supervisor/team")));
                tasks.findBySupervisorIdOrderByDueDateAsc(scope.supervisor(a).id).stream().filter(t -> t.title.toLowerCase().contains(s)).limit(8)
                        .forEach(t -> out.add(hit("Task", t.title, t.employee.user.name, "/supervisor/tasks")));
            }
            default -> {
                Employee e = scope.employee(a);
                tasks.findByEmployeeIdOrderByDueDateAsc(e.id).stream().filter(t -> t.title.toLowerCase().contains(s)).limit(8)
                        .forEach(t -> out.add(hit("Task", t.title, "Due " + t.dueDate, "/employee/tasks")));
                performance.findByEmployeeIdOrderByReviewDateAsc(e.id).stream()
                        .filter(p -> p.comments != null && p.comments.toLowerCase().contains(s)).limit(4)
                        .forEach(p -> out.add(hit("Feedback", p.reviewPeriod + " review", p.comments, "/employee/feedback")));
            }
        }
        String chatLink = switch (a.role()) { case "ADMIN" -> "/admin/chats"; case "SUPERVISOR" -> "/supervisor/chats"; default -> "/employee/chat"; };
        chats.list(a).stream().filter(c -> String.valueOf(c.get("lastMessage")).toLowerCase().contains(s)
                        || String.valueOf(((Map<?, ?>) c.get("sender")).get("name")).toLowerCase().contains(s)
                        || String.valueOf(((Map<?, ?>) c.get("receiver")).get("name")).toLowerCase().contains(s)).limit(4)
                .forEach(c -> out.add(hit("Chat", ((Map<?, ?>) c.get("sender")).get("name") + " ↔ " + ((Map<?, ?>) c.get("receiver")).get("name"),
                        String.valueOf(c.get("lastMessage")), chatLink)));
        return out;
    }

    private static Map<String, Object> hit(String kind, String title, String sub, String link) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("kind", kind);
        m.put("title", title);
        m.put("subtitle", sub);
        m.put("link", link);
        return m;
    }
}
