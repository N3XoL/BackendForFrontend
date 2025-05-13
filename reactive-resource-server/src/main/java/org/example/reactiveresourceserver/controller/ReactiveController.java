package org.example.reactiveresourceserver.controller;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.example.reactiveresourceserver.model.SomeEntity;
import org.example.reactiveresourceserver.repository.SomeEntityRepository;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Flux;
import reactor.core.publisher.Mono;
import reactor.core.publisher.Sinks;
import reactor.util.concurrent.Queues;

import java.util.concurrent.atomic.AtomicLong;

@Slf4j
@RestController
@RequiredArgsConstructor
public class ReactiveController {
    private final SomeEntityRepository someEntityRepository;
    private final Sinks.Many<SomeEntity> someEntitySink = Sinks.many().multicast().onBackpressureBuffer(Queues.SMALL_BUFFER_SIZE, false);
    private final AtomicLong counter = new AtomicLong();

    @PostMapping("/create")
    @PreAuthorize("hasRole('ADMIN')")
    public Mono<SomeEntity> create(@RequestBody SomeEntity someEntity) {
        return someEntityRepository.save(someEntity)
                .doOnSuccess(entity -> someEntitySink.tryEmitNext(someEntity));
    }

    @GetMapping(value = "/get-all", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public Flux<ServerSentEvent<SomeEntity>> getAll() {
        log.info("Starting SSE");
        return Flux.concat(someEntityRepository.findAll(), someEntitySink.asFlux())
                .map(entity -> {
                    String eventId = (entity.getId() != null) ? entity.getId().toString() : String.valueOf(counter.getAndIncrement());
                    return ServerSentEvent.<SomeEntity>builder()
                            .id(eventId)
                            .event("sink-event")
                            .data(entity)
                            .build();
                });
    }
}