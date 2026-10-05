package com.performx.controller;

import com.performx.common.Api;
import com.performx.dto.Requests;
import com.performx.security.AuthUser;
import com.performx.service.AdminService;
import com.performx.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Route prefix is locked to ROLE_ADMIN in SecurityConfig. */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {
    private final AdminService admin;
    private final ChatService chat;

    public AdminController(AdminService admin, ChatService chat) { this.admin = admin; this.chat = chat; }

    @GetMapping("/overview") public Api.Response<Map<String, Object>> overview() { return Api.ok(admin.overview()); }
    @GetMapping("/users") public Api.Response<List<Map<String, Object>>> users() { return Api.ok(admin.users()); }
    @GetMapping("/employees") public Api.Response<List<Map<String, Object>>> employees() { return Api.ok(admin.employeesWithStats()); }
    @GetMapping("/supervisors") public Api.Response<List<Map<String, Object>>> supervisors() { return Api.ok(admin.supervisorsWithStats()); }
    @GetMapping("/tasks") public Api.Response<List<Map<String, Object>>> tasks() { return Api.ok(admin.allTasks()); }
    @GetMapping("/activity") public Api.Response<List<Map<String, Object>>> activity() { return Api.ok(admin.activity(80)); }
    @GetMapping("/analytics") public Api.Response<Map<String, Object>> analytics() { return Api.ok(admin.analytics()); }

    @PostMapping("/users")
    public Api.Response<Map<String, Object>> create(@Valid @RequestBody Requests.CreateUser r) { return Api.ok(admin.createUser(r), "User created"); }

    @PatchMapping("/users/{id}")
    public Api.Response<Map<String, Object>> update(@PathVariable Long id, @RequestBody Requests.UpdateUser r) { return Api.ok(admin.updateUser(id, r), "User updated"); }

    @PatchMapping("/users/{id}/status")
    public Api.Response<Map<String, Object>> status(@PathVariable Long id, @Valid @RequestBody Requests.StatusChange r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(admin.setActive(id, r.active(), a.userId()), r.active() ? "Access granted" : "Access revoked");
    }

    @GetMapping("/logs") public Api.Response<List<Map<String, Object>>> logs() { return Api.ok(admin.logs()); }

    @PostMapping("/logs/delete")
    public Api.Response<Map<String, Object>> deleteLogs(@Valid @RequestBody Requests.IdList r) {
        int n = admin.deleteLogs(r.ids());
        return Api.ok(Map.of("removed", n), n + " access log(s) removed");
    }

    @GetMapping("/chats") public Api.Response<List<Map<String, Object>>> chats(@AuthenticationPrincipal AuthUser a) { return Api.ok(chat.list(a)); }

    @GetMapping("/chats/{id}/messages")
    public Api.Response<List<Map<String, Object>>> messages(@PathVariable Long id, @AuthenticationPrincipal AuthUser a) { return Api.ok(chat.messages(a, id)); }

    @DeleteMapping("/chats/{id}")
    public Api.Response<Object> removeChat(@PathVariable Long id, @AuthenticationPrincipal AuthUser a) {
        chat.remove(a, id);
        return Api.ok(null, "Conversation removed");
    }
}
