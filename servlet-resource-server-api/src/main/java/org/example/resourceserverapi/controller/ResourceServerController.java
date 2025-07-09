package org.example.resourceserverapi.controller;

import org.example.resourceserverapi.model.UserInfoDto;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ResourceServerController {

    @GetMapping("/me")
    public ResponseEntity<UserInfoDto> me(JwtAuthenticationToken authentication) {
        var jwt = (Jwt) authentication.getPrincipal();
        var claims = jwt.getClaims();
        assert jwt.getExpiresAt() != null;
        return ResponseEntity.ok(new UserInfoDto(
                (String) claims.get("name"),
                (String) claims.get("email"),
                authentication.getAuthorities().stream()
                        .map(GrantedAuthority::getAuthority)
                        .toList(),
                jwt.getExpiresAt().toEpochMilli()
        ));
    }
}
