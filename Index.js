const express=require("express");
const DbConnect=require('./DbConnect');
const AuthRouter=require('./Router/AuthRouter');
const RestaurantRouter=require('./Router/RestaurantRouter');
const TableRouter=require('./Router/TableRouter');
const MenuRouter=require('./Router/MenuRouter');
const CategoryRouter=require('./Router/CategoryRouter')
const OrderRouter=require('./Router/OrderRouter')
const morgan=require('morgan')

const app=express();

app.use(morgan('common'));
app.use(express.json({limit:'10mb'}));

app.use('/auth',AuthRouter);
app.use('/restaurant',RestaurantRouter);
app.use('/table',TableRouter);
app.use('/menu',MenuRouter);
app.use('/category',CategoryRouter);
app.use('/order',OrderRouter);

app.get('/' , (req,res) => {
    res.status(200).send("hiiii");
})


const PORT=4001;
DbConnect();


app.listen(PORT,()=>{
    console.log(`listening to port ${PORT}`);
})
