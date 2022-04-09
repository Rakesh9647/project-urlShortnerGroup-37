const urlModel=require("../Model/urlModel")
const shortid = require("shortid");
const validUrl = require('valid-url')
const randomstring = require("randomstring")

const redis = require('redis')

const { promisify } = require("util");

//Connect to redis
const redisClient = redis.createClient(
  17785,
  "redis-17785.c212.ap-south-1-1.ec2.cloud.redislabs.com",
  { no_ready_check: true }
);
redisClient.auth("bZRaZnhP1uiLg4TUP4lIWdBBysZjYxvg", function (err) {
  if (err) throw err;
});

redisClient.on("connect", async function () {
  console.log("Connected to Redis..");
});


const SET_ASYNC = promisify(redisClient.SET).bind(redisClient);
const GET_ASYNC = promisify(redisClient.GET).bind(redisClient);


const isValid = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true;
}

const isValidRequestBody = function (data) {
    return Object.keys(data).length > 0
  }

  const createShortUrl = async function (req, res) {
    try {
        const data = req.body

        let check =await GET_ASYNC(`${data.longUrl}`)
        if(check){
        let response=JSON.parse(check)
        console.log("data is from cache")
        return res.status(200).send(response)
        }


        if(!isValidRequestBody(data)){
            return res.status(400).send({status:false,msg:"your request is bad"})
        }

        if(!isValid(data.longUrl)){
            return res.status(400).send({status:false,msg:"please required longurl "})
        }

        if (!validUrl.isWebUri(data.longUrl.trim())) {
            return res.status(400).send({ status: false, message: "please enter valid  url" })
        }
        
        const uniqueurl = await urlModel.findOne({ longUrl: data.longUrl }).select({createdAt:0,updatedAt:0,__v:0})
        if (uniqueurl) {
            return res.status(200).send({ status:true,msg:"this url have already generated a unique urlCode",data:uniqueurl})
        }

        data.urlCode = randomstring.generate({length:6, charset:'alphabetic'}).toLowerCase()

        data.shortUrl = `http://localhost:3000/${data.urlCode}`


        let createUrl = await urlModel.create(data)
        await SET_ASYNC(`${data.urlCode}`,JSON.stringify(createUrl.longUrl))

            return res.status(201).send({status:true,msg:"sucessfullycreated",data:createUrl})

    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
  }


  const getUrl = async function (req, res) {
    try {
        const urlCode = req.params.urlCode

        if (!isValid(urlCode)) {
            return res.status(400).send({ status: false, message: "please provide urlcode" })
        }

        const cahcedOrginalUrl = await GET_ASYNC(`${urlCode}`)
        
        if (cahcedOrginalUrl) {

            let redirectingData = JSON.parse(cahcedOrginalUrl)

            return res.status(301).redirect(redirectingData)
        } else { 
            const urlData = await urlModel.findOne({ urlCode: urlCode })
            if (!urlData) {
                return res.status(404).send({ status: false, message: "url not found" })
        }

            await SET_ASYNC(`${urlCode}`, JSON.stringify(urlData.longUrl))

            return res.status(301).redirect(urlData.longUrl)
        }
    } catch (err) {
        return res.status(500).send({ status: false, message: err.message })
    }
}


module.exports.createShortUrl=createShortUrl
module.exports.getUrl=getUrl