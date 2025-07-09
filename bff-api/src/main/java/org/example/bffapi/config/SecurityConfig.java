package org.example.bffapi.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.RedirectServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import reactor.core.publisher.Mono;

@Configuration
@RequiredArgsConstructor
@EnableWebFluxSecurity
public class SecurityConfig {
    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    @Bean
    @Order(1)
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
        http
                .securityMatcher(ServerWebExchangeMatchers.pathMatchers(
                        "/api/**", "/logout/**", "/login/**", "/oauth2/**"
                ))
                .authorizeExchange(authorize -> authorize
                        .pathMatchers(
                                "/logout/connect/back-channel/**",
                                "/error",
                                "/login/**",
                                "/oauth2/**"
                        ).permitAll()
                        .anyExchange().authenticated()
                )
                .csrf(csrfSpec -> csrfSpec
                        .csrfTokenRepository(CookieServerCsrfTokenRepository.withHttpOnlyFalse())
                        .csrfTokenRequestHandler(new ServerCsrfTokenRequestAttributeHandler()))
                .logout(logoutSpec -> logoutSpec
                        .logoutSuccessHandler(oidcLogoutSpec()))
                .oauth2Login(oAuth2LoginSpec -> oAuth2LoginSpec.authenticationSuccessHandler(
                        new RedirectServerAuthenticationSuccessHandler("http://host.docker.internal:888/react-ui/login-callback.html")
                ))
                .oidcLogout(oidcLogoutSpec ->
                        oidcLogoutSpec.backChannel(backChannelLogoutConfigurer -> backChannelLogoutConfigurer
                                .logoutUri("{baseUrl}/bff/logout/connect/back-channel/{registrationId}")));
        return http.build();
    }

    @Bean
    @Order(2)
    public SecurityWebFilterChain resourceServerSecurityFilterChain(ServerHttpSecurity http) {
        http
                .oauth2ResourceServer(oauth2 -> oauth2.jwt(Customizer.withDefaults()))
                .authorizeExchange(authorize -> authorize
                        .pathMatchers(
                                "/login-options",
                                "/error",
                                "/actuator/**",
                                "/actuator/health/readiness",
                                "/actuator/health/liveness"
                        ).permitAll()
                        .anyExchange().authenticated());
        return http.build();
    }

    private ServerLogoutSuccessHandler oidcLogoutSpec() {
        OidcClientInitiatedServerLogoutSuccessHandler handler = new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
        handler.setPostLogoutRedirectUri("{baseUrl}/react-ui");
        return (exchange, authentication) -> handler.onLogoutSuccess(exchange, authentication)
                .then(Mono.fromRunnable(() -> exchange.getExchange().getResponse().setStatusCode(HttpStatus.CREATED)));
    }
}
