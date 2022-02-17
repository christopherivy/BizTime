const express = require("express");
const slugify = require("slugify");
const ExpressError = require("../expressError")
const db = require("../db");

const router = express.Router();

/* -------------------------------
    GET ROUTES
--------------------------------- */

// get all companies
router.get('/', async(req, res, next) => {
    try {
        const results = await db.query(`SELECT * FROM companies`)
        return res.json({ companies: results.rows })
    } catch (e) {
        return next(e)
    }
})

// get company by code
router.get('/:code', async(req, res, next) => {
    try {
        const { code } = req.params;

        // this is the row im returning
        const compResult = await db.query(`SELECT code, name FROM comapnies WHERE code=$1`, [code])

        // this is the row im returning
        const invResult = await db.query(`SELECT id FROM invoices WHERE comp_code = $1 `, [code])

        if (compResult.rows.length === 0) {
            throw new ExpressError(`Can't find company with code ${code}`, 404)
        }
        const company = compResult.rows[0]
        const invoices = invResult.rows[0]

        return res.send({ company: company })
    } catch (e) {
        return next(e)
    }
})


/* -------------------------------
    POST ROUTES
--------------------------------- */
// add a company
router.post('/', async(req, res, next) => {
    try {
        const { name, description } = req.body
        const code = slugify(name, { lower: true });

        const results = await db.query('INSERT INTO companies (code, name, description) VALUES ($1, $2, $3) RETURNING code, name, description', [code, name, description])
        return res.status(201).json({ "company": results.rows[0] })
    } catch (e) {
        return next(e)
    }
})


/* -------------------------------
    PUT ROUTES
--------------------------------- */
// edit a company
router.put('/', async(req, res, next) => {
    try {
        const { name, description } = req.body
        const { code } = req.body
        const result = await db.query(`UPDATE companies SET name=$1, description =$2, WHERE code = $3 RETURNING code, name, description`, [name, description, code])

        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code ${code}`, 404)
        } else {
            return res.json({ "company": result.rows[0] })
        }
    } catch (e) {
        return next(e)
    }
})


router.delete('/:code', async(req, res, next) => {
    try {
        const { code } = req.params

        const result = await db.query(`DELETE FROM companies WHERE code=$1 RETURNING code`, [code])
        if (result.rows.length === 0) {
            throw new ExpressError(`Can't find company with code ${code}`, 404)
        } else {
            return res.json({ "status": "deleted" })
        }
    } catch (e) {
        return next(e)
    }
})

module.exports = router;