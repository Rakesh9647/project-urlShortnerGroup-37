const express = require("express")
const router = express.Router()
const userController = require("../controller/userController")


router.post("/url/shorten",userController.urlMake)
router.get("/:urlCode",userController.getUrlcode)


module.exports = router;