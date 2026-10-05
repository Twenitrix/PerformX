package com.performx.controller;

import com.performx.common.Api;
import com.performx.dto.Requests;
import com.performx.security.AuthUser;
import com.performx.service.ChatService;
import com.performx.service.InsightService;
import com.performx.service.WorkspaceService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/** Endpoints available to every authenticated role; each service applies role scoping internally. */
@RestController
@RequestMapping("/api/v1")
public class WorkspaceController {
    private final ChatService chat;
    private final WorkspaceService ws;
    private final InsightService insights;

    public WorkspaceController(ChatService chat, WorkspaceService ws, InsightService insights) {
        this.chat = chat; this.ws = ws; this.insights = insights;
    }

    @GetMapping("/chats") public Api.Response<List<Map<String, Object>>> chats(@AuthenticationPrincipal AuthUser a) { return Api.ok(chat.list(a)); }

    @GetMapping("/chats/{id}/messages")
    public Api.Response<List<Map<String, Object>>> messages(@PathVariable Long id, @AuthenticationPrincipal AuthUser a) { return Api.ok(chat.messages(a, id)); }

    @PostMapping("/chats/messages")
    public Api.Response<Map<String, Object>> send(@Valid @RequestBody Requests.SendMessage r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(chat.send(a, r), "Message sent");
    }

    @GetMapping("/notifications") public Api.Response<List<Map<String, Object>>> notifications(@AuthenticationPrincipal AuthUser a) { return Api.ok(ws.notifications(a)); }

    @GetMapping("/search") public Api.Response<List<Map<String, Object>>> search(@RequestParam String q, @AuthenticationPrincipal AuthUser a) { return Api.ok(ws.search(a, q)); }

    @PostMapping("/ai/generate-feedback")
    public Api.Response<Map<String, Object>> aiFeedback(@Valid @RequestBody Requests.AiFeedback r, @AuthenticationPrincipal AuthUser a) {
        return Api.ok(insights.generateFeedback(a, r.employeeId()));
    }
}
