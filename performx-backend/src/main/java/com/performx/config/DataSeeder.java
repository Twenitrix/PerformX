package com.performx.config;

import com.performx.model.*;
import com.performx.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Seeds a realistic, fully fictional organisation on startup:
 * 2 admins, 6 supervisors, 54 employees, ~300 tasks, 4 quarters of reviews, login logs and chats.
 * Deterministic (fixed Random seed) so every demo looks the same.
 */
@Component
public class DataSeeder implements CommandLineRunner {
    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users; private final AdminRepository admins; private final SupervisorRepository supervisors;
    private final EmployeeRepository employees; private final TaskRepository tasks; private final PerformanceRepository performance;
    private final LoginLogRepository logs; private final ChatRepository chats; private final MessageRepository messages;
    private final PasswordEncoder encoder;
    private final Random rnd = new Random(42);
    private int codeSeq = 1001;

    public DataSeeder(UserRepository users, AdminRepository admins, SupervisorRepository supervisors, EmployeeRepository employees,
                      TaskRepository tasks, PerformanceRepository performance, LoginLogRepository logs, ChatRepository chats,
                      MessageRepository messages, PasswordEncoder encoder) {
        this.users = users; this.admins = admins; this.supervisors = supervisors; this.employees = employees; this.tasks = tasks;
        this.performance = performance; this.logs = logs; this.chats = chats; this.messages = messages; this.encoder = encoder;
    }

    private static final String[][] SUPERVISORS = {
            {"Marcus Vance", "Engineering"}, {"Neel Patel", "Engineering"}, {"Priya Raman", "Product"},
            {"Elena Novak", "Design"}, {"Rohan Mehta", "Sales"}, {"Sofia Castillo", "Operations"}};

    private static final String[] FIRST = {"Aarav", "Diya", "Kabir", "Ananya", "Vihaan", "Isha", "Arjun", "Meera", "Reyansh", "Saanvi",
            "Liam", "Olivia", "Noah", "Emma", "Mateo", "Chloe", "Yusuf", "Leila", "Kenji", "Aiko", "Ethan", "Zara", "Omar", "Nina",
            "Rahul", "Tara", "Dev", "Kavya", "Lucas", "Maya", "Aditya", "Riya", "Samuel", "Hana", "Vikram", "Aisha", "Daniel", "Sara",
            "Karan", "Pooja", "Jonah", "Ira", "Nikhil", "Fatima", "Leo", "Anika", "Ishaan", "Mira", "Gabriel", "Neha", "Tanvi", "Felix",
            "Aryan", "Jia"};
    private static final String[] LAST = {"Sharma", "Kapoor", "Iyer", "Nair", "Reddy", "Gupta", "Menon", "Joshi", "Bose", "Desai",
            "Fernandes", "Khan", "Silva", "Tanaka", "Okafor", "Moreau", "Brooks", "Haddad", "Lindqvist", "Varma", "Chopra", "Pillai",
            "Rao", "Banerjee", "Mishra", "Kulkarni", "Hughes", "Petrov", "Sato", "Agarwal"};

    private static final Map<String, String[]> DESIGNATIONS = Map.of(
            "Engineering", new String[]{"Software Engineer", "Senior Software Engineer", "QA Engineer", "DevOps Engineer", "Frontend Engineer"},
            "Product", new String[]{"Product Analyst", "Associate Product Manager", "Business Analyst"},
            "Design", new String[]{"UI Designer", "UX Researcher", "Product Designer"},
            "Sales", new String[]{"Account Executive", "Sales Development Rep", "Customer Success Manager"},
            "Operations", new String[]{"Operations Analyst", "HR Executive", "Finance Associate"});

    private static final Map<String, String[]> TASKS = Map.of(
            "Engineering", new String[]{"Implement OAuth token refresh flow", "Fix pagination bug in reports API", "Write integration tests for billing module",
                    "Migrate CI pipeline to container runners", "Optimise dashboard query performance", "Refactor notification service",
                    "Security audit of user endpoints", "Build CSV export for task analytics", "Upgrade Spring Boot dependencies", "Add rate limiting to public API",
                    "Document deployment runbook", "Resolve memory leak in worker service"},
            "Product", new String[]{"Draft Q4 roadmap proposal", "Analyse onboarding funnel drop-off", "Write PRD for team goals feature",
                    "Run competitor feature comparison", "Prepare sprint review metrics", "Interview five enterprise customers", "Define KPIs for analytics module"},
            "Design", new String[]{"Redesign task details modal", "Create dark mode colour tokens", "Usability test the new dashboard",
                    "Design empty states for reports", "Update icon library", "Prototype mobile navigation", "Audit accessibility contrast issues"},
            "Sales", new String[]{"Prepare Q4 pipeline forecast", "Follow up with 20 warm leads", "Deliver product demo to Northwind Ltd",
                    "Update CRM opportunity stages", "Draft renewal proposal for Contoso", "Build enterprise pricing deck", "Close onboarding for Fabrikam account"},
            "Operations", new String[]{"Reconcile September vendor invoices", "Organise quarterly town hall", "Update leave policy documentation",
                    "Process new-joiner onboarding kits", "Audit software licence usage", "Prepare payroll variance report", "Review office facility contracts"});

