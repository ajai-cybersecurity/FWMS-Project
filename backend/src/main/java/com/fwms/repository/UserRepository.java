package com.fwms.repository;

import com.fwms.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByUserId(String userId);

    // Login by identifier (userId OR phone)
    default Optional<User> findByUserIdOrPhone(String identifier) {
        Optional<User> byId = findByUserId(identifier);
        return byId.isPresent() ? byId : findByPhone(identifier);
    }

    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    boolean existsByUserId(String userId);

    List<User> findByRole(User.Role role);
    long countByRole(User.Role role);

    @org.springframework.data.jpa.repository.Query(
        "SELECT MONTH(u.createdAt), u.role, COUNT(u) FROM User u WHERE YEAR(u.createdAt) = :year AND u.role <> com.fwms.model.User.Role.ADMIN GROUP BY MONTH(u.createdAt), u.role")
    List<Object[]> countRegistrationsByMonth(int year);
}
