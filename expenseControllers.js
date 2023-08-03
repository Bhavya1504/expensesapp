const jwt = require('jsonwebtoken');
const Expense = require("../model/expensemodel");
const User = require('../model/userModel');
const sequelize = require('../util/db');

const secretKey = "secretKey";

module.exports.postExpenseController = async (req, res) => {
    const t = await sequelize.transaction();
    console.log(req.body);
    req.token = req.body.token;
    jwt.verify(req.token, secretKey, async (err, data) => {
        try {
            if (err) {
                console.log(err);
                res.json({
                    message: 'invalid token'
                })
            }
            else {
                req.body.UserId = data.user.userId
                let wait_result = await Expense.create(req.body, { transaction: t })
                let wait_user_result = await User.findAll({
                    where: {
                        id: req.body.UserId
                    }
                })
                console.log(`res  data ex`);
                console.log(wait_user_result);
                console.log(wait_user_result[0].total_expenses);
                console.log(Number.parseInt(wait_user_result[0].total_expenses));
                let sum = Number.parseInt(req.body.expenseInput) + Number.parseInt(wait_user_result[0].total_expenses);
                console.log(req.body.expenseInput);
                console.log(`sum--`);
                console.log(sum);
                console.log(req.body);
                let wait_user_update = await User.update(
                    { total_expenses: sum },
                    {
                        where: {
                            id: req.body.UserId,
                        }, transaction: t
                    })
                console.log(wait_user_update)
                await t.commit();
                res.json({ data: wait_result })
            }
        } catch (error) {
            console.log(error);
            await t.rollback();
        }
    })
};

module.exports.getExpenseController = (req, res) => {
    console.log(`Customer details are: `);
    console.clear();
    console.log(req.token);
    jwt.verify(req.token, secretKey, (err, data) => {
        if (err) {
            console.log(err);
            res.json({
                message: 'invalid token'
            })
        }
        else {
            console.log(data);
            console.log(data.UserId);
            Expense.findAll({
                where: {
                    UserId: data.user.userId
                }
            })
                .then(result => {
                    console.log(result);
                    res.json(result);
                })
                .catch(err => console.log(err));
        }
    })
};

module.exports.deleteExpenseController = (req, res) => {
    console.log(req.token);
    console.log(req.params.id);
    jwt.verify(req.token, secretKey, async (err, data) => {
        const t = await sequelize.transaction();
        try {
            if (err) {
                console.log(err);
                res.json({
                    message: 'invalid token'
                })
            }
            else {
                const delete_data_expense= await Expense.findAll({where:{id: req.params.id,UserId: data.user.userId}})
                const delete_data = await Expense.destroy({
                    where: {
                        id: req.params.id,
                        UserId: data.user.userId
                    }, transaction: t
                })
                let wait_user_result = await User.findAll({
                    where: {
                        id: data.user.userId
                    }
                })
                let sum = Number.parseInt(wait_user_result[0].total_expenses) - Number.parseInt(delete_data_expense[0].expenseInput);
                console.log(sum);
                let wait_user_update_expense = await User.update(
                    { total_expenses: sum },
                    {
                        where: {
                            id: data.user.userId,
                        }, transaction: t
                    })
                console.log(`wait_user_update_expense`);
                console.log(wait_user_update_expense);
                res.json(delete_data);
                t.commit();
            }
        } catch (error) {
            console.log(error);
            t.rollback();
        }
    })
};

// for validata token
// const validateToken = (req, res, next) => {
//     const token = req.headers['authorization'];
//     if (typeof token !== "undefined") {
//         req.token = token;
//         next();
//     }
//     else {
//         res.status(403).send({ message: 'invalid authentication' })
//     }
// }
// app.get('/jwt', validateToken, (req, res) => {
//     console.log(req.token);
//     jwt.verify(req.token, secretKey, (err, data) => {
//         if (err) {
//             console.log(err);
//             res.json({
//                 message: 'invalid token'
//             })
//         }
//         else {
//             res.json({
//                 message: 'profile accessed',
//                 data
//             })
//         }
//     })
// })