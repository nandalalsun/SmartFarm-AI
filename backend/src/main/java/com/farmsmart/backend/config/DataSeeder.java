package com.farmsmart.backend.config;

import com.farmsmart.backend.entity.Role;
import com.farmsmart.backend.entity.User;
import com.farmsmart.backend.repository.RoleRepository;
import com.farmsmart.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Collections;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Seed Roles
        if (roleRepository.count() == 0) {
            for (Role.RoleName name : Role.RoleName.values()) {
                roleRepository.save(new Role(name));
            }
        }

        // Seed Admin User
        if (userRepository.count() == 0) {
            Role ownerRole = roleRepository.findByName(Role.RoleName.ROLE_OWNER)
                    .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
            
            User admin = new User();
            admin.setEmail("admin@farmsmart.com");
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setFirstName("Admin");
            admin.setLastName("User");
            admin.setRoles(Collections.singleton(ownerRole));
            
            userRepository.save(admin);
            System.out.println("Default Admin User created: admin@farmsmart.com / admin123");
        }
    }
}
