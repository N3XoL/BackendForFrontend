package org.example.reactiveresourceserver.repository;

import org.example.reactiveresourceserver.model.SomeEntity;
import org.springframework.data.r2dbc.repository.R2dbcRepository;

public interface SomeEntityRepository extends R2dbcRepository<SomeEntity, Long> {
}
