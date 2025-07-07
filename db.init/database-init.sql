create schema if not exists dbreactive;

create table dbreactive.some_entity
(
    id int auto_increment primary key,
    entityKey   varchar(255) null,
    entityValue varchar(255) null
);