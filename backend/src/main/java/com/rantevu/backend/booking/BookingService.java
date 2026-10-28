package com.rantevu.backend.booking;

import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository repo;

    public BookingService(BookingRepository repo) { this.repo = repo; }

    public List<Booking> findAll() { return repo.findAll(); }
    public Booking findById(Long id) { return repo.findById(id).orElseThrow(); }
    public Booking create(Booking b) { b.setId(null); return repo.save(b); }
    public Booking update(Long id, Booking b) {
        Booking existing = findById(id);
        existing.setName(b.getName());
        existing.setEmail(b.getEmail());
        existing.setDate(b.getDate());
        existing.setTime(b.getTime());
        existing.setJob(b.getJob());
        existing.setNotes(b.getNotes());
        existing.setStatus(b.getStatus());
        return repo.save(existing);
    }
    public void delete(Long id) { repo.deleteById(id); }
}
