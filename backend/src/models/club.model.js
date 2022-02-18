module.exports = mongoose => {
    const Club = mongoose.model(
        "club",
        mongoose.Schema(
            {
                fantasy_id: Number,
                name: String,
                stadium_name: String,
                stadium_latitude: String,
                stadium_longitude: String,
            },
            {timestamps : true}
        )
    );
    return Club
};