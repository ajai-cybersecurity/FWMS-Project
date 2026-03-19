package com.fwms.config;

import com.fwms.model.Task;
import com.fwms.model.User;
import com.fwms.repository.TaskRepository;
import com.fwms.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDate;

@Configuration
public class DataSeeder {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    @Bean
    CommandLineRunner seedDatabase(UserRepository userRepo,
                                   TaskRepository taskRepo,
                                   PasswordEncoder encoder) {
        return args -> {
            if (userRepo.count() > 0) {
                log.info("Database already seeded — skipping.");
                return;
            }
            log.info("Seeding demo data...");

            User admin = userRepo.save(User.builder()
                .fullName("System Admin")
                .email("admin@fwms.com")
                .phone("9000000000")
                .password(encoder.encode("admin123"))
                .role(User.Role.ADMIN)
                .userId("ADM-0001")
                .address("FWMS HQ, New Delhi")
                .build());

            User farmer1 = userRepo.save(User.builder()
                .fullName("Ravi Kumar")
                .email("ravi@farmer.com")
                .phone("9876543210")
                .password(encoder.encode("farmer123"))
                .role(User.Role.FARMER)
                .userId("FRM-0001")
                .address("Thanjavur, Tamil Nadu")
                .build());

            User farmer2 = userRepo.save(User.builder()
                .fullName("Priya Devi")
                .email("priya@farmer.com")
                .phone("9876543211")
                .password(encoder.encode("farmer123"))
                .role(User.Role.FARMER)
                .userId("FRM-0002")
                .address("Coimbatore, Tamil Nadu")
                .build());

            User worker1 = userRepo.save(User.builder()
                .fullName("Arjun Singh")
                .email("arjun@worker.com")
                .phone("9123456789")
                .password(encoder.encode("worker123"))
                .role(User.Role.WORKER)
                .userId("WRK-0001")
                .skills("Harvesting,Planting,Irrigation")
                .address("Madurai, Tamil Nadu")
                .build());

            User worker2 = userRepo.save(User.builder()
                .fullName("Sunita Bai")
                .email("sunita@worker.com")
                .phone("9123456790")
                .password(encoder.encode("worker123"))
                .role(User.Role.WORKER)
                .userId("WRK-0002")
                .skills("Weeding,Pruning,Transplanting")
                .address("Salem, Tamil Nadu")
                .build());

            taskRepo.save(Task.builder()
                .title("Rice Harvesting – 5 Acres")
                .description("Need 3 experienced harvesters for paddy field. Tools provided.")
                .location("Thanjavur, Tamil Nadu")
                .date(LocalDate.now().plusDays(3))
                .wage(650.0)
                .farmer(farmer1)
                .worker(worker1)
                .status(Task.TaskStatus.IN_PROGRESS)
                .build());

            taskRepo.save(Task.builder()
                .title("Sugarcane Planting")
                .description("Planting season for 2 acres of sugarcane. Experience preferred.")
                .location("Coimbatore, Tamil Nadu")
                .date(LocalDate.now().plusDays(7))
                .wage(500.0)
                .farmer(farmer2)
                .status(Task.TaskStatus.PENDING)
                .build());

            taskRepo.save(Task.builder()
                .title("Vegetable Garden Weeding")
                .description("Weekly weeding for 1-acre tomato/brinjal garden.")
                .location("Salem, Tamil Nadu")
                .date(LocalDate.now().plusDays(1))
                .wage(400.0)
                .farmer(farmer1)
                .status(Task.TaskStatus.PENDING)
                .build());

            taskRepo.save(Task.builder()
                .title("Drip Irrigation Setup")
                .description("Install drip irrigation system for 3-acre onion crop.")
                .location("Erode, Tamil Nadu")
                .date(LocalDate.now().plusDays(5))
                .wage(800.0)
                .farmer(farmer2)
                .status(Task.TaskStatus.PENDING)
                .build());

            taskRepo.save(Task.builder()
                .title("Banana Pruning & Maintenance")
                .description("Completed maintenance pruning for 2 acres of banana plantation.")
                .location("Trichy, Tamil Nadu")
                .date(LocalDate.now().minusDays(2))
                .wage(550.0)
                .farmer(farmer1)
                .worker(worker2)
                .status(Task.TaskStatus.COMPLETED)
                .build());

            log.info("Demo seed complete — Admin: admin@fwms.com/admin123 | Farmer: FRM-0001/farmer123 | Worker: WRK-0001/worker123");
        };
    }
}
