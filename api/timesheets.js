const express = require('express');
const timesheetsRouter = express.Router({mergeParams: true});

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

timesheetsRouter.param('timesheetId', (req, res, next, timesheetId) => {
    const sql = `select * from Timesheet where id = $timesheetId`;
    const values = {$timesheetId: timesheetId};

    db.get(sql, values, (err, timesheet) => {
        if (err) {
            next(err);
        } else if (timesheet) {
            req.timesheet = timesheet;
            next();
        } else {
            res.sendStatus(404);
        }
    })
});

timesheetsRouter.get('/', (req, res, next) => {
    const sql = `select * from Timesheet where employee_id = $employeeId`;
    const values = {$employeeId: req.params.employeeId};
    db.all(sql, values, (err, timesheets) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({timesheets: timesheets});
        }
    });
});

timesheetsRouter.post('/', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if(!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    const sql = `insert into Timesheet (hours, rate, date, employee_id) 
                values ($hours, $rate, $date, $employeeId)`;

    const values = {$hours: hours,
                    $rate: rate,
                    $date: date,
                    $employeeId: req.params.employeeId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Timesheet where id = ${this.lastID}`, (err, timesheet) => {
                res.status(201).json({timesheet: timesheet});
            })
        }
    });
});

timesheetsRouter.put('/:timesheetId', (req, res, next) => {
    const hours = req.body.timesheet.hours;
    const rate = req.body.timesheet.rate;
    const date = req.body.timesheet.date;

    if(!hours || !rate || !date) {
        return res.sendStatus(400);
    }

    const sql = `update Timesheet set 
                hours = $hours, 
                rate = $rate, 
                date = $date
                where id = $timesheetId`;

    const values = {$hours: hours,
                    $rate: rate,
                    $date: date,
                    $timesheetId: req.params.timesheetId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Timesheet where id = ${req.params.timesheetId}`, (err, timesheet) => {
                res.status(200).json({timesheet: timesheet});
            })
        }
    });
});

timesheetsRouter.delete('/:timesheetId', (req, res, next) => {
    db.run(`delete from Timesheet where id = ${req.params.timesheetId}`, (err) => {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});


module.exports = timesheetsRouter;