package com.performx.service;

import com.performx.common.Api.ApiException;
import com.performx.dto.Requests;
import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import com.performx.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;

/** Every query here is keyed on the caller's own employee record — no IDs of other employees are accepted. */
@Service
public class EmployeeService {
    private final ScopeService scope;
    private final TaskRepository tasks;
    private final PerformanceRepository performance;
    private final LoginLogRepository logs;

    public EmployeeService(ScopeService scope, TaskRepository tasks, PerformanceRepository performance, LoginLogRepository logs) {
        this.scope = scope; this.tasks = tasks; this.performance = performance; this.logs = logs;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(AuthUser a) {
        Employee e = scope.employee(a);
        Map<String, Object> m = new LinkedHashMap<>(scope.stats(e));
        List<Task> ts = tasks.findByEmployeeIdOrderByDueDateAsc(e.id);
        m.put("upcoming", ts.stream().filter(t -> t.status != Entities.TaskStatus.COMPLETED).limit(5).map(Views::task).toList());
        m.put("history", performance.findByEmployeeIdOrderByReviewDateAsc(e.id).stream().map(Views::performance).toList());
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> tasks(AuthUser a) {
        return tasks.findByEmployeeIdOrderByDueDateAsc(scope.employee(a).id).stream().map(Views::task).toList();
    }

    private Task ownTask(AuthUser a, Long id) {
        Task t = tasks.findById(id).orElseThrow(() -> ApiException.notFound("Task"));
        if (!t.employee.id.equals(scope.employee(a).id)) throw ApiException.forbidden();
        return t;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> task(AuthUser a, Long id) { return Views.task(ownTask(a, id)); }

    @Transactional
    public Map<String, Object> progress(AuthUser a, Long id, Requests.Progress r) {
        Task t = ownTask(a, id);
        if (t.status == Entities.TaskStatus.COMPLETED) throw ApiException.bad("Task is already completed");
        t.progress = r.progress();
        if (r.update() != null && !r.update().isBlank()) t.employeeUpdate = r.update().trim();
        if (r.progress() == 100) {
            t.status = Entities.TaskStatus.COMPLETED;
            t.completedAt = LocalDateTime.now();
        } else {
            t.status = r.progress() > 0 ? Entities.TaskStatus.IN_PROGRESS : Entities.TaskStatus.PENDING;
        }
        return Views.task(t);
    }

    @Transactional
    public Map<String, Object> complete(AuthUser a, Long id) {
        Task t = ownTask(a, id);
        t.progress = 100;
        t.status = Entities.TaskStatus.COMPLETED;
        t.completedAt = LocalDateTime.now();
        return Views.task(t);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> performance(AuthUser a) {
        Employee e = scope.employee(a);
        Map<String, Object> m = new LinkedHashMap<>(scope.stats(e));
        m.put("history", performance.findByEmployeeIdOrderByReviewDateAsc(e.id).stream().map(Views::performance).toList());
        m.put("completedTaskList", tasks.findByEmployeeIdOrderByDueDateAsc(e.id).stream()
                .filter(t -> t.status == Entities.TaskStatus.COMPLETED).map(Views::task).toList());
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> feedback(AuthUser a) {
        Employee e = scope.employee(a);
        List<Map<String, Object>> out = new ArrayList<>();
        for (Performance p : performance.findByEmployeeIdOrderByReviewDateAsc(e.id)) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "R" + p.id);
            m.put("source", "REVIEW");
            m.put("supervisor", p.supervisor.user.name);
            m.put("date", p.reviewDate);
            m.put("area", p.performanceArea);
            m.put("feedback", p.comments);
            m.put("rating", p.rating);
            m.put("context", p.reviewPeriod + " review · Overall " + p.overallScore + "%");
            out.add(m);
        }
        for (Task t : tasks.findByEmployeeIdOrderByDueDateAsc(e.id)) {
            if (t.supervisorFeedback == null || t.supervisorFeedback.isBlank()) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", "T" + t.id);
            m.put("source", "TASK");
            m.put("supervisor", t.supervisor.user.name);
            m.put("date", t.completedAt != null ? t.completedAt.toLocalDate() : t.assignedDate);
            m.put("area", "Task Delivery");
            m.put("feedback", t.supervisorFeedback);
            m.put("rating", null);
            m.put("context", "Task: " + t.title);
            out.add(m);
        }
        out.sort((x, y) -> ((java.time.LocalDate) y.get("date")).compareTo((java.time.LocalDate) x.get("date")));
        return out;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> activity(AuthUser a) {
        return logs.findByUserIdOrderByLoginTimeDesc(a.userId()).stream().limit(30).map(Views::log).toList();
    }
}
