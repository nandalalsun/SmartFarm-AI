package com.farmsmart.backend.auth.dto.request;

import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.Set;

@Data
@NoArgsConstructor
public class UpdateUserRoleRequest {
    private Set<String> roles;
}
