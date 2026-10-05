package com.performx.service;

import com.performx.common.Api.ApiException;
import com.performx.dto.Requests;
import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import com.performx.security.AuthUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class SupervisorService {
    private final ScopeService scope;
    private final TaskRepository tasks;
    private final PerformanceRepository performance;
    private final LoginLogRepository logs;

    public SupervisorService(ScopeService scope, TaskRepository tasks, PerformanceRepository performance, LoginLogRepository logs) {
        this.scope = scope; this.tasks = tasks; this.performance = performance; this.logs = logs;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> dashboard(AuthUser a) {
        Supervisor s = scope.supervisor(a);
        List<Map<String, Object>> team = scope.team(s).stream().map(scope::stats).toList();
        List<Task> ts = tasks.findBySupervisorIdOrderByDueDateAsc(s.id);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("teamMembers", team.size());
        m.put("activeTasks", ts.stream().filter(t -> { var st = Views.effectiveStatus(t); return st == Entities.TaskStatus.PENDING || st == Entities.TaskStatus.IN_PROGRESS; }).count());
        m.put("completedTasks", ts.stream().filter(t -> t.status == Entities.TaskStatus.COMPLETED).count());
        m.put("overdueTasks", ts.stream().filter(t -> Views.effectiveStatus(t) == Entities.TaskStatus.OVERDUE).count());
        m.put("avgTeamScore", Math.round(team.stream().mapToDouble(x -> (double) x.get("score")).average().orElse(0) * 10) / 10.0);
        m.put("team", team);
        m.put("awaitingReview", ts.stream().filter(t -> t.status == Entities.TaskStatus.COMPLETED && !t.reviewed).map(Views::task).toList());
        m.put("upcoming", ts.stream().filter(t -> t.status != Entities.TaskStatus.COMPLETED && !t.dueDate.isBefore(LocalDate.now()))
                .limit(6).map(Views::task).toList());
        m.put("department", s.department);
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> team(AuthUser a) {
        return scope.team(scope.supervisor(a)).stream().map(scope::stats).toList();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> member(AuthUser a, Long employeeId) {
        Employee e = scope.teamMember(scope.supervisor(a), employeeId);
        Map<String, Object> m = new LinkedHashMap<>(scope.stats(e));
        m.put("tasks", tasks.findByEmployeeIdOrderByDueDateAsc(e.id).stream().map(Views::task).toList());
        m.put("reviews", performance.findByEmployeeIdOrderByReviewDateAsc(e.id).stream().map(Views::performance).toList());
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> tasks(AuthUser a) {
        return tasks.findBySupervisorIdOrderByDueDateAsc(scope.supervisor(a).id).stream().map(Views::task).toList();
    }

    private Task ownTask(AuthUser a, Long id) {
        Task t = tasks.findById(id).orElseThrow(() -> ApiException.notFound("Task"));
        if (!t.supervisor.id.equals(scope.supervisor(a).id)) throw ApiException.forbidden();
        return t;
    }

    @Transactional
    public Map<String, Object> assign(AuthUser a, Requests.AssignTask r) {
        Supervisor s = scope.supervisor(a);
        Employee e = scope.teamMember(s, r.employeeId());
        LocalDate start = r.startDate() == null ? LocalDate.now() : r.startDate();
        if (r.dueDate().isBefore(start)) throw ApiException.bad("Deadline cannot be before the start date");
        Task t = new Task();
        t.supervisor = s;
        t.employee = e;
        t.title = r.title().trim();
        t.description = r.description();
        t.priority = r.priority();
        t.assignedDate = start;
        t.dueDate = r.dueDate();
        t.expectedResult = r.expectedResult();
        t.performanceWeight = r.performanceWeight() == null ? 5 : r.performanceWeight();
        t.status = Entities.TaskStatus.PENDING;
        return Views.task(tasks.save(t));
    }

    @Transactional
    public Map<String, Object> edit(AuthUser a, Long id, Requests.EditTask r) {
        Task t = ownTask(a, id);
        if (r.title() != null && !r.title().isBlank()) t.title = r.title().trim();
        if (r.description() != null) t.description = r.description();
        if (r.priority() != null) t.priority = r.priority();
        if (r.dueDate() != null) t.dueDate = r.dueDate();
        if (r.expectedResult() != null) t.expectedResult = r.expectedResult();
        if (r.performanceWeight() != null) t.performanceWeight = Math.max(1, Math.min(10, r.performanceWeight()));
        return Views.task(t);
    }

    @Transactional
    public Map<String, Object> feedback(AuthUser a, Long id, String fb) {
        Task t = ownTask(a, id);
        t.supervisorFeedback = fb.trim();
        return Views.task(t);
    }

    @Transactional
    public Map<String, Object> markReviewed(AuthUser a, Long id) {
        Task t = ownTask(a, id);
        if (t.status != Entities.TaskStatus.COMPLETED) throw ApiException.bad("Only completed tasks can be reviewed");
        t.reviewed = true;
        return Views.task(t);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> reviews(AuthUser a) {
        return performance.findBySupervisorIdOrderByReviewDateDesc(scope.supervisor(a).id).stream().map(Views::performance).toList();
    }

    @Transactional
    public Map<String, Object> submitReview(AuthUser a, Requests.Review r) {
        Supervisor s = scope.supervisor(a);
        Employee e = scope.teamMember(s, r.employeeId());
        Performance p = new Performance();
        p.employee = e;
        p.supervisor = s;
        p.reviewPeriod = r.reviewPeriod();
        p.productivityScore = r.productivityScore();
        p.qualityScore = r.qualityScore();
        p.attendanceScore = r.attendanceScore();
        p.overallScore = Math.round((r.productivityScore() * 0.4 + r.qualityScore() * 0.4 + r.attendanceScore() * 0.2) * 10) / 10.0;
        p.comments = r.comments();
        p.performanceArea = r.performanceArea() == null ? "Overall" : r.performanceArea();
        p.rating = r.rating();
        p.reviewDate = LocalDate.now();
        return Views.performance(performance.save(p));
    }

    /** Read-only: logs of employees under this supervisor. No delete endpoint exists for supervisors. */
    @Transactional(readOnly = true)
    public List<Map<String, Object>> logs(AuthUser a) {
        Set<Long> ids = scope.team(scope.supervisor(a)).stream().map(e -> e.user.id).collect(Collectors.toSet());
        if (ids.isEmpty()) return List.of();
        return logs.findByUserIdInOrderByLoginTimeDesc(ids).stream().map(Views::log).toList();
    }
}
