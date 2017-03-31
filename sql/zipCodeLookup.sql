create table zipCodeLookup (
	id int not null auto_increment, 
	zip varchar(10) not null, 
	neighborhood varchar(50) not null, 
	primary key (id)
);

ALTER TABLE zipCodeLookup CONVERT TO CHARACTER SET latin1 COLLATE 'latin1_swedish_ci';

insert into zipCodeLookup (zip, neighborhood) values ('40206', 'crescent hill');
insert into zipCodeLookup (zip, neighborhood) values ('40205', 'the highlands');
insert into zipCodeLookup (zip, neighborhood) values ('40204', 'the highlands');
insert into zipCodeLookup (zip, neighborhood) values ('40205', 'highlands');
insert into zipCodeLookup (zip, neighborhood) values ('40204', 'highlands');
insert into zipCodeLookup (zip, neighborhood) values ('40041', 'saint matthews');
insert into zipCodeLookup (zip, neighborhood) values ('40207', 'saint matthews');
insert into zipCodeLookup (zip, neighborhood) values ('40222', 'saint matthews');
insert into zipCodeLookup (zip, neighborhood) values ('40220', 'saint matthews');
