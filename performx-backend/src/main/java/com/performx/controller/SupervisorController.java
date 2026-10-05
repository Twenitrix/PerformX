package com.performx.controller;

import com.performx.common.Api;
import com.performx.dto.Requests;
import com.performx.security.AuthUser;
import com.performx.service.SupervisorService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Route prefix locked to ROLE_SUPERVISOR. Intentionally exposes no delete operations for logs or chats. */
@RestController
@RequestMapping("/api/v1/supervisor")
public class SupervisorController {
    private final SupervisorService svc;

    public SupervisorController(SupervisorService svc) { this.svc = svc; }

    @GetMapping("/dashboard") public Api.Response<Map<String, Object>> dashboard(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.dashboard(a)); }
    @GetMapping("/team") public Api.Response<List<Map<String, Object>>> team(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.team(a)); }
    @GetMapping("/team/{employeeId}") public Api.Response<Map<String, Object>> member(@PathVariable Long employeeId, @AuthenticationPrincipal AuthUser a) { return Api.ok(svc.member(a, employeeId)); }
    @GetMapping("/tasks") public Api.Response<List<Map<String, Object>>> tasks(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.tasks(a)); }

    @PostMapping("/tasks")
    public Api.Response<Map<String, Object>> assign(@Valid @RequestBody Requests.AssignTask r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.assign(a, r), "Task successfully assigned.");
    }

    @PatchMapping("/tasks/{id}")
    public Api.Response<Map<String, Object>> edit(@PathVariable Long id, @Valid @RequestBody Requests.EditTask r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.edit(a, id, r), "Task updated");
    }

    @PostMapping("/tasks/{id}/feedback")
    public Api.Response<Map<String, Object>> feedback(@PathVariable Long id, @Valid @RequestBody Requests.Feedback r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.feedback(a, id, r.feedback()), "Feedback saved");
    }

    @PostMapping("/tasks/{id}/review")
    public Api.Response<Map<String, Object>> review(@PathVariable Long id, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.markReviewed(a, id), "Task marked as reviewed");
    }

    @GetMapping("/reviews") public Api.Response<List<Map<String, Object>>> reviews(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.reviews(a)); }

    @PostMapping("/reviews")
    public Api.Response<Map<String, Object>> submitReview(@Valid @RequestBody Requests.Review r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.submitReview(a, r), "Performance review submitted");
    }

    @GetMapping("/logs") public Api.Response<List<Map<String, Object>>> logs(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.logs(a)); }
}
