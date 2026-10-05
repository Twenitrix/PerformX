package com.performx.dto;

import com.performx.model.Entities;
import jakarta.validation.constraints.*;

import java.time.LocalDate;
import java.util.List;

public final class Requests {
    private Requests() {}

    public record Login(@NotBlank String identifier, @NotBlank String password, String device) {}

    public record CreateUser(@NotBlank String name, @Email @NotBlank String email, @NotBlank @Size(min = 6) String password,
                             @NotNull Entities.Role role, String department, String phone, String designation, Long supervisorId) {}

    public record UpdateUser(String name, String department, String phone, Entities.Role role, Long supervisorId) {}

    public record StatusChange(@NotNull Boolean active) {}

    public record IdList(@NotEmpty List<Long> ids) {}

    public record AssignTask(@NotBlank @Size(max = 200) String title, @Size(max = 2000) String description,
                             @NotNull Long employeeId, @NotNull Entities.Priority priority, LocalDate startDate,
                             @NotNull LocalDate dueDate, @Size(max = 1000) String expectedResult,
                             @Min(1) @Max(10) Integer performanceWeight) {}

    public record EditTask(@Size(max = 200) String title, @Size(max = 2000) String description, Entities.Priority priority,
                           LocalDate dueDate, @Size(max = 1000) String expectedResult, Integer performanceWeight) {}

    public record Feedback(@NotBlank @Size(max = 2000) String feedback) {}

    public record Progress(@NotNull @Min(0) @Max(100) Integer progress, @Size(max = 2000) String update) {}

    public record Review(@NotNull Long employeeId, @NotBlank String reviewPeriod,
                         @Min(0) @Max(100) double productivityScore, @Min(0) @Max(100) double qualityScore,
                         @Min(0) @Max(100) double attendanceScore, @Size(max = 2000) String comments,
                         String performanceArea, @Min(1) @Max(5) int rating) {}

    public record SendMessage(Long chatId, Long receiverId, @NotBlank @Size(max = 4000) String text) {}

    public record AiFeedback(@NotNull Long employeeId) {}
}
