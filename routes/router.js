const express = require('express');
const router = express.Router();
const axios = require('axios');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path'); 
const fs = require('fs');


const User = require('../models/User')
const Dish = require('../models/Dish')

function loadTranslation(language) {
    const translation = fs.readFileSync(`./public/lang/${language}.json`);
    return JSON.parse(translation);
}
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/images') 
    },
    filename: function (req, file, cb) {
        cb(null, file.originalname)
    }
});
const upload = multer({ storage: storage });

/*  middlewares */ 
const authenticateUser = (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      return res.redirect('/login'); 
    }
  
    jwt.verify(token, 'secret_key', (err, user) => {
      if (err) {
        return res.redirect('/login');
      }
      req.user = user;
      next();
    });
  };

  const authorizeAdmin = (req, res, next) => {
    if (!req.user || !req.user.role) {
        return res.status(403).send('Forbidden'); 
    }
    next();
};

  const setLanguage = (req, res, next) => {
    const language =  req.query.lang  || 'en';
    const translation = loadTranslation(language);
    req.session.language = language; 
    res.locals.translation = translation;
    res.locals.currentLanguage = language;
    next();
  }
  
  router.post('/change-language', (req, res) => {
    const language = req.body.language;
    req.session.language = language; 
    var currentUrl = req.headers.referer || '/';
    const langQueryParamIndex = currentUrl.indexOf('?lang=');
    if (langQueryParamIndex !== -1) {
        currentUrl = currentUrl.substring(0, langQueryParamIndex) + `?lang=${language}`;
    } else {
        const separator = currentUrl.includes('?') ? '&' : '?';
        currentUrl = `${currentUrl}${separator}lang=${language}`;
    }
    res.redirect(currentUrl);
});


router.get('/', (req, res) => {
    res.status(200).render('register');
});
router.get('/logout', (req, res)=>{
    res.redirect('/')
})
router.get('/login', (req, res) => {
    res.status(200).render('login');
});

router.get('/allDishes', authenticateUser, setLanguage, async(req, res)=>{
    try {
        const dish = await Dish.find().limit(3);
        const currentLanguage = req.session.language || 'en';
        res.render('dishes', { isAdmin: req.user.role,dishes:dish, language: res.locals.translation, currentLanguage });
    } catch (err) {
        res.status(500).send(err);
    }
})


