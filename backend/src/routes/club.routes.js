
const controller = require("../controllers/club.controller");
const https = require('https');


const db = require("../models");
const Club = db.club;

function inDateRange(kickoff, start, end){
    kickoff = new Date(kickoff);
    start = new Date(start);
    end = new Date(end);

    return ((end.getTime() >= kickoff.getTime()) && (start.getTime() <= kickoff.getTime()))

}


module.exports = function(app) {
    app.use(function(req, res, next) {
        res.header(
          "Access-Control-Allow-Headers",
          "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    //Get all clubs
    app.get(
        "/api/clubs",
        controller.findAll
    );

    /*Create new
    // app.get(
    //     "/api/create",
    //     controller.create
    // );*/

    //Get club by id
    app.get(
        "/api/clubs/:id",
        controller.findOne
    );

 
    //Get fixtures within date range.
    app.get("/api/dates/", async (req, res) => {
        let start = req.query.start;
        let end = req.query.end;

        https.get('https://fantasy.premierleague.com/api/fixtures/?future=1', (response)=>{
                let data = '';
                response.on('data', (chunk) =>{
                    data += chunk;
                });
                response.on('end', async ()=>{
                    //data = data.replace("[","");
                    data = JSON.parse(data);
                    
                    data = data.filter(fixture => inDateRange(fixture.kickoff_time, start, end))

                    
                    
                    let message = [];
                    for (var i = 0; i < data.length; i++){
                        const home_id = (data[i]["team_h"]);
                        const away_id = (data[i]["team_a"]);
                        
                        await Club.find({
                            fantasy_id: home_id
                        })
                            .then(club => {
                                if(club){
                                    data[i]["team_h"]= club;
                                }
                            })
                            .catch(err => {
                                res
                                .status(500)
                                .send({ message: "Error retrieving club with id=" + home_id });
                            });
                        
                        await Club.find({
                            fantasy_id: away_id
                        })
                            .then(club => {
                                if(club){
                                    data[i]["team_a"]= club;  
                                }
                            })
                            .catch(err => {
                                res
                                .status(500)
                                .send({ message: "Error retrieving club with id=" + away_id });
                            });
                        
                        message.push({"home" : data[i]["team_h"][0]["name"] , "away" : data[i]["team_a"][0]["name"] , "stadium" : data[i]["team_h"][0]["stadium_name"] , "date" : data[i]["kickoff_time"]})
                    }

                    //find within date


                    res.send({matches: message, details: data});

                })
            })
    })

    
    

    /*Update Club
    app.post(
        "/api/clubs/edit/:id",
        controller.update
    );*/
    

    /* Delete Club
    app.get(
        "/api/clubs/delete/:id",
        controller.delete
    );*/

}