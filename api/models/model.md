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
`updateAt` VARCHAR(20) NOT NULL
) default charset=utf8;


create table forum (
name varchar(20) NOT NULL,
header varchar(20),
cooldown varchar(20),
lock boolean;
) default charset=utf8;