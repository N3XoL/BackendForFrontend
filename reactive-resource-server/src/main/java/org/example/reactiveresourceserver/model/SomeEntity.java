package org.example.reactiveresourceserver.model;

import lombok.Data;
import org.springframework.data.annotation.Id;
import org.springframework.data.relational.core.mapping.Column;
import org.springframework.data.relational.core.mapping.Table;

@Table("some_entity")
@Data
public class SomeEntity {

    @Id
    private Long id;

    @Column("entityKey")
    private final String entityKey;

    @Column("entityValue")
    private final String entityValue;
}
