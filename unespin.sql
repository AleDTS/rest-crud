create database if not exists unespin;
use unespin;

drop table if exists Evento;
drop table if exists Organizacao;
drop table if exists Local;
drop trigger if exists t1;

create table Organizacao(
  nome_org  varchar(30) not null,
  id_org  integer not null,
  categoria varchar(30) default 'Outro',
  primary key(id_org)
);

create table Local(
  nome_local  varchar(30) not null,
  id_local  integer not null,
  capacidade  integer,
  endereco  varchar(100),
  primary key(id_local),
  check(capacidade>0)
);

create table Evento (
  id  integer not null AUTO_INCREMENT,
  nome  varchar(50) not null,
  data  date  not null,
  hora_inicio time  not null,
  link_facebook varchar(50),
  responsavel varchar(50) not null,
  org_responsavel integer  not null,
  categoria varchar(30) default 'Outro',
  local_evento  integer not null,
  descricao varchar(1000),
  primary key(id),
  foreign key(local_evento) references Local(id_local),
  foreign key(org_responsavel)  references Organizacao(id_org)
);

insert into Organizacao values
  ("CAADA",1,"CA"),
  ("Jr.com",2,"JR")
;

insert into Local values
  ("Guilhermao",1,5000, ''),
  ("Sala 1",2,200, '')
;

insert into Evento values
  (   1,
      "Assembleia CAADA",
      "2017-07-12",
      "14:00:00",
      "",
      "Fulano",
      1,
      "",
      "Sala 1",
      ""
  ),
    (   2,
      "Jornada da informatica",
      "2017-07-13",
      "14:00:00",
      "",
      "Ciclano",
      2,
      "",
      "Guilhermao",
      ""
  )
;

create trigger t1 before insert on Evento
for each row
begin
  if (exists(
    select id
    from Evento as E
    where new.data = E.data and
          new.hora_inicio = E.hora_inicio and
          new.local_evento = E.local_evento
  )) then
    signal sqlstate value '45000' set message_text = 'Nao podem haver 2 ou mais eventos no mesmo horario no mesmo lugar';
  end if;
end;

# select data, nome, local_evento, categoria
# from Evento
# where nome like '%assembleia%'

# select data, nome, local_evento, categoria
# from Evento
# where local_evento like '%guilherm%'
#

# select E.data, E.nome, E.local_evento, E.categoria
# from Evento as E, Organizacao as O
# where O.id = E.org_responsavel and
#       O. nome like '%Jr%'

# insert into Organizacao values("CEUB",3,"");
# insert into Local values("Bosque", 3,1000, "");
