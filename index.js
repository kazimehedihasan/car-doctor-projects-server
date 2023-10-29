const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId,  } = require('mongodb');
require('dotenv').config()
const app = express();
const port =process.env.PORT || 5000;
// middleware 
app.use(cors());
app.use(express.json());






const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.jkcpjnv.mongodb.net/?retryWrites=true&w=majority`;



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

//code 
const serviceCollection = client.db('carDoctor').collection('services');


const CheckOutCollection = client.db('carDoctor').collection('checkout');
// all data lod home page a
app.get('/services', async(req, res) => {
const cursor = serviceCollection.find();
const result = await cursor.toArray();
res.send(result);
})

// home page theke click korle lod hobe
app.get('/services/:id', async (req, res) => {
const id = req.params.id;
const query = {_id: new ObjectId(id)}
const options = {
  projection: { title: 1, price: 1, service_id: 1 , img: 1},
};
const result = await serviceCollection.findOne(query, options);
res.send(result)
})


// CheckOut data mongoose a add korar jonno clint sit a theke 
app.post('/checkout', async (req, res) => {
  const Check = req.body;
  const result = await CheckOutCollection.insertOne(Check);
  res.send(result);
},[])

// add korar kore dekhabo
app.get('/checkout', async (req, res) => {
  console.log(req.query.email);
  let query = {}
  if (req.query?.email) {
    query ={email:req.query.email}
  }
  const result = await CheckOutCollection.find(query).toArray();
  res.send(result);
})

// delete 
app.delete('/checkout/:id', async (req, res) => {
  const id = req.params.id;
  const query = {_id: new ObjectId(id)};
  const result = await CheckOutCollection.deleteOne(query);
  res.send(result);
}) 

//  updete
app.patch('/checkout/:id', async(req, res)=>{
  const id = req.params.id;
  const filter = {_id: new ObjectId(id)};
const updeteCheckout = req.body;
console.log(updeteCheckout);
const updeteDoc = {
  $set:{
    status:updeteCheckout.status
  },
};
const result = await CheckOutCollection.updeteOne(filter, updeteDoc);
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









app.get('/', (req, res) => {
    res.send('docter is running')
})
app.listen(port, () => {
console.log(`car docter server is running on port ${port}`);
})