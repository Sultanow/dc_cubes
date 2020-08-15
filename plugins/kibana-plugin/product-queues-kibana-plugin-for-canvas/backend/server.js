var express = require("express");
var router = express.Router();
const {spawn} = require('child_process');

const app = express();
const port = 5000;
app.use(express.json());


router.use((req, res, next) => {
    console.log(req.method, req.url);

    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5601");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");
    res.setHeader("Access-Control-Allow-Headers", "kbn-version, kbn-name, X-Reuested-With, content-type");

    next();
})

router.get("/updatePrediction", (req, res) => {
    //res.send("Prediction triggered....");
    console.log('CONSOLE: Prediction triggered....')

    var dataToSend;
    // spawn new child process to call the python script
    const python = spawn('python', ['testScript.py']);
    // collect data from script
    python.stdout.on('data', function (data) {
    console.log('Pipe data from python script ...');
    dataToSend = data.toString();
    });
    // in close event we are sure that stream from child process is closed
    python.on('close', (code) => {
    console.log(`child process close all stdio with code ${code}`);
    // send data to browser
    res.send(dataToSend)
 });
})

app.use("/", router);

app.listen(port, function () {
    console.log("NodeServer listening on Port " + port);
});

module.exports = router