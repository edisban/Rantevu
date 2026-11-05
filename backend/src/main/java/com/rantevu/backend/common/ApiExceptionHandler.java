package com.rantevu.backend.common;

import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import java.util.Map;
import java.util.NoSuchElementException;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<Map<String, String>> status(ResponseStatusException e) {
        return body(HttpStatus.valueOf(e.getStatusCode().value()), String.valueOf(e.getReason()));
    }

    // Bean Validation failures on @Valid request bodies: report the first broken rule
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, String>> invalid(MethodArgumentNotValidException e) {
        var error = e.getBindingResult().getFieldErrors().stream().findFirst();
        return body(HttpStatus.BAD_REQUEST, error.map(f -> f.getDefaultMessage()).orElse("Invalid request"));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<Map<String, String>> unreadable(HttpMessageNotReadableException e) {
        return body(HttpStatus.BAD_REQUEST, "Invalid request body");
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> badRequest(IllegalArgumentException e) {
        return body(HttpStatus.BAD_REQUEST, String.valueOf(e.getMessage()));
    }

    // Database constraints (e.g. two requests racing for the same slot) that slipped past the service checks
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<Map<String, String>> conflict(DataIntegrityViolationException e) {
        boolean slot = String.valueOf(e.getMessage()).contains("ux_appointments_active_slot");
        return body(HttpStatus.CONFLICT, slot ? "This time slot is already taken" : "This conflicts with existing data");
    }

    @ExceptionHandler(NoSuchElementException.class)
    public ResponseEntity<Map<String, String>> notFound(NoSuchElementException e) {
        return body(HttpStatus.NOT_FOUND, "Not found");
    }

    private static ResponseEntity<Map<String, String>> body(HttpStatus status, String message) {
        return ResponseEntity.status(status).body(Map.of("message", message));
    }
}