router.get('/dishes/:dishId', authenticateUser, setLanguage, async(req,res)=>{
    try {
        const dishId = req.params.dishId;
        const dish = await Dish.findById(dishId);
        if (!dish) {
            return res.status(404).send('dish not found');
        }
        const currentLanguage = req.session.language || 'en';
        res.status(200).render('dish', {userId: null, isAdmin:false, dish, language: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})


router.get('/admin', authenticateUser, authorizeAdmin, setLanguage, async(req, res)=>{
    try {
        const users = await User.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).render('admin', { userId: req.user._id, isAdmin: req.user.isAdmin, users: users, language: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
})
router.get('/admin/dish', authenticateUser, authorizeAdmin, setLanguage, async(req, res)=>{
    try {
        const dish = await Dish.find();
        const currentLanguage = req.session.language || 'en';
        res.status(200).render('newDish', {isAdmin: req.user.isAdmin, dish: dish, language: res.locals.translation, currentLanguage });
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
})
router.get('/index',authenticateUser, setLanguage , async(req, res) => {
    try {
        const dish = await Dish.find().limit(3);
        const currentLanguage = req.session.language || 'en';
        res.render('index', { isAdmin: req.user.role,dishes:dish, language: res.locals.translation, currentLanguage });
    } catch (err) {
        res.status(500).send(err);
}});

router.get('/nutrition', authenticateUser, setLanguage, async(req, res)=>{
    try{
        const currentLanguage = req.session.language || 'en';
        res.render('nutrition', { isAdmin: req.user.role,nutritionData:[], language: res.locals.translation, currentLanguage })
    } catch (err) {
            res.status(500).send(err);
    }
});
router.get('/recipes', authenticateUser, setLanguage, async(req, res)=>{
    try{
        const currentLanguage = req.session.language || 'en';
        res.render('recipes', { isAdmin: req.user.role,results:[], language: res.locals.translation, currentLanguage })
    } catch (err) {
            res.status(500).send(err);
    }
});

router.post('/recipes',authenticateUser, setLanguage, async (req, res) => {
    try {
        const apiKey = "fd74ec83259a440d9919d972c1e34a10";
        const { query, excludeCuisine, diet } = req.body;
        const url = `https://api.spoonacular.com/recipes/complexSearch?apiKey=${apiKey}&query=${query}&excludeCuisine=${excludeCuisine}&diet=${diet}`;
        const response = await axios.get(url);
        const currentLanguage = req.session.language || 'en';
        res.render('recipes', { isAdmin: req.user.role,results: response.data.results, language: res.locals.translation, currentLanguage })
        } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});


router.post('/nutrition',authenticateUser, setLanguage, async (req, res) => {
    try {
        const { query } = req.body;
        
        const response = await axios.get(`https://api.api-ninjas.com/v1/nutrition?query=${query}`, {
            headers: {
                'X-Api-Key': 'RylEwR0tvdoj1xbuI+2l9g==e99UWkaA9lxnXkCo',
            }
        });
        const currentLanguage = req.session.language || 'en';
        res.render('nutrition', { isAdmin: req.user.role,nutritionData: response.data, language: res.locals.translation, currentLanguage })
        } catch (error) {
        console.error('Error fetching data:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});
    router.post('/admin/dish', authenticateUser, authorizeAdmin, setLanguage, upload.array('images[]'), async (req, res) => {
        try {
            const imageUrls = req.files.map(file => {
                const correctedPath = file.path.replace(/\\/g, '/');
                const newPath = correctedPath.replace('public/', '../');
                return newPath;
            });
            const newDish = new Dish({
                names: req.body.names,
                descriptions: req.body.descriptions,
                images: imageUrls, 
                category: req.body.category,
                price: req.body.price,
                ingredients:req.body.ingredients,
            });
            const savedDish = await newDish.save();
    
            const dishes = await Dish.find();
            const currentLanguage = req.session.language || 'en';
    
            res.status(200).render('newDish',{ isAdmin: req.user.isAdmin, dish:dishes, language: res.locals.translation, currentLanguage});
        } catch (error) {
            console.error(error);
            res.status(500).send('Internal Server Error');
        }
    });

router.post("/register", async(req, res)=>{
    const { username, email, password } = req.body;
    try {
        const existingUser = await User.findOne({ username, email});
        if (existingUser) {
            res.status(500).render("register.ejs", { errorMessage: "Username already exists" });
            return; 
        }
        let isAdmin = false;
        if (password === "Shakhnur" && email === "Shakhnur@gmail.com" && username === "Shakhnur") {
            isAdmin = true;
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email,password:hashedPassword, isAdmin });
        await newUser.save();

        req.session.userId = newUser._id;
        res.redirect(`/login`);
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
})

router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            res.status(404).send({message: 'Invalid username'})
            return; 
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            res.status(500).send({ message: 'Invalid password' });
            return; 
        }
        const token = jwt.sign({ 
            userId: user._id, 
            username: user.username, 
            role: user.isAdmin, 
        }, 'secret_key');
        res.cookie('token', token);
        req.session.user = user;
        res.status(200).redirect('/index'); 
    } catch (error) {
        console.error('Error logging in:', error);
        res.status(500).send('An error occurred while logging in');
    }
})



router.post('/admin/add', authenticateUser, authorizeAdmin,setLanguage, async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ username, email, password: hashedPassword, isAdmin: false });
        await newUser.save();
        const currentLanguage = req.session.language || 'en';

        res.status(200).redirect(`/admin?lang=${currentLanguage}`)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/update', authenticateUser, authorizeAdmin, setLanguage, async(req, res) => {
    const { userId, newUsername, newEmail, newPassword } = req.body;   
     try {
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (newUsername) {
            user.username = newUsername;
        }
        if (newEmail) {
            user.email = newEmail;
        }
        if (newPassword) {
            const hashedPassword = await bcrypt.hash(newPassword, 10);
            user.password = hashedPassword;
        }
        await user.save();
        const currentLanguage = req.session.language || 'en';

        res.status(200).redirect(`/admin?lang=${currentLanguage}`)
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.post('/admin/delete', authenticateUser, authorizeAdmin,setLanguage,  async (req, res) => {
    try {
        const userId = req.body.deleteUserId;
        const deletedUser = await User.findByIdAndDelete(userId);
        if (!deletedUser) {
            return res.status(404).send('User not found');
        }
        const users = await User.find();
        const currentLanguage = req.session.language || 'en';

        res.status(200).redirect(`/admin?lang=${currentLanguage}`)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});




router.post('/admin/dish/update', authenticateUser, authorizeAdmin,setLanguage, async (req, res) => {
    try {
        const {dishId,  names, descriptions, category, price,ingredients } = req.body;
        const dish = await Dish.findById(dishId);
        if (!dish) {
            return res.status(404).send('Dish not found');
        }
        if (names) {
            dish.names = names.map(name => ({ language: name.language, name: name.name }));
        }
        if (descriptions) {
            dish.descriptions = descriptions.map(description => ({ language: description.language, description: description.description }));
        }
       
        if (category){
            dish.category = category
        }
        if (price){
            dish.price = price
        }
        if (ingredients) {
            dish.ingredients = ingredients
        }
        const update = await dish.save();
        const currentLanguage = req.session.language || 'en';

        res.status(200).redirect(`/admin/dish?lang=${currentLanguage}`)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

router.post('/admin/dish/delete', authenticateUser, authorizeAdmin,setLanguage,  async (req, res) => {
    try {
        const dishId = req.body.dishId;
        const deletedDish = await Dish.findByIdAndDelete(dishId);
        if (!deletedDish) {
            return res.status(404).send('Dish not found');
        }
        const currentLanguage = req.session.language || 'en';
        res.status(200).redirect(`/admin/dish?lang=${currentLanguage}`)
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
});

module.exports = router;