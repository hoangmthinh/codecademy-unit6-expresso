const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || ('./database.sqlite'));


db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS Employee (
        id Integer not null primary key,
        name Text not null,
        position Text not null,
        wage Integer not null,
        is_current_employee Integer not null default 1
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Timesheet (
        id Integer not null primary key,
        hours Integer not null,
        rate Integer not null,
        date Integer not null,
        employee_id Integer not null,
        foreign key(employee_id) references Employee(id)
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS Menu (
        id Integer not null primary key,
        title Text not null
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS MenuItem (
        id Integer not null primary key,
        name Text not null,
        description Text,
        inventory Integer not null,
        price Integer not null,
        menu_id Integer not null,
        foreign key(menu_id) references Menu(id)
    )`);

    
});