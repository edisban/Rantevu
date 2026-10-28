package com.rantevu.backend.booking;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
public class BookingController {

    private final BookingService service;

    public BookingController(BookingService service) { this.service = service; }

    @GetMapping
    public List<Booking> all() { return service.findAll(); }

    @GetMapping("/{id}")
    public Booking one(@PathVariable Long id) { return service.findById(id); }

    @PostMapping
    public Booking create(@RequestBody Booking b) { return service.create(b); }

    @PutMapping("/{id}")
    public Booking update(@PathVariable Long id, @RequestBody Booking b) { return service.update(id, b); }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) { service.delete(id); return ResponseEntity.noContent().build(); }
}
