package com.performx.security;

/** Authenticated principal placed into the SecurityContext. */
public record AuthUser(Long userId, String role, Long logId) {}
