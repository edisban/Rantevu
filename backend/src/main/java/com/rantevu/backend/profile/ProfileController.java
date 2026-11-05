package com.rantevu.backend.profile;

import com.rantevu.backend.provider.ProviderDto;
import com.rantevu.backend.provider.ProviderProfile;
import com.rantevu.backend.provider.ProviderProfileRepository;
import com.rantevu.backend.user.MeResponse;
import com.rantevu.backend.user.Role;
import com.rantevu.backend.user.User;
import com.rantevu.backend.user.UserRepository;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/profile")
public class ProfileController {
    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    public ProfileController(UserRepository users, ProviderProfileRepository profiles) { this.users = users; this.profiles = profiles; }

    @GetMapping
    public ProfileResponse get(Authentication auth) {
        Long uid = (Long) auth.getPrincipal();
        User u = users.findById(uid).orElseThrow();
        return response(u, profiles.findById(uid).orElse(null));
    }

    @PutMapping
    public ProfileResponse update(Authentication auth, @Valid @RequestBody ProfileRequest req) {
        Long uid = (Long) auth.getPrincipal();
        User u = users.findById(uid).orElseThrow();
        u.setPhone(req.phone());
        users.save(u);
        // Only providers have a public profile; clients can only update their phone
        if (u.getRole() != Role.ROLE_PROVIDER) return response(u, null);
        ProviderProfile p = profiles.findById(uid).orElseGet(() -> { var x = new ProviderProfile(); x.setUser(u); return x; });
        p.setSpecialty(req.specialty()); p.setAddress(req.address()); p.setBio(req.bio()); p.setPricePerVisit(req.pricePerVisit());
        return response(u, profiles.save(p));
    }

    private static ProfileResponse response(User u, ProviderProfile p) {
        return new ProfileResponse(MeResponse.from(u), p == null ? null : ProviderDto.from(p));
    }

    public record ProfileRequest(
        @Size(max = 30, message = "Phone must be at most 30 characters") String phone,
        @Size(max = 100, message = "Specialty must be at most 100 characters") String specialty,
        @Size(max = 255, message = "Address must be at most 255 characters") String address,
        @Size(max = 2000, message = "Bio must be at most 2000 characters") String bio,
        @PositiveOrZero(message = "Price cannot be negative") @Max(value = 100000, message = "Price is too high") Double pricePerVisit) {}

    public record ProfileResponse(MeResponse user, ProviderDto profile) {}
}
