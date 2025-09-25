/*
    i can add a manwha to the library for quick access;

    what happens after i tap on the manhwa card?
    - i will see the manhwa name
    - i will see the manwha status
    - i will see the manhwa rating
    - i will see the manhwa summary
    - i will see the manwha chapters
    - i will see a continue or start button
    - the manwha that has been read will be dull

    How will i structure the library data ?
    
*/

/*
    other features
    when i tap , it will get the date of the latest manwha and the current date; if the difference is more than a week; it will append the chapters that are not there
*/

// updateOne({name:""},{$set:{fullTime:true}})
// set fulltime = true where name = ""
require("dotenv").config();
const { MongoClient } = require("mongodb");

let db;


connectDB();

const addOne = async () => {
  db.collection("library").insertOne({
    namee: "Iruo",
  });
};
