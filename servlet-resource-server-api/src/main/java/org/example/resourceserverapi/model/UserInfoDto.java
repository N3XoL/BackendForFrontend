package org.example.resourceserverapi.model;

import lombok.Data;

import java.util.List;

@Data
public class UserInfoDto {
    private final String name;
    private final String email;
    private final List<String> authorities;
    private final Long exp;
}
