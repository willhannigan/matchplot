<template>
    <div class="wrap p-1 md:px-16">
        <div class="">
            <!-- Title -->
            <div class=text-center>
                <div class="outline-text-title">matchplot</div>
            </div>

            <div>
                {{errorMessage}}
            </div>

            <!-- Date Input -->
            <div class="grid grid-cols-1 md:grid-cols-3 items-center justify-center text-center m-4">  

                <div class="bg-primary rounded m-4 h-full flex flex-col items-center justify-center">
                    <div class="text-lg">Start</div>
                    <DatePicker v-model="dates[0]" name="startDate" class="bg-secondary p-1" :disabled-dates="startDisabled" @closed="startDateChange()">
                        <div slot="beforeCalendarHeader" class="calender-header text-center mt-2">
                            Choose a Date
                        </div>
                        <span slot="afterDateInput" class="animated-placeholder">
                            <font-awesome-icon :icon="calendar" size="lg"> </font-awesome-icon>
                        </span>
                    </DatePicker>
                </div>

                <div class="bg-primary rounded m-4 h-full flex flex-col items-center justify-center">
                    <div class="text-lg">End</div>
                    <DatePicker v-model="dates[1]" name="endDate" class="bg-secondary p-1" :disabled-dates="endDisabled">
                        <div slot="beforeCalendarHeader" class="calender-header text-center mt-2">
                            Choose a Date
                        </div>
                        <span slot="afterDateInput" class="animated-placeholder">
                            <font-awesome-icon :icon="calendar" size="lg"> </font-awesome-icon>
                        </span>

                    </DatePicker>
                </div>

                <div
                class="bg-secondary rounded h-full flex items-center justify-center m-4 cursor-pointer hover:bg-primary hover:text-white"
                @click="getGames()"> 
                    <div class="text-lg">Search Dates</div> 
                </div>

            </div>

            <!-- Search Response Message -->
            <div class="text-center m-4">
                {{searchMessage}}
            </div>

            <!-- Google Maps Element -->
            <GmapMap
            :center='center'
            :zoom='6'
            style='width:100%;  height: 600px;'
            class="my-8"
            >
                <div
                v-for="(f, index) in markers"
                :key="index"
                >
                    <GmapMarker
                    @click="toggleInfo(index)"
                    :position="f.position"
                    >
                    </GmapMarker>

                    <GmapInfoWindow
                    :options="infoOptions"
                    :position="infoPosition"
                    :opened="infoOpened"
                    @closeclick="infoOpened=false"
                    v-if="infoContent" 
                    >
                        <div class="infoBox my-2" v-for="(game, index) in infoContent" :key="index">
                            <h4>{{date(game.date)}} </h4>
                            <p> {{time(game.date)}}</p>
                            <p>{{game.home}} vs {{game.away}}
                            <br>{{game.stadium}}</p> 
                        </div>
                    </GmapInfoWindow>
                </div>
            </GmapMap>

            <!-- Fixtures List -->
            <div class="border-secondary border-2 p-10 m-4">
                <h3 class="m-1 outline-text-subtitle text-center">fixtures</h3>
                <div
                class="my-4 text-center"
                v-for="(games, date) in groupedFixtures"
                :key="date"
                >
                    <div class="text-lg font-bold bg-primary">{{date}}</div>
                    <div
                    v-for="(game, i) in games"
                    :key="i"
                    class=""
                    >
                        <div
                        class="grid grid-cols-3 items-center my-2 text-xs md:text-sm"
                        >
                            <div class="">
                                {{game.home}}
                            </div>
                            <div class="">
                                <div>
                                    {{time(game.date)}}
                                </div>
                                <div>
                                    {{game.stadium}}
                                </div>   
                            </div>
                            <div class="">
                                {{game.away}}
                            </div>
                        </div>
                        <hr>
                    </div>
                </div>
            </div>

        </div>
    </div>
</template>

