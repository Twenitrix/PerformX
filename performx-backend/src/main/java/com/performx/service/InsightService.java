package com.performx.service;

import com.performx.model.Employee;
import com.performx.model.Performance;
import com.performx.repository.EmployeeRepository;
import com.performx.repository.PerformanceRepository;
import com.performx.security.AuthUser;
import com.performx.common.Api.ApiException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

/**
 * Smart Performance Insights Engine.
 * Deterministic, explainable heuristics today; designed so an LLM provider can be plugged in
 * behind {@link #generateFeedback} without changing the API contract.
 */
@Service
public class InsightService {
    private final ScopeService scope;
    private final EmployeeRepository employees;
    private final PerformanceRepository performance;

    public InsightService(ScopeService scope, EmployeeRepository employees, PerformanceRepository performance) {
        this.scope = scope; this.employees = employees; this.performance = performance;
    }

    private Employee authorized(AuthUser a, Long employeeId) {
        return switch (a.role()) {
            case "ADMIN" -> employees.findById(employeeId).orElseThrow(() -> ApiException.notFound("Employee"));
            case "SUPERVISOR" -> scope.teamMember(scope.supervisor(a), employeeId);
            default -> {
                Employee self = scope.employee(a);
                if (!self.id.equals(employeeId)) throw ApiException.forbidden();
                yield self;
            }
        };
    }

    @Transactional(readOnly = true)
    public Map<String, Object> generateFeedback(AuthUser a, Long employeeId) {
        Employee e = authorized(a, employeeId);
        Map<String, Object> s = scope.stats(e);
        List<Performance> hist = performance.findByEmployeeIdOrderByReviewDateAsc(e.id);
        Performance last = hist.isEmpty() ? null : hist.get(hist.size() - 1);
        String first = e.user.name.split(" ")[0];
        double score = (double) s.get("score");
        double rate = (double) s.get("completionRate");
        long overdue = (long) s.get("tasksOverdue");

        List<String> strengths = new ArrayList<>();
        List<String> growth = new ArrayList<>();
        if (last != null) {
            if (last.qualityScore >= 85) strengths.add("consistently high quality of deliverables (" + (int) last.qualityScore + "%)");
            else if (last.qualityScore < 72) growth.add("raising deliverable quality through earlier peer reviews");
            if (last.productivityScore >= 85) strengths.add("strong productivity and throughput");
            else if (last.productivityScore < 72) growth.add("improving throughput by breaking work into smaller milestones");
            if (last.attendanceScore >= 92) strengths.add("dependable attendance and availability");
            else if (last.attendanceScore < 80) growth.add("more consistent availability during core hours");
        }
        if (rate >= 80) strengths.add("a task completion rate of " + rate + "%");
        if (overdue > 0) growth.add("clearing " + overdue + " overdue task" + (overdue > 1 ? "s" : "") + " and flagging blockers earlier");
        if (strengths.isEmpty()) strengths.add("steady engagement with assigned work");
        if (growth.isEmpty()) growth.add("taking ownership of a stretch assignment to keep growing");

        String trend = hist.size() > 1
                ? (last.overallScore >= hist.get(hist.size() - 2).overallScore ? "an upward trend" : "a slight dip")
                : "a solid baseline";
        String suggestion = first + " is performing at a " + ScopeService.level(score).toLowerCase() + " level (" + score
                + "%), showing " + trend + " versus the previous period. Key strengths include " + String.join(", ", strengths)
                + ". To keep progressing, focus on " + String.join(" and ", growth) + ".";
        int rating = score >= 90 ? 5 : score >= 80 ? 4 : score >= 70 ? 3 : score >= 60 ? 2 : 1;
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("employeeName", e.user.name);
        m.put("suggestedFeedback", suggestion);
        m.put("suggestedRating", rating);
        m.put("strengths", strengths);
        m.put("growthAreas", growth);
        m.put("engine", "PERFORMX Insights (rule-based v1)");
        return m;
    }
}