    private static final String[] COMMENTS = {
            "Excellent improvement in task completion and communication.",
            "Consistently delivers high-quality work ahead of deadlines. Keep mentoring newer teammates.",
            "Good progress this quarter. Focus on raising estimates earlier when scope changes.",
            "Strong ownership of deliverables. Documentation could be more detailed.",
            "Shows great initiative in cross-team collaboration. Attendance has been very reliable.",
            "Needs to improve turnaround time on reviews, but quality of output remains solid.",
            "Outstanding quarter — led the release with minimal supervision.",
            "Steady performer. Would benefit from taking on a stretch assignment next quarter."};
    private static final String[] AREAS = {"Task Delivery", "Communication", "Quality", "Collaboration", "Ownership", "Time Management"};
    private static final String[] DEVICES = {"Chrome · Windows 11", "Edge · Windows 11", "Safari · macOS", "Chrome · macOS", "Firefox · Ubuntu", "Safari · iPhone", "Chrome · Android"};

    private String ip() { return "10." + (rnd.nextInt(3) + 10) + "." + rnd.nextInt(255) + "." + (rnd.nextInt(250) + 2); }
    private String phone() { return "+91 9" + (100000000 + rnd.nextInt(899999999)); }

    private User user(String name, String email, String hash, Entities.Role role, String dept, String prefix) {
        User u = new User();
        u.name = name; u.email = email; u.password = hash; u.role = role; u.department = dept; u.phone = phone();
        u.employeeCode = prefix + "-" + (codeSeq++);
        u.createdAt = LocalDateTime.now().minusDays(400 + rnd.nextInt(300));
        return users.save(u);
    }

    private static String email(String name) { return name.toLowerCase().replace(' ', '.') + "@performx.com"; }