<script>
    import http from "../http-common.js";     //To send axios requests to backend server.

    import DatePicker from "vuejs-datepicker";
    import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
    import { faCalendar } from '@fortawesome/free-solid-svg-icons'

    export default {
    name: 'Home',
    components: {
        DatePicker,
        FontAwesomeIcon
    },

    data () {
        return{
            calendar: faCalendar,

            //Set both dates to todays dates initially.
            dates: [ new Date(), new Date()],


            fixtures: [], //Stores all fixtures for info windows.
            groupedFixtures: {}, //Stores fixtures grouped by date.
            locationDetails: [], //Stores locations of games.

            searchMessage: "Enter dates to search for the location of EPL games.",
            errorMessage: "",

            markers: [], //Stores markers locations of grounds with fixtures in date range.

            //Center google maps to middle of UK.
            center: { lat: 52.49303527953932, lng: -1.8897306243018048},

            //Options for the info boxes shown when user clicks on pin.
            infoPosition: null,
            infoContent: null,
            infoOpened: false,
            infoCurrentKey: null,
            infoOptions: {
                pixelOffset: {
                    width: 0,
                    height: -35
                },
            },
        }
    },

    computed: {
        startDisabled() {
            return {
                to: new Date(),
            }
        },
        endDisabled() {
            return {
                to: this.dates[0],
            }
        },
    },

    methods: {

        //If start date is selected as day after current end date then end date is set as new start.
        startDateChange(){
            if(this.dates[0].getTime() > this.dates[1].getTime()){
               this.dates[1] = this.dates[0];
            }
        },

        //Reset fixtures and markers arrays.
        reset(){
            this.markers = [];
            this.fixtures = [];
            this.locationDetails = [];
            this.groupedFixtures = {};
        },

        //Fetch the games within selected date range from the API.
        getGames () { 

            let url = "/api/dates/?start="+this.dates[0]+"&end="+this.dates[1]
            http.get(url)
                .then((response) => {
                    this.fixtures = response.data["matches"]; //Simple response that only includes teams, stadium name and time. No location data
                    this.locationDetails = response.data["details"]; //Full fantasy api response with added stadium location information.
                    this.searchMessage = this.fixtures.length + " fixtures found for these dates"

                    this.groupFixtures(); //Fixtures on the same day are grouped to make them easier to read.
                    this.createMarkers(); //Generates markers from location details array.
                })
                .catch((response)=> {
                    //Reset all attributes and wait for new request.
                    this.errorMessage = response;
                    this.searchMessage = "Error searching for games"
                    this.reset();
                    
                });
        },

        //Group fixtures that are on the same day so they can be easily interpreted by the user.
        groupFixtures(){
            this.groupedFixtures = {};
            //Add new dates to object and push fixtures to existing dates.
            for (let i = 0; i < this.fixtures.length; i++){
                let date = this.date(this.fixtures[i].date)
                if (date in this.groupedFixtures){
                    this.groupedFixtures[date].push(this.fixtures[i]);
                }
                else{
                    this.groupedFixtures[date] = [];
                    this.groupedFixtures[date].push(this.fixtures[i]);
                }
            }
        },

        //Generate a marker for each game to be displayed on the google maps display.
        createMarkers(){
            this.markers = [];
            for (let i = 0; i < this.locationDetails.length; i++){
                const marker = {
                    lat: parseFloat(this.locationDetails[i]["team_h"][0]["stadium_latitude"]),
                    lng: parseFloat(this.locationDetails[i]["team_h"][0]["stadium_longitude"]),
                };
                this.markers.push({position: marker});
            }
        },

        //Show/Hide info box when user clicks on marker.
        toggleInfo(index){
            this.infoContent = [];
            try{
                this.infoPosition = this.markers[index].position;
                this.infoContent.push(this.fixtures[index]);

                let duplicates = this.checkForDuplicates(this.infoPosition)

                if(duplicates){
                    for (let i = 0; i < duplicates.length-1; i++){
                        this.infoContent.push(this.fixtures[duplicates[i]]);
                    }
                }
            
                if (this.infoCurrentKey == index) {
                    this.infoOpened = !this.infoOpened;
                } 

                else {
                    this.infoOpened = true;
                    this.infoCurrentKey = index;
                }
            }
            catch(error){
                console.log(error)
                console.log(index)
            }
        },

        //Finds indexes of games that are at the same stadium so all games can be shown on the info window.
        checkForDuplicates(marker){
            let indexes  = [];
            for (let i =0; i < this.markers.length; i++){
                if((this.markers[i].position.lat == marker.lat) && (this.markers[i].position.lng == marker.lng)){
                    indexes.push(i)
                }
            }
            return indexes
        },

        //Convert date object from API to readable string format.
        date(string){
                let obj = new Date(string);
                let date = obj.getDate() + "/" + (obj.getMonth()+1) + "/" + obj.getFullYear()
                return date;
        },

        //Convert kick off time from API to readable string format.
        time(string){
            let obj = new Date(string);
            let time = obj.toLocaleTimeString()
            return time.slice(0, -3)
        },
    },
    }
</script>

<style>
    .template{
        background-color: #eaefbd;
    }
    .wrap{
        background-color: #eaefbd;
        color: black;
    }

    .outline-text-title{
        color: #90BE6D;
        font-family: sans-serif;
        font-size: 72px;
        -webkit-text-stroke: 2px #90BE6D;
        -webkit-text-fill-color: #eaefbd;
    }

     .outline-text-subtitle{
       color: #90BE6D;
        font-family: sans-serif;
        font-size: 36px;
        -webkit-text-stroke: 1px #90BE6D;
        -webkit-text-fill-color: #eaefbd;
    }

    .infoBox{
        color:black;
        background-color: white;
    }
</style>
