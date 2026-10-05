package com.performx.controller;

import com.performx.common.Api;
import com.performx.dto.Requests;
import com.performx.security.AuthUser;
import com.performx.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    private final AuthService auth;

    public AuthController(AuthService auth) { this.auth = auth; }

    @PostMapping("/login")
    public Api.Response<Map<String, Object>> login(@Valid @RequestBody Requests.Login req, HttpServletRequest http) {
        String ip = http.getHeader("X-Forwarded-For");
        if (ip == null || ip.isBlank()) ip = http.getRemoteAddr();
        return Api.ok(auth.login(req, ip.split(",")[0].trim()), "Signed in");
    }

    @GetMapping("/me")
    public Api.Response<Map<String, Object>> me(@AuthenticationPrincipal AuthUser a) { return Api.ok(auth.me(a)); }

    @PostMapping("/logout")
    public Api.Response<Object> logout(@AuthenticationPrincipal AuthUser a) {
        auth.logout(a);
        return Api.ok(null, "Signed out");
    }
}
