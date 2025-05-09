package org.example.bffapi.controller;

import lombok.RequiredArgsConstructor;
import org.example.bffapi.model.LoginOptions;
import org.springframework.boot.autoconfigure.security.oauth2.client.OAuth2ClientProperties;
import org.springframework.http.server.reactive.ServerHttpRequest;
import org.springframework.security.oauth2.core.AuthorizationGrantType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

import java.net.URI;
import java.util.List;
import java.util.Objects;

@RestController
@RequiredArgsConstructor
public class LoginOptionsController {
    private final OAuth2ClientProperties properties;

    @GetMapping("/login-options")
    public Mono<List<LoginOptions>> getLoginOptions(ServerHttpRequest request) {
        URI uri = request.getURI();
        String authority = uri.getAuthority();
        String clientUri = "%s://%s:%d%s".formatted(uri.getScheme(), uri.getHost(), uri.getPort(), request.getPath().contextPath());
        return Mono.just(properties.getRegistration().entrySet().stream()
                .filter(entry -> AuthorizationGrantType.AUTHORIZATION_CODE.getValue().equals(entry.getValue().getAuthorizationGrantType()))
                .map(entry -> {
                    String registrationId = entry.getKey();
                    String label = entry.getValue().getProvider();
                    if (label == null || label.isBlank()) {
                        label = registrationId;
                    }
                    String loginUri = "%s/bff/oauth2/authorization/%s".formatted(clientUri, registrationId);
                    String providerId = entry.getValue().getProvider();
                    String providerIssuerAuthority = null;
                    OAuth2ClientProperties.Provider provider = properties.getProvider().get(providerId);
                    if (provider != null && provider.getIssuerUri() != null) {
                        providerIssuerAuthority = provider.getIssuerUri();
                    }
                    boolean isSameAuthority = Objects.equals(authority, providerIssuerAuthority);
                    return new LoginOptions(label, loginUri, isSameAuthority);
                })
                .toList()
        );
    }
}
