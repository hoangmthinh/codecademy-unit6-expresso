const express = require('express');
const menusRouter = express.Router();

const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

const menuItemsRouter = require('./menu-items');

const checkId = (req, res, next, id) => {
    db.get(`select * from Menu where id = ${id}`, (err, menu) => {
        if (err) {
            next(err);
        } else if(menu){
            req.menu = menu;
            next();
        } else {
            res.sendStatus(404);
        }
    })
};

menusRouter.param('id', checkId);
menusRouter.param('menuId', checkId);


menusRouter.use('/:menuId/menu-items', menuItemsRouter);

menusRouter.get('/', (req, res, next) => {
    db.all(`select * from Menu`, (err, menus) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menus: menus});
        }
    });
});

menusRouter.get('/:id', (req, res, next) => {
    res.status(200).json({menu: req.menu});
});

menusRouter.post('/', (req, res, next) => {
    const title = req.body.menu.title;

    if(!title) {
        return res.sendStatus(400);
    }

    const sql = `insert into Menu (title) values ($title)`;
    const values = {$title: title};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Menu where id = ${this.lastID}`, (err, menu) => {
                res.status(201).json({menu: menu});
            })
        }
    });
    
});

menusRouter.put('/:id', (req, res, next) => {
    const title = req.body.menu.title;

    if(!title) {
        return res.sendStatus(400);
    }

    const sql = `update Menu set title = $title where id = $id`;
    const values = {$title: title, $id: req.params.id};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from Menu where id = ${req.params.id}`, (err, menu) => {
                res.status(200).json({menu: menu});
            })
        }
    });
    
});

menusRouter.delete('/:id', (req, res, next) => {
    const menuItemSql = `select * from MenuItem where menu_id = $menuId`;
    const menuValues = {$menuId: req.params.id};

    db.get(menuItemSql, menuValues, (err, menuItem) => {
        if (err) {
            next(err);
        } else if (menuItem){
            res.sendStatus(400);
        } else {
            const sql = `delete from Menu where id = $menuId`;
            db.run(sql, menuValues, (err) => {
                if (err) {
                    next(err);
                } else {
                    res.sendStatus(204);
                }
            });
        }
    });

});


module.exports = menusRouter;