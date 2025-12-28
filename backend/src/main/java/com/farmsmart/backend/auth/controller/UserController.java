package com.farmsmart.backend.auth.controller;

import com.farmsmart.backend.auth.dto.request.UpdateUserRoleRequest;
import com.farmsmart.backend.auth.dto.response.UserInfoResponse;
import com.farmsmart.backend.auth.entity.Role;
import com.farmsmart.backend.auth.entity.User;
import com.farmsmart.backend.auth.repository.RoleRepository;
import com.farmsmart.backend.auth.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:5173")
@PreAuthorize("hasAnyRole('OWNER', 'ADMIN')")
public class UserController {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public UserController(UserRepository userRepository, RoleRepository roleRepository) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    @GetMapping
    public ResponseEntity<List<UserInfoResponse>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserInfoResponse> response = users.stream()
                .map(this::mapToUserInfoResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/roles")
    public ResponseEntity<UserInfoResponse> updateUserRoles(@PathVariable UUID id, @RequestBody UpdateUserRoleRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Set<Role> roles = request.getRoles().stream()
                .map(roleName -> roleRepository.findByName(Role.RoleName.valueOf(roleName))
                        .orElseThrow(() -> new IllegalArgumentException("Role not found: " + roleName)))
                .collect(Collectors.toSet());

        user.setRoles(roles);
        userRepository.save(user);

        return ResponseEntity.ok(mapToUserInfoResponse(user));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<UserInfoResponse> toggleUserStatus(@PathVariable UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        user.setEnabled(!user.isEnabled());
        userRepository.save(user);

        return ResponseEntity.ok(mapToUserInfoResponse(user));
    }

    private UserInfoResponse mapToUserInfoResponse(User user) {
        return new UserInfoResponse(
            user.getId(),
            user.getEmail(),
            user.getFirstName(),
            user.getLastName(),
            user.getRoles().stream()
                .map(role -> role.getName().name())
                .collect(Collectors.toSet()),
            user.isTwoFactorEnabled(),
            user.isEnabled()
        );
    }
}
