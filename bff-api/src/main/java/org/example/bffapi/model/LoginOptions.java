package org.example.bffapi.model;

import lombok.Data;

@Data
public class LoginOptions {
    private final String label;
    private final String loginUri;
    private final boolean isSameAuthority;
}
