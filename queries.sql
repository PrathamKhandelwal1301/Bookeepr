CREATE TABLE books (
    olid varchar(15) PRIMARY KEY,
    title text NOT NULL,
    dscp text NOT NULL,
    link varchar(80) NOT NULL,
    score numeric NOT NULL,
    rdate date NOT NULL
);

CREATE TABLE notes (
    olid varchar(15) PRIMARY KEY,
    notes text NOT NULL
);