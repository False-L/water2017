CREATE TABLE `threads` (
`id` INT(5) UNSIGNED NOT NULL AUTO_INCREMENT primary key,
`uid` INT(5) UNSIGNED NOT NULL,
`name` VARCHAR(20) NOT NULL,
`email` VARCHAR(20) NOT NULL,
`title` varchar(50) NOT NULL,
`content` varchar(100) NOT NULL,
`image` varchar(20) NOT NULL,
`thumb` varchar(20),
`lock` BOOLEAN,
`sage` BOOLEAN,
`ip` VARCHAR(20) NOT NULL,
`forum` VARCHAR(20) NOT NULL,
`parent` VARCHAR(20) NOT NULL,
`createdAt` VARCHAR(20) NOT NULL,
`updatedAt` VARCHAR(20) NOT NULL
) ENGINE = MYISAM;


create table forum (
id INT(5) UNSIGNED NOT NULL AUTO_INCREMENT primary key,
name varchar(20) NOT NULL,
header varchar(20),
cooldown varchar(20),
createdAttimestamp NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
`lock` boolean
) default charset=utf8;

insert into forum value (null,'dnf','haowan',20,null,1)

create table user (
access enum,
name varchar(20),
password varchar(20),
salt varchar(20)
) default charset=utf8;

create table setting (
key varchar(255),
value varchar(255)
) default charset=utf8;