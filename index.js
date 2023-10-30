const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const { MongoClient, ServerApiVersion, ObjectId,  } = require('mongodb');
require('dotenv').config()
const app = express();
const port =process.env.PORT || 5000;
// middleware 
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true
}));

app.use(express.json());
app.use(cookieParser());





const uri = `mongodb+srv://${process.env.BD_USER}:${process.env.BD_PASS}@cluster0.jkcpjnv.mongodb.net/?retryWrites=true&w=majority`;



const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});


//middlewares toiri for me
const logger = async(req, res, next) => {
  console.log('called:', req.host, req.originalUrl);
  next();
}
const verifyToken = async(req, res, next) => {
  const token = req.cookies?.token;
  console.log('vaalue of token in middleware', token);
  if (!token) {
    return res.status(401).send({message: 'not authorized'})
  }
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
    // error
    if (err) {
      console.log(err);
     return res.status(401).send({message: 'unauthorized'})
    }
    // if token is valid then is would be decoded
    console.log('value is the token', decoded);
    req.user = decoded;
    next();
  })
}





async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

//add mongobd
const serviceCollection = client.db('carDoctor').collection('services');

const CheckOutCollection = client.db('carDoctor').collection('checkout');

// auth related methods api
app.post('/jwt', logger, async(req, res) => {
const user = req.body;
console.log(user);
const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, {
  expiresIn: '1h'});
res
.cookie('token', token, {
  httpOnly: true,
  secure: false,
  // sameSite: 'none'
})
.send({success:true})
})












// service api
// all data lod home page a
app.get('/services', logger, async(req, res) => {
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
app.post('/checkout', logger, async (req, res) => {
  const Check = req.body;
  const result = await CheckOutCollection.insertOne(Check);
  res.send(result);
},[])

// add korar kore dekhabo checkouts
app.get('/checkout', logger, verifyToken, async (req, res) => {
  console.log(req.query.email);
  console.log('cookie token', req.cookies.token);
  console.log('user in the valide token',req.user);
if (req.query.email !== req.user.email) {
  return res.status(403).send({message: 'forbidden access'})
}

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
const updateDoc = {
  $set:{
    status:updeteCheckout.status
  },
};
const result = await CheckOutCollection.updateOne(filter, updateDoc);
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

