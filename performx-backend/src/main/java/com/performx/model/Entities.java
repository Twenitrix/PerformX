package com.performx.model;

import jakarta.persistence.*;
import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * All entities mirror the EPMS ER diagram exactly. Public fields keep the domain
 * layer compact; the API never serializes entities directly (see dto.Views).
 */
public final class Entities {
    private Entities() {}

    public enum Role { ADMIN, SUPERVISOR, EMPLOYEE }
    public enum Priority { HIGH, MEDIUM, LOW }
    public enum TaskStatus { PENDING, IN_PROGRESS, COMPLETED, OVERDUE }
    public enum LogStatus { SUCCESSFUL, FAILED, ACTIVE }
}
