package com.rantevu.backend.profile;

import com.rantevu.backend.provider.ProviderProfile;
import com.rantevu.backend.provider.ProviderProfileRepository;
import com.rantevu.backend.user.User;
import com.rantevu.backend.user.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    public ProfileController(UserRepository users, ProviderProfileRepository profiles) { this.users = users; this.profiles = profiles; }

    @GetMapping
    public ResponseEntity<?> get(Authentication auth) {
        Long uid = (Long) auth.getPrincipal();
        User u = users.findById(uid).orElseThrow();
        ProviderProfile p = profiles.findById(uid).orElse(null);
        return ResponseEntity.ok(new ProfileResponse(u, p));
    }

    @PutMapping
    public ResponseEntity<?> update(Authentication auth, @RequestBody ProfileRequest req) {
        Long uid = (Long) auth.getPrincipal();
        User u = users.findById(uid).orElseThrow();
        u.setPhone(req.phone());
        users.save(u);
        ProviderProfile p = profiles.findById(uid).orElseGet(() -> { var x = new ProviderProfile(); x.setUser(u); x.setUserId(uid); return x; });
        p.setSpecialty(req.specialty()); p.setAddress(req.address()); p.setBio(req.bio()); p.setPricePerVisit(req.pricePerVisit());
        profiles.save(p);
        return ResponseEntity.ok(new ProfileResponse(u, p));
    }

    public record ProfileRequest(String phone, String specialty, String address, String bio, Double pricePerVisit) {}
    public record ProfileResponse(User user, ProviderProfile profile) {}
}
