const express =require('express')
const router =new express.Router()
const auth =require('../middleware/auth')
const Product = require('../models/product')

//create new product
router.post('/admin/create-product', async(req , res)=> {
    const product = new Product(req.body)
    try {
       const random1 = Math.floor(Math.random() * 10);
       const random2 = Math.floor(Math.random() * 10);
       const productId = `${ random1 }${Date.now()}${ random2 }` 

       product.productId = productId 
       
       await product.save()
       res.status(201).send({
           msg:'success'
        })
    }catch(e) {
        res.send(400).send({msg:e.message})
    }
})

//delete product
router.delete('/product/delete', auth , async(req, res)=> {
    const { productId } = req.body
    try {
        const product = await Product.findOne( { productId } )

        await product.remove()

        res.status(200).send({msg:'Delete successfully!'})
    }catch(e) {       
        res.status(400).send({msg:e.message})
    }
})

//delete multiple product
router.delete('/product/deleteMany', auth , async(req, res)=> {
    const  { deleteProducts }  = req.body 
    try {
        const batch = deleteProducts.split(",")
        
        await Product.deleteMany(
            { 
             productId:{
                  $in: [...batch ]
                  }             
             } 
        )

        res.status(200).send({msg:"Delete successfully!"})

        }catch(e) {
            res.status(400).send({msg:e.message})
        }
    
})
//modify product
router.patch('/product/modify', auth , async(req, res)=> {
    const { productUpdate } = req.body
    const { productId } = productUpdate
    try {
        const product = await Product.findOne( { productId } )
       
        //Extract each property in productUpdate(Object) and convert it to the array.
        const updates = Object.keys( productUpdate )
        
        updates.forEach(update=> 
            product[update] = productUpdate[update] 
            )
        
        await  product.save()

        res.status(200).send({msg:"Modify successfully!"})

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//get productList by category
router.post('/product/category/list', async(req, res) => {
    const { category } = req.body
    try {
        const productList = await Product.find( { category } ) 
        console.log(productList)

        res.status(200).send({
           msg:"success",
           productList
        })
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})
//get a product by productId
router.post('/product/detail', async(req, res)=> {
    const { productId } =req.body
    try {
       const product = await Product.findOne( { productId } )
       if(!product) {
           throw new Error("Product does not exist!")
       }
       res.status(200).send({
           msg:'Success!',
           productDetail:product
        })

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})
//get best seller from all category
router.get('/product/feature/best_seller', async(req, res)=> {
    try {
        const best_seller = await Product.find({
            sales:{ 
                $gte:200
             }
        }).limit(2)
        
       if(!best_seller){
           throw new Error("Can not find anything!")
       }
       
        res.status(200).send({
            msg:'success!',
            best_seller
        })
    }catch(e) {
        res.status(400).send({msg:e.message})
    }
    
})
//get subCategory products
router.post('/product/subCategory', async(req, res)=> {
    const { sub } = req.body
    try {
        const products = await Product.find( { sub_category:sub } )
        res.status(200).send({
            msg:'success',
            products
            })

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})

//get the newest products
router.get('/product/newest', async(req, res)=> {
    try {
        const now = new Date().toISOString()
        const reduceSevenDay = new Date().setDate(new Date().getDate()-2)
        const  sevenAgo = new Date(reduceSevenDay).toISOString()
        const products =await Product.find({
            createdAt:{
                $lt:now,
                $gt:sevenAgo
            }
        }).limit(6)
     
        res.status(200).send({
            msg:'success',
            products
            })

    }catch(e) {
        res.status(400).send({msg:e.message})
    }
})
module.exports = router