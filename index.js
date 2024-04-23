import express from "express";
import pg from "pg";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { dirname } from "path";

const port = 3000;
const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new pg.Client({
    user : "postgres",
    host : "localhost",
    database : "",
    password : "",
    port : 5432
});
const app = express();

app.use(bodyParser.urlencoded({ extended : true }));
app.use(express.static("public"));

db.connect();
async function checkBooks(i){
    let books = [];
    if(i == 1){
        const result = await db.query("SELECT * FROM books ORDER BY title");
        books = result.rows;
    }

    if(i == 2){
        const result = await db.query("SELECT * FROM books ORDER BY rdate DESC");
        books = result.rows;
    }

    if(i == 3){
        const result = await db.query("SELECT * FROM books ORDER BY score DESC");
        books = result.rows;
    }
    return books;
}

app.get("/",async (req,res) => {
    const params = req.query;
    let books = [];
    if(params.sort){
        books = await checkBooks(params.sort);
    }

    else{
        books = await checkBooks(2);
    }
    books.forEach((book) => {
        book.rdate = book.rdate.toDateString();
        book.rdate = book.rdate.substr(4,book.rdate.length -1);
    })
    res.render(__dirname + "/views/index.ejs",{
        books : books,
    });
})

app.get("/add-book",(req,res) => {
    res.render(__dirname + "/views/addBook.ejs");
})

app.post("/add-book",async(req,res) => {
    const data = req.body;
    try{
        await db.query("INSERT INTO books VALUES ($1,$2,$3,$4,$5,$6)",[data.olid,data.title,data.dscp,data.link,data.score,data.rdate]);
        await db.query("INSERT INTO notes VALUES ($1,$2)",[data.olid,data.notes]);
        res.redirect("/");
    }
    catch(err){
        res.render(__dirname + "/views/addBook.ejs",{
            error : err
        })
    }
})

app.get("/book-notes",async (req,res) => {
    const params = req.query;
    const result = await db.query("SELECT * FROM books JOIN notes ON books.olid = notes.olid WHERE books.olid = $1", [params.id]);
    const book = result.rows;
    book.forEach((book) => {
        book.rdate = book.rdate.toDateString();
        book.rdate = book.rdate.substr(4,book.rdate.length -1);
    })
    res.render(__dirname + "/views/bookNotes.ejs",{
        book : book,
    })
});

app.get("/delete", async(req,res) => {
    try{
        const params = req.query;
        await db.query("DELETE FROM books WHERE olid = $1", [params.olid]);
        await db.query("DELETE FROM notes WHERE olid = $1", [params.olid]);
        res.redirect("/");
    }
    catch(err){
        res.render(__dirname + "/views/index.ejs",{
            error : err,
        })
    }
})

app.get("/update", async(req,res) => {
    try{
        const params = req.query;
        const result = await db.query("SELECT * FROM books JOIN notes ON books.olid = notes.olid WHERE books.olid = $1", [params.olid]);
        const book = result.rows;
        book.forEach((book) => {
            book.rdate = book.rdate.toDateString();
        })
        res.render(__dirname + "/views/updateBook.ejs",{
            book : book,
        })
    }
    catch (err){
        res.render(__dirname + "/views/updateBook.ejs",{
            error : err,
        })
    }
})

app.post("/update-book",async (req,res) => {
    const data = req.body;
    await db.query("UPDATE books SET olid = $1, title = $2, dscp = $3, link = $4, score = $5, rdate = $6 WHERE olid = $1",[data.olid,data.title,data.dscp,data.link,data.score,data.rdate]);
    await db.query("UPDATE notes SET olid = $1, notes = $2 WHERE olid = $1",[data.olid,data.notes]);
    res.redirect("/");
})

app.listen(port,(req,res) => {
    console.log(`server is running on port ${port}`);
})