    @Override
    @Transactional
    public void run(String... args) {
        if (users.count() > 0) return;
        String adminHash = encoder.encode("admin123"), supHash = encoder.encode("supervisor123"), empHash = encoder.encode("employee123");
        LocalDate today = LocalDate.now();

        for (String n : new String[]{"System Administrator", "Kiara Malhotra"}) {
            Admin a = new Admin();
            a.user = user(n, n.equals("System Administrator") ? "admin@performx.com" : email(n), adminHash, Entities.Role.ADMIN, "Administration", "ADM");
            admins.save(a);
        }

        List<Supervisor> sups = new ArrayList<>();
        for (String[] s : SUPERVISORS) {
            Supervisor sp = new Supervisor();
            sp.user = user(s[0], email(s[0]), supHash, Entities.Role.SUPERVISOR, s[1], "SUP");
            sp.department = s[1];
            sups.add(supervisors.save(sp));
        }

        List<Employee> emps = new ArrayList<>();
        Set<String> used = new HashSet<>();
        for (int i = 0; i < 54; i++) {
            String name;
            if (i == 0) name = "Aarav Sharma";
            else do { name = FIRST[i % FIRST.length] + " " + LAST[rnd.nextInt(LAST.length)]; } while (used.contains(name));
            used.add(name);
            Supervisor sp = sups.get(i % sups.size());
            Employee e = new Employee();
            e.user = user(name, email(name), empHash, Entities.Role.EMPLOYEE, sp.department, "EMP");
            e.supervisor = sp;
            String[] d = DESIGNATIONS.get(sp.department);
            e.designation = i == 0 ? "Software Engineer" : d[rnd.nextInt(d.length)];
            e.joiningDate = today.minusDays(60 + rnd.nextInt(900));
            if (i == 53) e.user.active = false; // one revoked account for the demo
            emps.add(employees.save(e));
        }

        // Performance reviews — 4 quarters with an individual trend
        String[] periods = {"2025 Q4", "2026 Q1", "2026 Q2", "2026 Q3"};
        LocalDate[] dates = {LocalDate.of(2025, 12, 28), LocalDate.of(2026, 3, 28), LocalDate.of(2026, 6, 27), LocalDate.of(2026, 9, 26)};
        for (Employee e : emps) {
            boolean star = e.user.name.equals("Aarav Sharma");
            double base = star ? 78 : 58 + rnd.nextInt(30);
            double slope = star ? 3.8 : rnd.nextInt(7) - 2;
            for (int q = 0; q < periods.length; q++) {
                if (e.joiningDate.isAfter(dates[q])) continue;
                Performance p = new Performance();
                p.employee = e; p.supervisor = e.supervisor; p.reviewPeriod = periods[q]; p.reviewDate = dates[q];
                double target = Math.min(98, base + slope * q + rnd.nextGaussian() * 2);
                p.productivityScore = clamp(target + rnd.nextInt(7) - 3);
                p.qualityScore = clamp(target + rnd.nextInt(7) - 3);
                p.attendanceScore = clamp(target + 6 + rnd.nextInt(6));
                p.overallScore = Math.round((p.productivityScore * 0.4 + p.qualityScore * 0.4 + p.attendanceScore * 0.2) * 10) / 10.0;
                p.rating = p.overallScore >= 90 ? 5 : p.overallScore >= 80 ? 4 : p.overallScore >= 70 ? 3 : p.overallScore >= 60 ? 2 : 1;
                p.comments = COMMENTS[rnd.nextInt(COMMENTS.length)];
                p.performanceArea = AREAS[rnd.nextInt(AREAS.length)];
                performance.save(p);
            }
        }

        // Tasks across the last ~6 months plus upcoming work
        for (Employee e : emps) {
            String[] pool = TASKS.get(e.supervisor.department);
            int count = 4 + rnd.nextInt(4);
            List<String> titles = new ArrayList<>(Arrays.asList(pool));
            Collections.shuffle(titles, rnd);
            for (int k = 0; k < count; k++) {
                Task t = new Task();
                t.employee = e; t.supervisor = e.supervisor;
                t.title = titles.get(k % titles.size());
                t.description = "Deliver \"" + t.title.toLowerCase() + "\" in line with the team's quarterly objectives. Share progress updates in the task log and flag blockers early.";
                t.expectedResult = "Completed deliverable reviewed and accepted by " + e.supervisor.user.name.split(" ")[0] + ", with notes documented.";
                t.priority = Entities.Priority.values()[rnd.nextInt(3)];
                t.performanceWeight = 3 + rnd.nextInt(6);
                int startOffset = -170 + rnd.nextInt(175);
                t.assignedDate = today.plusDays(startOffset);
                t.dueDate = t.assignedDate.plusDays(5 + rnd.nextInt(20));
                boolean past = t.dueDate.isBefore(today);
                int roll = rnd.nextInt(100);
                if (past && roll < 85 || !past && roll < 20) {
                    t.status = Entities.TaskStatus.COMPLETED; t.progress = 100;
                    LocalDate done = t.dueDate.minusDays(rnd.nextInt(4));
                    if (done.isAfter(today)) done = today;
                    t.completedAt = done.atTime(10 + rnd.nextInt(8), rnd.nextInt(60));
                    t.employeeUpdate = "Delivered and shared with the team. All acceptance criteria met.";
                    t.reviewed = rnd.nextInt(100) < 75;
                    if (t.reviewed) t.supervisorFeedback = rnd.nextBoolean() ? "Great work — clean delivery and well documented." : "Solid result. Next time loop in stakeholders a bit earlier.";
                } else {
                    t.progress = past ? 30 + rnd.nextInt(50) : rnd.nextInt(4) * 20;
                    t.status = t.progress == 0 ? Entities.TaskStatus.PENDING : Entities.TaskStatus.IN_PROGRESS;
                    if (t.progress > 0) t.employeeUpdate = "Work underway — about " + t.progress + "% done.";
                }
                tasks.save(t);
            }
        }
        seedDemoTasks(emps.get(0), today);

        // Login logs — last 30 days for every user
        for (User u : users.findAll()) {
            int sessions = u.role == Entities.Role.EMPLOYEE ? 5 + rnd.nextInt(6) : 8 + rnd.nextInt(5);
            for (int s = 0; s < sessions; s++) {
                LoginLog l = new LoginLog();
                l.user = u;
                l.loginTime = today.minusDays(rnd.nextInt(30)).atTime(8 + rnd.nextInt(4), rnd.nextInt(60));
                l.device = DEVICES[rnd.nextInt(DEVICES.length)];
                l.ipAddress = ip();
                int r = rnd.nextInt(100);
                if (r < 8) { l.status = Entities.LogStatus.FAILED; }
                else { l.status = Entities.LogStatus.SUCCESSFUL; l.logoutTime = l.loginTime.plusMinutes(25 + rnd.nextInt(480)); }
                logs.save(l);
            }
            if (rnd.nextInt(100) < 30) {
                LoginLog l = new LoginLog();
                l.user = u; l.loginTime = LocalDateTime.now().minusMinutes(5 + rnd.nextInt(180));
                l.device = DEVICES[rnd.nextInt(DEVICES.length)]; l.ipAddress = ip(); l.status = Entities.LogStatus.ACTIVE;
                logs.save(l);
            }
        }

        // Chats — supervisor ↔ employee
        String[][] scripts = {
                {"S", "Hi {e}, please complete the assigned task before Friday."}, {"E", "Sure {s}, I'm about 70% done. Will share an update by Thursday."},
                {"S", "Great. Let me know if you hit any blockers."}, {"E", "One question — should the export include archived records?"},
                {"S", "Yes, include them but flag them in a separate column."}, {"E", "Got it, thanks!"}};
        String[][] scripts2 = {
                {"E", "Hi {s}, I've pushed the first draft for review."}, {"S", "Thanks {e}. I'll go through it this afternoon."},
                {"S", "Looks good overall — a few comments added. Nice job on the edge cases."}, {"E", "Appreciate it, I'll address them today."}};
        for (Supervisor sp : sups) {
            List<Employee> team = emps.stream().filter(e -> e.supervisor.id.equals(sp.id)).limit(6).toList();
            for (int i = 0; i < team.size(); i++) {
                Employee e = team.get(i);
                Chat c = new Chat();
                c.sender = sp.user; c.receiver = e.user;
                c.createdAt = LocalDateTime.now().minusDays(3 + rnd.nextInt(10)).minusHours(rnd.nextInt(8));
                chats.save(c);
                String[][] sc = i % 2 == 0 ? scripts : scripts2;
                LocalDateTime at = c.createdAt;
                for (int k = 0; k < sc.length; k++) {
                    Message m = new Message();
                    m.chat = c;
                    m.sender = sc[k][0].equals("S") ? sp.user : e.user;
                    m.messageText = sc[k][1].replace("{e}", e.user.name.split(" ")[0]).replace("{s}", sp.user.name.split(" ")[0]);
                    at = at.plusMinutes(4 + rnd.nextInt(90));
                    m.sentAt = at;
                    m.read = k < sc.length - 1 || rnd.nextBoolean();
                    messages.save(m);
                }
            }
        }
        log.info("PERFORMX demo data seeded: {} users, {} tasks, {} reviews, {} logs, {} chats",
                users.count(), tasks.count(), performance.count(), logs.count(), chats.count());
    }

