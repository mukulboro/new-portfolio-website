require('dotenv').config()
const express = require('express');
const mongoose = require('mongoose');
const ld = require('lodash');
const session = require('express-session');
const bcrypt = require('bcrypt');

// mongoose.connect('mongodb://localhost:27017/personalBlogDB', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(`mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@portfolio-cluster.6lrox.mongodb.net/portfolioDB?retryWrites=true&w=majority`, {useNewUrlParser: true, useUnifiedTopology: true});

const postSchema = mongoose.Schema({
    title: String,
    content: String,
    imageURL: String,
    kebabUrl: String,
});

const userSchema = mongoose.Schema({
    email: String,
    password: String,
});

const skillSchema = mongoose.Schema({
    title: String,
    technology: String,
    description: String,
    gitHub: String
})

const Post = new mongoose.model("Post", postSchema);
const User = new mongoose.model("User", userSchema);
const Skill = new mongoose.model("Skill", skillSchema);

app = express()
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
  }))
app.set("view engine", "ejs");
app.use(express.static("public"))
app.use(express.urlencoded({extended: true}))

app.route("/")
    .get((req, res)=>{
        res.render("home");
    })

app.route('/about')
    .get((req, res)=>{
        res.render("about");
    })

app.route('/contact')
    .get((req, res)=>{
        res.render("contact");
    })

app.route('/blog')
    .get((req, res)=>{
        Post.find({}, (err, foundPosts)=>{
            if(err){
                res.send("Fatal Database Error. \n" + err);
            }else{
                res.render("blog", {posts: foundPosts});
            }
        })
        
    })
    .post((req, res)=>{
        const searchQuery = ld.kebabCase(req.body.search);
        Post.find({kebabUrl: searchQuery}, (err, foundItems)=>{
            if(err){
                res.send(err)
            }else{
                console.log(foundItems)
                res.render("blog", {posts: foundItems})
            }
        })
        
    })

app.route("/blog/:suffix")
    .get((req, res)=>{
        Post.find({}, (err, foundPosts)=>{
            var requiredPost={};
            if(err){
                res.send("Fatal Database Error. \n" + err);
            }else{
                foundPosts.forEach((post)=>{
                    if(post.kebabUrl === req.params.suffix){
                        requiredPost = post
                    }
                })  
            }

            if(requiredPost){
                res.render("post", {post: requiredPost})
            }else{
                res.send("404 article not found")
            }
            
        })
    })

app.route('/portfolio')
    .get((req, res)=>{
        Skill.find({}, (err, foundSkills)=>{
            if(err){
                res.send(err);
            }else{
                res.render("portfilio", {skills: foundSkills})
            }
        })
    })

app.route('/admin')
    .get((req, res)=>{
        if(req.session.user){
            Post.find({}, (err, foundPosts)=>{
                if(err){
                    res.send("Fatal database error")
                }else{
                    res.render("dashboard", {posts: foundPosts})
                }
            })
        }else{
            res.redirect('/login')
        }
    })
    .post((req, res)=>{
        Post.updateOne(
            {kebabUrl: req.body.post_url},
            {
                title: req.body.post_title,
                content: req.body.post_body,
                imageURL: req.body.image_url,
                kebabUrl: ld.kebabCase(req.body.post_title),
            }, (err, writeOpResult)=>{
                if(err){
                    res.send(err);
                }else{
                    res.redirect("/admin");
                }
            })
    })

app.route('/admin/edit/:postName')
    .get((req, res)=>{
        if(req.session.user){
            Post.findOne({kebabUrl: req.params.postName}, (err, reqPost)=>{
                if(err){
                    res.send(err);
                }else{
                    res.render("post_edit", {post: reqPost});
                }
            })
        }else{
            res.redirect('/login')
        }
    })

app.route('/admin/delete/:postName')
    .get((req, res)=>{
       if(req.session.user){
        Post.deleteOne({kebabUrl: req.params.postName}, (err)=>{
            if(err){
                res.send(err);
            }else{
                res.redirect("/admin");
            }
        })
       }else{
        res.redirect('/login')
    }
        
    })    

app.route("/new-post")
    .get((req, res)=>{
        if(req.session.user){
            res.render("create_post")
        }else{
            res.redirect('/login')
        }
    })
    .post((req, res)=>{
        const post = new Post({
            title: req.body.post_title,
            content: req.body.post_body,
            imageURL: req.body.image_url,
            kebabUrl: ld.kebabCase(req.body.post_title)
        })
        post.save();
        res.redirect('/blog');
    })

app.route("/add-skill")
    .get((req, res)=>{
        if(req.session.user){
            res.render("add_skill")
        }else{
            res.redirect("/login")
        }
    })
    .post((req, res)=>{
        const skill = new Skill({
            title: req.body.skill_title,
            technology: req.body.technology_used,
            description: req.body.skill_body,
            gitHub: req.body.github_link
        })

        skill.save();

        res.redirect("/portfolio")
    })

app.route('/login')
    .get((req, res)=>{
        if(req.session.user){
            res.redirect('/admin')
        }else{
            res.render("login");
        }
    })
    .post(async (req, res)=>{
        User.findOne({email: req.body.email}, async(err, foundUser)=>{
            if(err){
                res.send(err);
            }else{
                if(foundUser){
                    bcrypt.compare(req.body.password, foundUser.password, function(err, result) {
                        if(result){
                            req.session.user = foundUser.email;
                            res.redirect('/admin')
                        }else{
                            res.send('Incorrect credentials')
                        }
                    });
                }
            }
        })
        
    })

app.listen(4000, ()=>console.log('Server running on port 4000'))

