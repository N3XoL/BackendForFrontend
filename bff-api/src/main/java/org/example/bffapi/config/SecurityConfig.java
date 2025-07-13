package org.example.bffapi.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity;
import org.springframework.security.config.web.server.SecurityWebFiltersOrder;
import org.springframework.security.config.web.server.ServerHttpSecurity;
import org.springframework.security.oauth2.client.oidc.web.server.logout.OidcClientInitiatedServerLogoutSuccessHandler;
import org.springframework.security.oauth2.client.registration.ReactiveClientRegistrationRepository;
import org.springframework.security.web.server.SecurityWebFilterChain;
import org.springframework.security.web.server.authentication.ServerAuthenticationSuccessHandler;
import org.springframework.security.web.server.authentication.logout.ServerLogoutSuccessHandler;
import org.springframework.security.web.server.csrf.CookieServerCsrfTokenRepository;
import org.springframework.security.web.server.csrf.ServerCsrfTokenRequestAttributeHandler;
import org.springframework.security.web.server.util.matcher.ServerWebExchangeMatchers;
import org.springframework.web.server.WebFilter;

import java.net.URI;

@Slf4j
@Configuration
@RequiredArgsConstructor
@EnableWebFluxSecurity
public class SecurityConfig {
    private static final String POST_LOGIN_REDIRECT_URI_PARAM = "post_login_redirect_uri";
    private static final String POST_LOGIN_REDIRECT_URI_SESSION_ATTRIBUTE = "post_login_redirect_uri_attribute";
    private static final String DEFAULT_REDIRECT_URI = "http://host.docker.internal:888/react-ui/login-callback.html";

    private final ReactiveClientRegistrationRepository clientRegistrationRepository;

    @Bean
    @Order(1)
    public SecurityWebFilterChain securityFilterChain(ServerHttpSecurity http) {
        http
                .addFilterAt(postLoginWebFilter(), SecurityWebFiltersOrder.FIRST)
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
                .oauth2Login(oAuth2LoginSpec -> oAuth2LoginSpec
                        .authenticationSuccessHandler(redirectServerAuthenticationSuccessHandler()))
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

    @Bean
    public WebFilter postLoginWebFilter() {
        return (exchange, chain) -> {
            String postLoginRedirectUri = exchange.getRequest().getQueryParams().getFirst(POST_LOGIN_REDIRECT_URI_PARAM);
            if (postLoginRedirectUri != null && !postLoginRedirectUri.isBlank()) {
                return exchange.getSession().doOnSuccess(session -> session.getAttributes().put(POST_LOGIN_REDIRECT_URI_SESSION_ATTRIBUTE, postLoginRedirectUri)
                ).then(chain.filter(exchange));
            }
            return chain.filter(exchange);
        };
    }

    private ServerAuthenticationSuccessHandler redirectServerAuthenticationSuccessHandler() {
        return (webFilterExchange, authentication) -> webFilterExchange.getExchange().getSession().flatMap(webSession -> {
            String postLoginRedirectUri = (String) webSession.getAttributes().remove(POST_LOGIN_REDIRECT_URI_SESSION_ATTRIBUTE);
            if (postLoginRedirectUri != null && !postLoginRedirectUri.isBlank()) {
                webSession.getAttributes().remove(POST_LOGIN_REDIRECT_URI_SESSION_ATTRIBUTE);
                webFilterExchange.getExchange().getResponse().setStatusCode(HttpStatus.FOUND);
                webFilterExchange.getExchange().getResponse().getHeaders().setLocation(URI.create(String.format("%s?%s=%s", DEFAULT_REDIRECT_URI, POST_LOGIN_REDIRECT_URI_PARAM, postLoginRedirectUri)));
                return webFilterExchange.getExchange().getResponse().setComplete();
            }
            webFilterExchange.getExchange().getResponse().setStatusCode(org.springframework.http.HttpStatus.FOUND);
            webFilterExchange.getExchange().getResponse().getHeaders().setLocation(URI.create(DEFAULT_REDIRECT_URI));
            return webFilterExchange.getExchange().getResponse().setComplete();
        });
    }

    private ServerLogoutSuccessHandler oidcLogoutSpec() {
        return (exchange, authentication) -> {
            OidcClientInitiatedServerLogoutSuccessHandler handler = new OidcClientInitiatedServerLogoutSuccessHandler(clientRegistrationRepository);
            handler.setPostLogoutRedirectUri("{baseUrl}/react-ui");
            String postLogoutRedirectUri = exchange.getExchange().getRequest().getHeaders().getFirst("X-Post-Logout-Redirect-Uri");
            if (postLogoutRedirectUri != null && !postLogoutRedirectUri.isBlank()) {
                handler.setPostLogoutRedirectUri(postLogoutRedirectUri);
            }
            return handler.onLogoutSuccess(exchange, authentication);
        };
    }
}
