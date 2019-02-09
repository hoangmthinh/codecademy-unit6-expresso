const express = require('express');
const menuItemsRouter = express.Router({mergeParams: true});
const sqlite3 = require('sqlite3');
const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

menuItemsRouter.param('menuItemId', (req, res, next, menuItemId) => {
    db.get(`select * from MenuItem where id = ${menuItemId}`, (err, menuItem) => {
        if (err) {
            next(err);
        } else if(menuItem){
            next();
        } else {
            res.sendStatus(404);
        }
    });
});

menuItemsRouter.get('/', (req, res, next) => {
    const sql = `select * from MenuItem where menu_id = $menuId`;
    const values = {$menuId: req.params.menuId};

    db.all(sql, values, (err, menuItems) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({menuItems: menuItems});
        }
    })
});

menuItemsRouter.post('/', (req, res, next) => {
    const name = req.body.menuItem.name;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const description = req.body.menuItem.description;
    const menuId = req.params.menuId;

    if(!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    const sql = `insert into MenuItem (name, description, inventory, price, menu_id)
                values ($name, $description, $inventory, $price, $menuId)`;
    const values = {$name: name, 
                    $description: description, 
                    $inventory: inventory, 
                    $price: price, 
                    $menuId: menuId};
    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from MenuItem where id = ${this.lastID}`, (err, menuItem) => {
                res.status(201).json({menuItem: menuItem});
            })
        }
    });
});

menuItemsRouter.put('/:menuItemId', (req, res, next) => {
    const name = req.body.menuItem.name;
    const inventory = req.body.menuItem.inventory;
    const price = req.body.menuItem.price;
    const description = req.body.menuItem.description;
    const menuItemId = req.params.menuItemId;

    if(!name || !inventory || !price) {
        return res.sendStatus(400);
    }

    const sql = `update MenuItem set 
                name = $name, 
                description = $description, 
                inventory = $inventory, 
                price = $price
                where id = $menuItemId`;
    const values = {$name: name, 
                    $description: description, 
                    $inventory: inventory, 
                    $price: price, 
                    $menuItemId: menuItemId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            db.get(`select * from MenuItem where id = ${menuItemId}`, (err, menuItem) => {
                res.status(200).json({menuItem: menuItem});
            })
        }
    });
});

menuItemsRouter.delete('/:menuItemId', (req, res, next) => {
    
    const menuItemId = req.params.menuItemId;

    

    const sql = `delete from MenuItem where id = $menuItemId`;
    const values = {$menuItemId: menuItemId};

    db.run(sql, values, function(err) {
        if (err) {
            next(err);
        } else {
            res.sendStatus(204);
        }
    });
});

module.exports = menuItemsRouter;