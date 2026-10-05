package com.performx.service;

import com.performx.common.Api.ApiException;
import com.performx.dto.Requests;
import com.performx.dto.Views;
import com.performx.model.*;
import com.performx.repository.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AdminService {
    private final UserRepository users;
    private final AdminRepository admins;
    private final SupervisorRepository supervisors;
    private final EmployeeRepository employees;
    private final TaskRepository tasks;
    private final PerformanceRepository performance;
    private final LoginLogRepository logs;
    private final ChatRepository chats;
    private final ScopeService scope;
    private final PasswordEncoder encoder;

    public AdminService(UserRepository users, AdminRepository admins, SupervisorRepository supervisors,
                        EmployeeRepository employees, TaskRepository tasks, PerformanceRepository performance,
                        LoginLogRepository logs, ChatRepository chats, ScopeService scope, PasswordEncoder encoder) {
        this.users = users; this.admins = admins; this.supervisors = supervisors; this.employees = employees;
        this.tasks = tasks; this.performance = performance; this.logs = logs; this.chats = chats;
        this.scope = scope; this.encoder = encoder;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> overview() {
        List<Task> all = tasks.findAll();
        long pending = all.stream().filter(t -> Views.effectiveStatus(t) != Entities.TaskStatus.COMPLETED).count();
        long overdue = all.stream().filter(t -> Views.effectiveStatus(t) == Entities.TaskStatus.OVERDUE).count();
        long failedToday = logs.findAllByOrderByLoginTimeDesc().stream()
                .filter(l -> l.status == Entities.LogStatus.FAILED && l.loginTime.isAfter(LocalDate.now().atStartOfDay())).count();
        long inactive = users.count() - users.countByActiveTrue();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("totalEmployees", employees.count());
        m.put("activeUsers", users.countByActiveTrue());
        m.put("todaysLogins", logs.countByLoginTimeAfter(LocalDate.now().atStartOfDay()));
        m.put("activeSupervisors", supervisors.findAll().stream().filter(s -> s.user.active).count());
        m.put("pendingTasks", pending);
        m.put("systemAlerts", overdue + failedToday + inactive);
        m.put("alertBreakdown", Map.of("overdueTasks", overdue, "failedLoginsToday", failedToday, "inactiveAccounts", inactive));
        m.put("trend", trend(12));
        m.put("recentActivity", activity(8));
        m.put("departments", departments());
        return m;
    }

    /** Monthly organisation trend built from real reviews, tasks and joining dates. */
    public List<Map<String, Object>> trend(int months) {
        List<Performance> ps = performance.findAll();
        List<Task> ts = tasks.findAll();
        List<Employee> es = employees.findAll();
        List<Map<String, Object>> out = new ArrayList<>();
        YearMonth now = YearMonth.now();
        for (int i = months - 1; i >= 0; i--) {
            YearMonth ym = now.minusMonths(i);
            int q = (ym.getMonthValue() - 1) / 3;
            LocalDate end = ym.atEndOfMonth();
            OptionalDouble perf = ps.stream().filter(p -> p.reviewDate.getYear() == ym.getYear()
                    && (p.reviewDate.getMonthValue() - 1) / 3 == q).mapToDouble(p -> p.overallScore).average();
            List<Task> due = ts.stream().filter(t -> YearMonth.from(t.dueDate).equals(ym)).toList();
            long done = due.stream().filter(t -> t.status == Entities.TaskStatus.COMPLETED).count();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("month", ym.getMonth().name().substring(0, 3) + " " + String.valueOf(ym.getYear()).substring(2));
            m.put("performance", perf.isPresent() ? Math.round(perf.getAsDouble() * 10) / 10.0 : null);
            m.put("completion", due.isEmpty() ? null : Math.round(done * 1000.0 / due.size()) / 10.0);
            m.put("employees", es.stream().filter(e -> !e.joiningDate.isAfter(end)).count());
            out.add(m);
        }
        return out;
    }

    public List<Map<String, Object>> departments() {
        Map<String, List<Employee>> byDept = employees.findAll().stream().collect(Collectors.groupingBy(e -> e.user.department));
        List<Map<String, Object>> out = new ArrayList<>();
        byDept.forEach((d, list) -> {
            DoubleSummaryStatistics s = list.stream().mapToDouble(e -> (double) scope.stats(e).get("score")).summaryStatistics();
            DoubleSummaryStatistics c = list.stream().mapToDouble(e -> (double) scope.stats(e).get("completionRate")).summaryStatistics();
            out.add(Map.of("department", d, "employees", list.size(),
                    "avgScore", Math.round(s.getAverage() * 10) / 10.0, "completionRate", Math.round(c.getAverage() * 10) / 10.0));
        });
        out.sort(Comparator.comparing(m -> (String) m.get("department")));
        return out;
    }

    public List<Map<String, Object>> activity(int limit) {
        List<Map<String, Object>> ev = new ArrayList<>();
        for (Task t : tasks.findAll()) {
            ev.add(Map.of("type", "TASK_ASSIGNED", "at", t.assignedDate.atTime(9, 30),
                    "text", t.supervisor.user.name + " assigned \"" + t.title + "\" to " + t.employee.user.name));
            if (t.completedAt != null) ev.add(Map.of("type", "TASK_COMPLETED", "at", t.completedAt,
                    "text", t.employee.user.name + " completed \"" + t.title + "\""));
        }
        for (Performance p : performance.findAll())
            ev.add(Map.of("type", "REVIEW", "at", p.reviewDate.atTime(16, 0),
                    "text", p.supervisor.user.name + " reviewed " + p.employee.user.name + " (" + p.reviewPeriod + ")"));
        logs.findAllByOrderByLoginTimeDesc().stream().limit(60).forEach(l -> ev.add(Map.of(
                "type", l.status == Entities.LogStatus.FAILED ? "LOGIN_FAILED" : "LOGIN", "at", l.loginTime,
                "text", (l.status == Entities.LogStatus.FAILED ? "Failed sign-in attempt for " : "") + l.user.name
                        + (l.status == Entities.LogStatus.FAILED ? "" : " signed in") + " from " + l.device)));
        ev.removeIf(e -> ((LocalDateTime) e.get("at")).isAfter(LocalDateTime.now()));
        ev.sort((a, b) -> ((LocalDateTime) b.get("at")).compareTo((LocalDateTime) a.get("at")));
        return ev.stream().limit(limit).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> users() {
        Map<Long, LocalDateTime> last = new HashMap<>();
        for (LoginLog l : logs.findAllByOrderByLoginTimeDesc())
            if (l.status != Entities.LogStatus.FAILED) last.putIfAbsent(l.user.id, l.loginTime);
        Map<Long, Employee> empByUser = employees.findAll().stream().collect(Collectors.toMap(e -> e.user.id, e -> e));
        return users.findAllByOrderByNameAsc().stream().map(u -> {
            Map<String, Object> m = Views.user(u);
            m.put("lastLogin", last.get(u.id));
            Employee e = empByUser.get(u.id);
            if (e != null) {
                m.put("designation", e.designation);
                m.put("supervisorName", e.supervisor == null ? null : e.supervisor.user.name);
                m.put("supervisorId", e.supervisor == null ? null : e.supervisor.id);
            }
            return m;
        }).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> employeesWithStats() {
        return employees.findAll().stream().map(scope::stats).toList();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> supervisorsWithStats() {
        return supervisors.findAll().stream().map(s -> {
            List<Employee> team = scope.team(s);
            List<Map<String, Object>> st = team.stream().map(scope::stats).toList();
            List<Task> ts = tasks.findBySupervisorIdOrderByDueDateAsc(s.id);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("supervisorId", s.id);
            m.put("user", Views.user(s.user));
            m.put("department", s.department);
            m.put("teamSize", team.size());
            m.put("avgTeamScore", Math.round(st.stream().mapToDouble(x -> (double) x.get("score")).average().orElse(0) * 10) / 10.0);
            m.put("tasksAssigned", ts.size());
            m.put("tasksCompleted", ts.stream().filter(t -> t.status == Entities.TaskStatus.COMPLETED).count());
            m.put("reviewsGiven", performance.findBySupervisorIdOrderByReviewDateDesc(s.id).size());
            m.put("pendingReviews", ts.stream().filter(t -> t.status == Entities.TaskStatus.COMPLETED && !t.reviewed).count());
            return m;
        }).toList();
    }

    @Transactional
    public Map<String, Object> createUser(Requests.CreateUser r) {
        if (users.findByEmailIgnoreCase(r.email()).isPresent()) throw ApiException.bad("Email already registered");
        User u = new User();
        u.name = r.name().trim();
        u.email = r.email().trim().toLowerCase();
        u.password = encoder.encode(r.password());
        u.role = r.role();
        u.department = r.department();
        u.phone = r.phone();
        u.employeeCode = nextCode(r.role());
        users.save(u);
        switch (r.role()) {
            case ADMIN -> { Admin a = new Admin(); a.user = u; admins.save(a); }
            case SUPERVISOR -> { Supervisor s = new Supervisor(); s.user = u; s.department = r.department(); supervisors.save(s); }
            case EMPLOYEE -> {
                Employee e = new Employee();
                e.user = u;
                e.designation = r.designation() == null ? "Associate" : r.designation();
                e.joiningDate = LocalDate.now();
                if (r.supervisorId() != null)
                    e.supervisor = supervisors.findById(r.supervisorId()).orElseThrow(() -> ApiException.notFound("Supervisor"));
                employees.save(e);
            }
        }
        return Views.user(u);
    }

    private String nextCode(Entities.Role role) {
        String prefix = switch (role) { case ADMIN -> "ADM"; case SUPERVISOR -> "SUP"; case EMPLOYEE -> "EMP"; };
        int n = (int) users.count() + 1001;
        while (users.findByEmployeeCodeIgnoreCase(prefix + "-" + n).isPresent()) n++;
        return prefix + "-" + n;
    }

    @Transactional
    public Map<String, Object> updateUser(Long id, Requests.UpdateUser r) {
        User u = users.findById(id).orElseThrow(() -> ApiException.notFound("User"));
        if (r.name() != null && !r.name().isBlank()) u.name = r.name().trim();
        if (r.department() != null) u.department = r.department();
        if (r.phone() != null) u.phone = r.phone();
        if (r.supervisorId() != null) employees.findByUserId(id).ifPresent(e ->
                e.supervisor = supervisors.findById(r.supervisorId()).orElseThrow(() -> ApiException.notFound("Supervisor")));
        return Views.user(u);
    }

    @Transactional
    public Map<String, Object> setActive(Long id, boolean active, Long actingUserId) {
        if (id.equals(actingUserId) && !active) throw ApiException.bad("You cannot revoke your own access");
        User u = users.findById(id).orElseThrow(() -> ApiException.notFound("User"));
        u.active = active;
        return Views.user(u);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> logs() {
        return logs.findAllByOrderByLoginTimeDesc().stream().map(Views::log).toList();
    }

    @Transactional
    public int deleteLogs(List<Long> ids) {
        List<LoginLog> found = logs.findAllById(ids);
        logs.deleteAll(found);
        return found.size();
    }

    @Transactional(readOnly = true)
    public Map<String, Object> analytics() {
        List<Map<String, Object>> stats = employeesWithStats();
        int[] buckets = new int[5]; // <60, 60-70, 70-80, 80-90, 90+
        for (var s : stats) {
            double v = (double) s.get("score");
            buckets[v < 60 ? 0 : v < 70 ? 1 : v < 80 ? 2 : v < 90 ? 3 : 4]++;
        }
        List<Task> ts = tasks.findAll();
        Map<String, Long> byStatus = new LinkedHashMap<>();
        for (var st : Entities.TaskStatus.values()) byStatus.put(st.name(), 0L);
        ts.forEach(t -> byStatus.merge(Views.effectiveStatus(t).name(), 1L, Long::sum));
        Map<String, Long> byPriority = ts.stream().collect(Collectors.groupingBy(t -> t.priority.name(), TreeMap::new, Collectors.counting()));
        // Heatmap: department × quarter average review score
        Map<String, Map<String, Double>> heat = new TreeMap<>();
        performance.findAll().stream().collect(Collectors.groupingBy(p -> p.employee.user.department,
                Collectors.groupingBy(p -> p.reviewPeriod, TreeMap::new, Collectors.averagingDouble(p -> p.overallScore))))
                .forEach((d, m) -> {
                    Map<String, Double> r = new TreeMap<>();
                    m.forEach((k, v) -> r.put(k, Math.round(v * 10) / 10.0));
                    heat.put(d, r);
                });
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("overallScore", Math.round(stats.stream().mapToDouble(s -> (double) s.get("score")).average().orElse(0) * 10) / 10.0);
        m.put("completionRate", ts.isEmpty() ? 0 : Math.round(byStatus.get("COMPLETED") * 1000.0 / ts.size()) / 10.0);
        m.put("overdueTasks", byStatus.get("OVERDUE"));
        m.put("totalTasks", ts.size());
        m.put("distribution", List.of(
                Map.of("range", "< 60", "count", buckets[0]), Map.of("range", "60–69", "count", buckets[1]),
                Map.of("range", "70–79", "count", buckets[2]), Map.of("range", "80–89", "count", buckets[3]),
                Map.of("range", "90+", "count", buckets[4])));
        m.put("tasksByStatus", byStatus);
        m.put("tasksByPriority", byPriority);
        m.put("departments", departments());
        m.put("supervisors", supervisorsWithStats());
        m.put("trend", trend(12));
        m.put("heatmap", heat);
        m.put("employees", stats);
        return m;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> allTasks() {
        return tasks.findAll().stream().map(Views::task).toList();
    }
}
