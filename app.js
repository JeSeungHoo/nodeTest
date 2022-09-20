const path = require('path');

const express = require('express');
const bodyParser = require('body-parser');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

// Dummy User 
app.use((req, res, next) => {
  User.findByPk(1)
    .then(user => {
      req.user = user;
      return next();
    })
    .catch(err => console.log(err));
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);

app.use(errorController.get404);

// 관계 설정
Product.belongsTo(User, { constraints: true, onDelete: 'CASCADE' });
User.hasMany(Product); // User는 여러 개의 Product를 가진다.
User.hasOne(Cart); // User는 하나의 Cart를 가진다.
Cart.belongsTo(User); // Cart는 User에 속한다 === User.hanOne(Cart) ==> 하나만 설정해도 됨.
Cart.belongsToMany(Product, { through: CartItem }); // 다대다 관계 ┐
Product.belongsToMany(Cart, { through: CartItem }); // 다대다 관계 ┘ 
Order.belongsTo(User); // ┌일대다 관계┐
User.hasMany(Order); //  └일대다 관계┘
Order.belongsToMany(Product, { through: OrderItem });

sequelize
  // .sync({ force: true }) // DROP TABLE IF EXISTS && CREATE TABLE
  .sync() // CREATE TABLE IF NOT EXISTS
  .then(result => {
    return User.findByPk(1);
  })
  .then(user => { // Dummy User 
    if (!user) {
      return User.create({ name: 'Someone', email: 'abcdef@gmail.com' });
    }
    return user;
  })
  .then(user => {
    return user.createCart(); // Dummy User`s cart
  })
  .then(cart => {
    app.listen(3000);
  })
  .catch(err => {
    console.log(err);
  });
