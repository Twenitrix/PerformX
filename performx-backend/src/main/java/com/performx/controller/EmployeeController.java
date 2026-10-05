package com.performx.controller;

import com.performx.common.Api;
import com.performx.dto.Requests;
import com.performx.security.AuthUser;
import com.performx.service.EmployeeService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Route prefix locked to ROLE_EMPLOYEE. All data is scoped to the caller. */
@RestController
@RequestMapping("/api/v1/employee")
public class EmployeeController {
    private final EmployeeService svc;

    public EmployeeController(EmployeeService svc) { this.svc = svc; }

    @GetMapping("/dashboard") public Api.Response<Map<String, Object>> dashboard(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.dashboard(a)); }
    @GetMapping("/tasks") public Api.Response<List<Map<String, Object>>> tasks(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.tasks(a)); }
    @GetMapping("/tasks/{id}") public Api.Response<Map<String, Object>> task(@PathVariable Long id, @AuthenticationPrincipal AuthUser a) { return Api.ok(svc.task(a, id)); }

    @PatchMapping("/tasks/{id}/progress")
    public Api.Response<Map<String, Object>> progress(@PathVariable Long id, @Valid @RequestBody Requests.Progress r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.progress(a, id, r), "Progress saved");
    }

    @PostMapping("/tasks/{id}/complete")
    public Api.Response<Map<String, Object>> complete(@PathVariable Long id, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(svc.complete(a, id), "Task marked as completed");
    }

    @GetMapping("/performance") public Api.Response<Map<String, Object>> performance(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.performance(a)); }
    @GetMapping("/feedback") public Api.Response<List<Map<String, Object>>> feedback(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.feedback(a)); }
    @GetMapping("/activity") public Api.Response<List<Map<String, Object>>> activity(@AuthenticationPrincipal AuthUser a) { return Api.ok(svc.activity(a)); }
}
