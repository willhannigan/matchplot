const db = require("../models");
const Club = db.club;

//Create Club
 exports.create = (req, res) => {
     //create job
     const club = new Club({
         fantasy_id: req.body.fantasy_id,
         name: req.body.name,
         stadium_name: req.body.stadium_name,
         stadium_latitude : req.body.stadium_latitude,
         stadium_longitude: req.body.stadium_longitude      
     });
     club
       .save(club)
       .then(data => {
           res.send(data);
       })
       .catch(err=> {
           res.status(500).send({
               message: err.message || "Error while creating club"
           });
       });
 };


//Find all clubs
exports.findAll = (req, res) => {

    Club.find({}).sort({'createdAt': -1})
      .then(data => {
        res.send(data);
      })
      .catch(err => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while retrieving clubs."
        });
      });
};


// Find a single club with an id
exports.findOne = (req, res) => {
    const id = req.params.id;

    Club.findById(id)
      .then(data => {
        if (!data){
          res.status(404).send({ message: "Not found club with id " + id });
        }
        else {
          res.send(data);
        }
      })
      .catch(err => {
        res
          .status(500)
          .send({ message: "Error retrieving club with id=" + id });
      });

};


