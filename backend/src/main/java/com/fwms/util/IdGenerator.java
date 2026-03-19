package com.fwms.util;

import com.fwms.repository.UserRepository;
import org.springframework.stereotype.Component;

import java.security.SecureRandom;

@Component
public class IdGenerator {

    private final UserRepository userRepository;
    private final SecureRandom random = new SecureRandom();

    public IdGenerator(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public String generateFarmerId() {
        String id;
        do {
            id = "FRM-" + String.format("%04d", random.nextInt(9000) + 1000);
        } while (userRepository.existsByUserId(id));
        return id;
    }

    public String generateWorkerId() {
        String id;
        do {
            id = "WRK-" + String.format("%04d", random.nextInt(9000) + 1000);
        } while (userRepository.existsByUserId(id));
        return id;
    }
}
