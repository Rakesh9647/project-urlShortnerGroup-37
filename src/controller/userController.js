const userModel = require("../Model/userModel")
const shortId = require("shortid")
const validUrl = require("valid-url")


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
    let duplongUrl = await userModel.findOne({longUrl:longUrl})
    if(duplongUrl)return res.status(400).send({status:false,msg:"shortUrl is already generated for this longUrl"})
    // VALIDATING URL-CODE:
    data.urlCode = shortId.generate().toLowerCase()
    // VALIDATING SHORT-URL:
    data.shortUrl = baseUrl + `${data.urlCode}`
    console.log(data.shortUrl)
    const SavedUrl = await userModel.create(data)
    return res.status(201).send({status: true,msg:"url-shortend", data: {"longUrl": SavedUrl.longUrl,"shortUrl": SavedUrl.shortUrl,"urlCode": SavedUrl.urlCode}})
}catch(error) {
    return res.status(500).send({status:false, msg: error.message})
}}

// ### GET /:urlCode:

const getUrlcode = async function(req,res){
    try{
       const urlCode = req.params.urlCode
       if(!urlCode)return res.status(400).send({status:false,msg:"params value is not present"})
       if(urlCode.length!=9)return res.status(400).send({status:false,msg:"not a valid urlCode"})
       const url = await userModel.findOne({urlCode})
       if(!url){return res.status(400).send({status:false,msg:"urlCode is not present"})}
       res.status(200).redirect(url.longUrl)
    }catch(error) {
    return res.status(500).send({status:false, msg: error.message})
    }
}


module.exports.urlMake= urlMake
module.exports.getUrlcode=getUrlcode