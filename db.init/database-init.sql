create schema if not exists reactivedb;

create table reactivedb.some_entity
(
    id int auto_increment primary key,
    entityKey   varchar(255) null,
    entityValue varchar(255) null
);