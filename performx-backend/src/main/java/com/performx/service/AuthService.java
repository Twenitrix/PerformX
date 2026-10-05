package com.performx.service;

import com.performx.common.Api.ApiException;
import com.performx.dto.Requests;
import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import com.performx.security.AuthUser;
import com.performx.security.JwtService;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@Service
public class AuthService {
    private final UserRepository users;
    private final LoginLogRepository logs;
    private final PasswordEncoder encoder;
    private final JwtService jwt;
    private final EmployeeRepository employees;
    private final SupervisorRepository supervisors;

    public AuthService(UserRepository users, LoginLogRepository logs, PasswordEncoder encoder, JwtService jwt,
                       EmployeeRepository employees, SupervisorRepository supervisors) {
        this.users = users;
        this.logs = logs;
        this.encoder = encoder;
        this.jwt = jwt;
        this.employees = employees;
        this.supervisors = supervisors;
    }

    @Transactional(noRollbackFor = ApiException.class)
    public Map<String, Object> login(Requests.Login req, String ip) {
        String id = req.identifier().trim();
        User u = users.findByEmailIgnoreCase(id).or(() -> users.findByEmployeeCodeIgnoreCase(id)).orElse(null);
        String device = req.device() == null || req.device().isBlank() ? "Web Browser" : req.device();
        if (u == null) throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        if (!encoder.matches(req.password(), u.password)) {
            record(u, ip, device, Entities.LogStatus.FAILED, LocalDateTime.now());
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid credentials");
        }
        if (!u.active) throw new ApiException(HttpStatus.FORBIDDEN, "Your access has been revoked. Contact your administrator.");
        LoginLog l = record(u, ip, device, Entities.LogStatus.ACTIVE, null);
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("token", jwt.generate(u.id, u.role.name(), l.id));
        out.put("user", profile(u));
        return out;
    }

    private LoginLog record(User u, String ip, String device, Entities.LogStatus st, LocalDateTime logout) {
        LoginLog l = new LoginLog();
        l.user = u;
        l.loginTime = LocalDateTime.now();
        l.logoutTime = logout;
        l.ipAddress = ip;
        l.device = device;
        l.status = st;
        return logs.save(l);
    }

    @Transactional
    public void logout(AuthUser a) {
        if (a.logId() == null) return;
        logs.findById(a.logId()).filter(l -> l.user.id.equals(a.userId())).ifPresent(l -> {
            l.logoutTime = LocalDateTime.now();
            l.status = Entities.LogStatus.SUCCESSFUL;
        });
    }

    @Transactional(readOnly = true)
    public Map<String, Object> me(AuthUser a) {
        return profile(users.findById(a.userId()).orElseThrow(() -> ApiException.notFound("User")));
    }

    private Map<String, Object> profile(User u) {
        Map<String, Object> m = Views.user(u);
        employees.findByUserId(u.id).ifPresent(e -> {
            m.put("employeeId", e.id);
            m.put("designation", e.designation);
            m.put("joiningDate", e.joiningDate);
            if (e.supervisor != null) {
                m.put("supervisorName", e.supervisor.user.name);
                m.put("supervisorUserId", e.supervisor.user.id);
            }
        });
        supervisors.findByUserId(u.id).ifPresent(s -> m.put("supervisorId", s.id));
        return m;
    }
}
