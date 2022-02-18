import axios from "axios";

var endpoint = "BACKEND_API_ENDPOINT"

export default axios.create({
    baseURL : endpoint,
    headers: {
        "Content-type": "application/json",
    }
});
