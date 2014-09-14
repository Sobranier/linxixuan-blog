/*
 * GET home page.
 */
var Blog = require('../models/blog'),
    hljs = require('highlight.js'),
    marked = require('marked');

var commonData;

var highlight = function(code, lang){
    var o;

    if(lang == 'js') {
        lang = 'javascript';
    } else if (lang == 'html') {
        lang = 'xml';
    }

    if(lang){
        o = hljs.highlight(lang, code);
    } else {
        o = hljs.highlightAuto(code).value;
    }
    var html = o.value;
    if(html){
        return html;
    } else {
        return code;
    }
};
marked.setOptions({
    gfm: true,
    tables: true,
    breaks: true,
    pedantic: false,
    sanitize: false,
    smartLists: true,
    langPrefix: '',
    highlight: highlight
});

module.exports = function(app){

    commonData = {
        title: '林夕轩',
        avatar: '/images/sp-head.jpg',
    };

    // 博客展示页面
    app.get('/blog', function (req, res) {
        var data = commonData,
            bname = req.query.bname;
        Blog.get({bid: bname}, function (blog) {
            if (blog[0]) {
                blog = blog[0];
                blog.day = blog.date.getFullYear() + '-' + (blog.date.getMonth() + 1) + '-' + blog.date.getDate();
                content = blog.content.replace(/\\n/g, '\n');
                blog.content = marked(content);
                data.blog = blog;
                res.render('blog/default', data);
            } else {
                res.redirect('/');
            }
        });
    });

    // 博客预览
    app.post('/blog/preview', function (req, res) {
        var content = req.body.content;
        content = content.replace(/\\n/g, '\n');
        content = marked(content);

        res.json(200, {title: req.body.title, content: content});
    });

    // 提交博客
    app.post('/blog', function (req, res) {
        var blogReq = req.body,
            isUpdate = req.body.method === 'update',
            blog;

        blogReq.date = new Date();
        blog = new Blog(blogReq);
        if (!isUpdate) {
            blog.save(function () {
            });
        } else {
            Blog.update({bid: blog.bid}, blog);
        }
        res.redirect('/');
    });

    app.get('/blog/edit', function (req, res) {
        var data = commonData,
            bname = req.query.bname;
        if (req.cookies.uid) {
            if (bname) {
                Blog.get({bid: bname}, function (blog) {
                    data.blog = blog[0];
                    res.render('blog/edit', data);
                });
            } else {
                data.blog = null;
                res.render('blog/edit', data);
            }
        } else {
            res.redirect('../../login?bname=' + req.query.bname);
        }
    });

    app.get('/', function (req, res) {
        var data = commonData;
        Blog.get({}, function (blogs) {
            // 对日期进行处理
            for(var index in blogs) {
                var date = blogs[index].date;
                blogs[index].day = (date.getMonth() + 1) + '-' + date.getDate();
                blogs[index].year = date.getFullYear();
            }
            data.blogs = blogs;
            res.render('index', data);
        });
    });

    // 获取指定条件的博客
    app.get('/history', function (req, res) {
        var query = req.query,
            value,
            blogs = [],
            config = {},
            beginDate,
            endDate,
            data = commonData,
            isAjax = req.xhr;

        if (Object.keys(query).length > 1) {
            res.redirect('/');
        }

        // 搜索标签
        if (query.hasOwnProperty('tag')) {
            value = query['tag'];
            config = {tags: {$in: [value]}};
        }

        if (query.hasOwnProperty('date')) {
            value = query['date'];
            beginDate = new Date(value.split('-')[0]);
            if (value.indexOf('-') === -1) {
                endDate = new Date(beginDate.getTime() + 24 * 60 * 60 * 1000);
            } else {
                endDate = new Date(value.split('-')[1]);
            }
            config = {date: {$lt: endDate, $gte: beginDate}};
        }

        Blog.get(config, function (blogs) {
            var tagList = [],
                dateList = [];
            // 对日期进行处理
            for(var index in blogs) {
                var date = blogs[index].date,
                    tags = blogs[index].tags,
                    year = date.getFullYear(),
                    month = date.getMonth(),
                    day = date.getDate();
                for (var i = 0, len = tags.length; i < len; i++) {
                    if (tagList.indexOf(tags[i]) === -1) {
                        tagList.push(tags[i]);
                    }
                }
                if (dateList.indexOf(year + '/' + (month + 1) + '/' + day) === -1) {
                    dateList.push(year + '/' + (month + 1) + '/' + day);
                }
                blogs[index].day = (month + 1) + '-' + day;
                blogs[index].year = year;
            }
            data.blogs = blogs;
            data.tagList = tagList;
            data.dateList = dateList;

            if (!isAjax) {
                res.render('history', data);
            }
        });
    });
};