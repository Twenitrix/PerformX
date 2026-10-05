package com.performx.service;

import com.performx.common.Api.ApiException;
import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import com.performx.security.AuthUser;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Resolves the role-profile of the caller and computes performance metrics.
 * Every data-scoping decision flows through here so supervisors/employees can never
 * reach outside their own team / own records.
 */
@Service
public class ScopeService {
    private final UserRepository users;
    private final SupervisorRepository supervisors;
    private final EmployeeRepository employees;
    private final TaskRepository tasks;
    private final PerformanceRepository performance;

    public ScopeService(UserRepository users, SupervisorRepository supervisors, EmployeeRepository employees,
                        TaskRepository tasks, PerformanceRepository performance) {
        this.users = users;
        this.supervisors = supervisors;
        this.employees = employees;
        this.tasks = tasks;
        this.performance = performance;
    }

    public User user(AuthUser a) { return users.findById(a.userId()).orElseThrow(() -> ApiException.notFound("User")); }

    public Supervisor supervisor(AuthUser a) {
        return supervisors.findByUserId(a.userId()).orElseThrow(ApiException::forbidden);
    }

    public Employee employee(AuthUser a) {
        return employees.findByUserId(a.userId()).orElseThrow(ApiException::forbidden);
    }

    public List<Employee> team(Supervisor s) { return employees.findBySupervisorId(s.id); }

    /** Ensures the employee belongs to the supervisor's team. */
    public Employee teamMember(Supervisor s, Long employeeId) {
        Employee e = employees.findById(employeeId).orElseThrow(() -> ApiException.notFound("Employee"));
        if (e.supervisor == null || !e.supervisor.id.equals(s.id)) throw ApiException.forbidden();
        return e;
    }

    /**
     * Live performance score = 60% latest supervisor review + 40% weighted task completion.
     * Completing tasks therefore visibly moves the employee's score.
     */
    public Map<String, Object> stats(Employee e) {
        List<Task> ts = tasks.findByEmployeeIdOrderByDueDateAsc(e.id);
        List<Performance> ps = performance.findByEmployeeIdOrderByReviewDateAsc(e.id);
        long completed = 0, inProgress = 0, pending = 0, overdue = 0;
        double wTotal = 0, wDone = 0;
        for (Task t : ts) {
            var st = Views.effectiveStatus(t);
            switch (st) {
                case COMPLETED -> completed++;
                case IN_PROGRESS -> inProgress++;
                case PENDING -> pending++;
                case OVERDUE -> overdue++;
            }
            wTotal += t.performanceWeight;
            wDone += t.performanceWeight * (st == Entities.TaskStatus.COMPLETED ? 1.0 : t.progress / 100.0 * 0.5);
        }
        double completionRate = ts.isEmpty() ? 0 : Math.round(completed * 1000.0 / ts.size()) / 10.0;
        double weighted = wTotal == 0 ? 0 : wDone / wTotal * 100;
        double review = ps.isEmpty() ? 75 : ps.get(ps.size() - 1).overallScore;
        double prevReview = ps.size() > 1 ? ps.get(ps.size() - 2).overallScore : review;
        double score = Math.round((review * 0.6 + weighted * 0.4) * 10) / 10.0;
        double prevScore = Math.round((prevReview * 0.6 + weighted * 0.4) * 10) / 10.0;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("employeeId", e.id);
        m.put("userId", e.user.id);
        m.put("name", e.user.name);
        m.put("email", e.user.email);
        m.put("employeeCode", e.user.employeeCode);
        m.put("designation", e.designation);
        m.put("department", e.user.department);
        m.put("joiningDate", e.joiningDate);
        m.put("active", e.user.active);
        m.put("supervisorName", e.supervisor == null ? null : e.supervisor.user.name);
        m.put("score", score);
        m.put("scoreDelta", Math.round((score - prevScore) * 10) / 10.0);
        m.put("tasksAssigned", ts.size());
        m.put("tasksCompleted", completed);
        m.put("tasksInProgress", inProgress);
        m.put("tasksPending", pending);
        m.put("tasksOverdue", overdue);
        m.put("completionRate", completionRate);
        m.put("goalCompletion", Math.round(weighted * 10) / 10.0);
        m.put("level", level(score));
        return m;
    }

    public static String level(double s) {
        if (s >= 88) return "Excellent";
        if (s >= 75) return "Good";
        if (s >= 60) return "Average";
        return "Needs Improvement";
    }
}
