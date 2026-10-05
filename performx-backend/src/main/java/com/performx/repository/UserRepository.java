package com.performx.repository;

import com.performx.model.*;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmailIgnoreCase(String email);
    Optional<User> findByEmployeeCodeIgnoreCase(String code);
    long countByActiveTrue();
    long countByRole(Entities.Role role);
    List<User> findAllByOrderByNameAsc();
}
