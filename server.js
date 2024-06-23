const mongoclient = require("mongodb").MongoClient;
const ObjId = require('mongodb').ObjectId;
const url = `mongodb+srv://hasion:think628@cluster0.qmcl122.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const express = require('express');
const app = express();
const bodyParser = require("body-parser");

app.set('view engine', 'ejs');
let session = require("express-session");

const { render } = require("ejs");

app.use(session(
    {
        secret : 'dkufe8938493j4e08349u',
        resave : false,
        saveUninitialized : true,
    }
));

app.use(bodyParser.urlencoded({extended:true}));

let mydb;
app.use(express.static("views")); 
let Uid; 

mongoclient.connect(url)
    .then(client => {
        console.log("몽고 DB 접속 성공");
        mydb = client.db("bank");
        
        app.listen(8080, function() {
            console.log("8080 server ready...");
        })
    })
    .catch((err) => {
        console.log(err);
    });

app.get("/", (req,res)=>{
    if(req.session.user){
        console.log("index session 정보")
        console.log(req.session.user.inputID);
    }
    
    res.render("index.ejs",{user: req.session.user});
});

app.get("/login", (req, res) =>{
    console.log(req.session);
    if(req.session.user){
        console.log("세션 유지");
    
    }else{
        res.render("login.ejs" );
    }
});

app.post("/loginLogic", (req,res)=>{

    console.log(req.body);
    
    let uid = req.body.inputID;
    let passward = req.body.inputPWD;
    
    // console.log(passward);
    // let objectIdUid = new ObjId(uid);
    
    // req.body.inputID = new ObjId(req.body.inputID);
    // req.body.inputPWD = new ObjId(req.body.inputPWD);

    mydb
            .collection("user")
            .findOne({ UID : req.body.inputID })
            .then((result) => {
                if(result){
                    // console.log("DB에서 사용자 찾음");
                    if(result.PWD == passward){
                        // console.log('로그인에 성공하셨습니다.') // 조회된 사용자 정보 출력
                        
                        req.session.user = req.body;
                        // console.log(req.session.user);
                        res.redirect("/");
                    }else{
                    //    alert("비밀번호가 틀렸습니다.");
                        res.render("/login");
                    }
                }
                    else{
                    // console.log("사용자를 찾을 수 없음");
                    res.redirect("/login");
                }
              
                res.redirect("/");
            })
            .catch((result =>{

            }));
                
            
        
})

app.get("/logout", (req,res)=>{
    // console.log('로그아웃');
    req.session.destroy();
    res.redirect('/');
})
app.get("/signup", (req, res) =>{
    res.render("signup.ejs");
});

app.post("/register", (req,res) =>{
    console.log(req.body);
    mydb.collection("user").insertOne(
        {UID : req.body.inputID, PWD : req.body.inputPWD, ASSET: 0}
    ).then(result =>{
        console.log("저장 완료", result);
        res.redirect("/");
    });
});

function isAuthenticated(req, res, next) {
    if (req.session.user) {
        return next();
    } else {
        res.send('<script>alert("로그인을 해야합니다."); window.location.href = "/login";</script>');
    }
}


app.get("/trading", (req, res)=>{
    mydb.collection("property").find().toArray().then(result =>{
        if(req.session.user){
            console.log("treading session 정보")
            console.log(req.session.user.inputID);
        };
        console.log(result);
        res.render("trading.ejs", {propData : result});
    }); // 몽고 db에 등록한 부동산 매물 리스트 데이터 전송
});

app.get("/board", isAuthenticated, (req, res) => {
    res.render("board.ejs", {user: req.session.user});
});

app.post("/enterProp", isAuthenticated,(req, res) =>{
    console.log(req.body);
    mydb.collection("property").insertOne(
        {propTitle : req.body.propTitle, propPrice : req.body.propPrice, propAddress : req.body.propAddress, lat : req.body.lat, lng : req.body.lng, acc : req.body.acc}
    ).then(result =>{
        console.log("부동산 등록 완료", result);
        res.send(`
            <script>
                alert('부동산 매물이 성공적으로 등록되었습니다.');
                window.location.href = '/trading';
            </script>
        `);
    }).catch(err => {
        console.error("부동산 등록 실패", err);
        res.send(`
            <script>
                alert('부동산 매물 등록 중 오류가 발생했습니다.');
            </script>
        `)});
});

app.get("/send", isAuthenticated,   (req,res)=>{ 
    console.log("--send 창--")
    console.log(req.session.user);
    res.render("send.ejs",{user: req.session.user});

   
   
})

app.post("/sendLogic", function (req, res) {
    //바뀌나?
    const action = req.body.action; // 폼에서 전송된 action 값 확인

    mydb.collection("user").findOne({ UID: req.session.user.inputID })
        .then((result) => {
            if (!result) {
                console.log("User not found");
                return res.status(404).send("User not found");
            }

            console.log("전송 db확인 ");
            console.log(result);
            console.log("db값 확인");

            let money = parseInt(req.body.money, 10);
            let asset = parseInt(result.ASSET, 10);

            if (isNaN(money) || isNaN(asset)) {
                console.log("Invalid input: Not a number");
                return res.status(400).send("Invalid input");
            }

            console.log("입력된 돈:" + money);
            console.log("입력된 자산:" + asset);

            if (action === 'transfer') {
                console.log('이체 시작');
                if (asset < money) {
                    console.log("보유하신 금액 초과입니다.");
                    return res.status(400).send("보유하신 금액 초과입니다.");
                } else {
                    console.log("입금 시작");
                    mydb.collection("user").findOne({ UID: req.body.reciver })
                        .then(async (receiver) => {
                            if (!receiver) {
                                console.log("Receiver not found");
                                return res.status(404).send("Receiver not found");
                            }

                            let senderNewAsset = asset - money;
                            let receiverNewAsset = parseInt(receiver.ASSET, 10) + money;

                            const bulkOps = [
                                {
                                    updateOne: {
                                        filter: { UID: req.session.user.inputID },
                                        update: { $set: { ASSET: senderNewAsset } }
                                    }
                                },
                                {
                                    updateOne: {
                                        filter: { UID: req.body.reciver },
                                        update: { $set: { ASSET: receiverNewAsset } }
                                    }
                                }
                            ];

                            try {
                                const sendDB = await mydb.collection('user').bulkWrite(bulkOps);
                                console.log("입금완료");
                                res.redirect('/');
                            } catch (err) {
                                console.log("Bulk write error:", err);
                                res.status(500).send("Internal Server Error");
                            }
                        })
                        .catch((err) => {
                            console.log("Receiver find error:", err);
                            res.status(500).send("Internal Server Error");
                        });
                }
            } else if (action === 'deposit') {
                asset += money;
                mydb.collection("user").updateOne(
                    { UID: req.session.user.inputID },
                    { $set: { ASSET: asset } }
                )
                .then((result) => {
                    console.log("입금완료");
                    res.redirect('/'); 
                })
                .catch((err) => {
                    console.log("Update error:", err);
                    res.status(500).send("Internal Server Error");
                });
            } else {
                console.log("잘못된 요청입니다.");
                res.status(400).send("잘못된 요청입니다.");
            }
        })
        .catch((err) => {
            console.log("DB error:", err);
            res.status(500).send("Internal Server Error");
        });
});

