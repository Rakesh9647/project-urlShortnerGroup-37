const express = require("express")
const router = express.Router()
const urlController = require("../controller/urlController")


router.post("/url/shorten",urlController.urlMake)
router.get("/:urlCode",urlController.getUrlcode)


module.exports = router;