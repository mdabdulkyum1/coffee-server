const express = require('express');
require('dotenv').config()
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const USER = process.env.USER;
const PASS = process.env.KEY;

const uri = `mongodb+srv://${USER}:${PASS}@cluster0.kzmhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const coffeeCollections = client.db("coffeesDB").collection("coffees");


    app.post('/coffees', async(req, res)=>{
        const coffeesInfo = req.body;
        const result = await coffeeCollections.insertOne(coffeesInfo);
        res.send(result);
    });

    app.get('/coffees', async (req, res)=>{
        const cursor = await coffeeCollections.find().toArray();
        res.send(cursor);
    });
    app.get('/coffees/:id', async (req, res)=> {
        const id = req.params.id;
        const query = {_id: new ObjectId(id)};
        const result = await coffeeCollections.findOne(query);
        res.send(result || {});
    })
    app.put('/coffees/:id', async (req, res)=>{
      const id = req.params.id;
      const coffeeInfo = req.body;
      const {name, chef, supplier, taste, category, details, price, photo} = coffeeInfo;
      const filter = {_id: new ObjectId(id)}
      const options = { upsert: true }; 
      const updateCoffee = {
        $set: {
          coffeeName:name,
            chef,
            supplier,
            taste,
            category,
            details,
            price,
            photo
        }
      }
      const result = await coffeeCollections.updateOne(filter, updateCoffee, options);
      res.send(result);
    })
    app.delete('/coffees/:id', async (req, res)=> {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }
        const result = await coffeeCollections.deleteOne(query);
        res.send(result);
    })
    





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);



app.get('/', (req, res)=> {
    res.send("Coffee server is running");
})

app.listen(port, ()=> {
    console.log(`Server running on PORT:${port}`)
})
