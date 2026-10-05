package com.performx.common;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.Instant;

public final class Api {
    private Api() {}

    public record Response<T>(boolean success, T data, String message, String timestamp) {}

    public static <T> Response<T> ok(T data) { return new Response<>(true, data, "OK", Instant.now().toString()); }
    public static <T> Response<T> ok(T data, String msg) { return new Response<>(true, data, msg, Instant.now().toString()); }

    public static class ApiException extends RuntimeException {
        public final HttpStatus status;
        public ApiException(HttpStatus status, String msg) { super(msg); this.status = status; }
        public static ApiException notFound(String what) { return new ApiException(HttpStatus.NOT_FOUND, what + " not found"); }
        public static ApiException forbidden() { return new ApiException(HttpStatus.FORBIDDEN, "You do not have access to this resource"); }
        public static ApiException bad(String m) { return new ApiException(HttpStatus.BAD_REQUEST, m); }
    }

    @RestControllerAdvice
    public static class Handler {
        private static ResponseEntity<Response<Object>> err(HttpStatus s, String m) {
            return ResponseEntity.status(s).body(new Response<>(false, null, m, Instant.now().toString()));
        }
        @ExceptionHandler(ApiException.class)
        public ResponseEntity<Response<Object>> api(ApiException e) { return err(e.status, e.getMessage()); }
        @ExceptionHandler(AccessDeniedException.class)
        public ResponseEntity<Response<Object>> denied(AccessDeniedException e) { return err(HttpStatus.FORBIDDEN, "Access denied"); }
        @ExceptionHandler(MethodArgumentNotValidException.class)
        public ResponseEntity<Response<Object>> invalid(MethodArgumentNotValidException e) {
            var fe = e.getBindingResult().getFieldError();
            return err(HttpStatus.BAD_REQUEST, fe == null ? "Invalid request" : fe.getField() + ": " + fe.getDefaultMessage());
        }
    }
}
