const urlModel = require("../Model/urlModel")
const shortId = require("shortid")
const validUrl = require("valid-url")


const redis = require("redis");

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  10315,
  "redis-10315.c264.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("oYF6LiCL5DjSsos4QHdG1dpxQbwRwJJS", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});



//1. connect to the server
//2. use the commands :

//Connection setup for redis

const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);






// ### POST /url/shorten:

const urlMake = async function(req,res){
try{
    const baseUrl = "http://localhost:3000/"
    const data = req.body
    const {longUrl,shortUrl,urlCode} = data
    if(Object.keys(data)==0)return res.status(400).send({status:false,msg:"please put details in the body"})
    // VALIDATING BASE URL:
    if (!validUrl.isUri(baseUrl.trim())){return res.status(400).send({status:false,msg:"baserUrl is not valid"})}
    // VALIDATING LONG-URL:
    if(!data.longUrl) return res.status(400).send({status:false,msg:"longUrl is not present"})
    if(data.longUrl.trim().length == 0) return res.status(400).send({status:false,msg:"enter the longUrl in proper format"})
    if(!(/(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/).test(longUrl))return res.status(400).send({status:false,msg:"longUrl is invalid"})
    // let duplongUrl = await urlModel.findOne({longUrl:longUrl})
    // if(duplongUrl)return res.status(400).send({status:false,msg:"shortUrl is already generated for this longUrl"})
    // VALIDATING URL-CODE:
    const uniqueurl = await urlModel.findOne({ longUrl: data.longUrl }).select({createdAt:0,updatedAt:0,__v:0})
    if (uniqueurl) {
        return res.status(200).send({ status:true,data:uniqueurl })
    }


    data.urlCode = shortId.generate().toLowerCase()
    // VALIDATING SHORT-URL:
    data.shortUrl = baseUrl + `${data.urlCode}`
    console.log(data.shortUrl)
    let cahcedLongUrlData = await GET_ASYNC(`${duplicateUrl}`)
        if (cahcedLongUrlData) {
            return res.status(400).send({ status: false, message: "data is present in the catche" })
        }
        else {
            await SET_ASYNC(`${longUrl}`, (JSON.stringify(duplicateUrl)))
    const SavedUrl = await urlModel.create(data)
        return res.status(201).send({status: true,msg:"url-shortend", data: {"longUrl": SavedUrl.longUrl,"shortUrl": SavedUrl.shortUrl,"urlCode": SavedUrl.urlCode}})
        }
}catch(error) {
    return res.status(500).send({status:false, msg: error.message})
}}

// ### GET /:urlCode:

const getUrlcode = async function(req,res){
    try{
       const urlCode = req.params.urlCode
       if(!urlCode)return res.status(400).send({status:false,msg:"params value is not present"})
       if(urlCode.length!=9)return res.status(400).send({status:false,msg:"not a valid urlCode"})
       const url = await urlModel.findOne({urlCode})
       if(!url){return res.status(400).send({status:false,msg:"urlCode is not present"})}
       let cahcedLongUrlData = await GET_ASYNC(`${urlCode}`)
        if (cahcedLongUrlData) {
            res.redirect(JSON.parse(cahcedLongUrlData).longUrl)
        } else {
            let cache = await urlModel.findOne({ urlCode });
            await SET_ASYNC(`${urlCode}`, (JSON.stringify(cache)))
       res.status(200).redirect(url.longUrl)
        }
    }catch(error) {
    return res.status(500).send({status:false, msg: error.message})
    }
}


module.exports.urlMake= urlMake
module.exports.getUrlcode=getUrlcode