    /** Guaranteed tasks for the employee demo account so the walkthrough always works. */
    private void seedDemoTasks(Employee e, LocalDate today) {
        Object[][] demo = {
                {"Build quarterly performance export", Entities.Priority.HIGH, 0, 4, Entities.TaskStatus.IN_PROGRESS, 60},
                {"Review pull requests for auth module", Entities.Priority.MEDIUM, -2, 1, Entities.TaskStatus.PENDING, 0},
                {"Update API documentation for v1.4", Entities.Priority.LOW, -5, 9, Entities.TaskStatus.IN_PROGRESS, 35}};
        for (Object[] d : demo) {
            Task t = new Task();
            t.employee = e; t.supervisor = e.supervisor; t.title = (String) d[0];
            t.description = "Deliver \"" + t.title.toLowerCase() + "\" for the upcoming release. Coordinate with QA and keep the task log updated.";
            t.expectedResult = "Feature merged to main, verified by QA, and demoed in sprint review.";
            t.priority = (Entities.Priority) d[1];
            t.assignedDate = today.plusDays((int) d[2]);
            t.dueDate = today.plusDays((int) d[3]);
            t.status = (Entities.TaskStatus) d[4];
            t.progress = (int) d[5];
            t.performanceWeight = 8;
            if (t.progress > 0) t.employeeUpdate = "Core logic done; working on edge cases and tests.";
            tasks.save(t);
        }
    }

    private static double clamp(double v) { return Math.round(Math.max(40, Math.min(99, v)) * 10) / 10.0; }
}
