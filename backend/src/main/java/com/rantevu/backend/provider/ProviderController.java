package com.rantevu.backend.provider;

import com.rantevu.backend.user.UserRepository;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/providers")
public class ProviderController {
    private final UserRepository users;
    private final ProviderProfileRepository profiles;
    public ProviderController(UserRepository users, ProviderProfileRepository profiles) { this.users = users; this.profiles = profiles; }

    @GetMapping
    public List<ProviderProfile> all() { return profiles.findAll(); }
}
