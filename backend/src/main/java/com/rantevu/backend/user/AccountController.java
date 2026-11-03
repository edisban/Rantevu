package com.rantevu.backend.user;

import com.rantevu.backend.security.AuthCookies;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/account")
public class AccountController {
    private final AccountService accounts;
    private final AuthCookies cookies;
    public AccountController(AccountService accounts, AuthCookies cookies) { this.accounts = accounts; this.cookies = cookies; }

    // Permanently deletes the signed-in user's account and everything tied to it, then signs them out
    @DeleteMapping
    public ResponseEntity<Void> delete(Authentication auth, @Valid @RequestBody DeleteAccountRequest req, HttpServletRequest request) {
        accounts.delete((Long) auth.getPrincipal(), req.password(), request.getRemoteAddr());
        return ResponseEntity.noContent().header(HttpHeaders.SET_COOKIE, cookies.clear().toString()).build();
    }

    public record DeleteAccountRequest(@NotBlank(message = "Password is required") String password) {}
}
