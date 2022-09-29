const axios = require('axios')
const {OAuth2Client} = require('google-auth-library')
const clientSecret = require('../gest-app-client-secret.json')

const oAuth2Client = new OAuth2Client(
    clientSecret["web"]["client_id"],
    clientSecret["web"]["client_secret"], 
    clientSecret["web"]["redirect_uris"][2]);

module.exports = async function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');
    if (req.body.serverToken) {
        try {
            const t = await oAuth2Client.getToken(req.body.serverToken)
            context.log(req.body.email + ": " + t.tokens.refresh_token)
            if(t.tokens.refresh_token){
                context.res = {
                    status: 201,
                    body: t.tokens.refresh_token
                };
            }
            else {
                context.res = {
                    status: 400, /* Defaults to 200 */
                    body: "No refresh token found..."
                };
            }
        } catch (e) {
            context.log(e)
            context.res = {
                status: 400, /* Defaults to 200 */
                body: "Something went wrong..."
            };
        }
    }
    else if (req.body.rtoken) {
        try{
            oAuth2Client.setCredentials({access_token: "", refresh_token: req.body.rtoken});
            const r = await oAuth2Client.getAccessToken();

            var vitalType = "";
            var vitalValueType = "";
            var isBP = false;

            switch (req.body.vitalSign) {
                case "actFisica": vitalType = "com.google.step_count.delta"; vitalValueType = "intVal"; break;            
                case "freCardi": vitalType = "com.google.heart_rate.bpm"; vitalValueType = "fpVal"; break;            
                case "gluco": vitalType = "com.google.blood_glucose"; vitalValueType = "fpVal"; break;            
                case "peso": vitalType = "com.google.weight"; vitalValueType = "fpVal"; break;            
                case "presArt": vitalType = "com.google.blood_pressure"; vitalValueType = "fpVal"; isBP = true; break;            
                case "satOxig": vitalType = "com.google.oxygen_saturation"; vitalValueType = "fpVal"; break;            
                case "suenio": vitalType = "com.google.sleep.segment"; vitalValueType = "intVal"; break;            
                default:  vitalType = ""; break;
            }

            const result = await axios({
                method: "POST",
                headers: {
                    authorization: "Bearer " + r.token
                },
                "Content-type": "application/json",
                url: "https://www.googleapis.com/fitness/v1/users/me/dataset:aggregate",
                data: {
                    "aggregateBy": [{
                        "dataTypeName": vitalType,
                    }],
                    "bucketByTime": {"period": {"type": "day", "value": 1, "timeZoneId": "America/Lima"}},
                    "startTimeMillis": Date.parse(`${req.body.startDate} 00:00:00`) + ((86400000 / 24)*5), //86400000 equivale a 24h en milisegundos
                    "endTimeMillis": Date.parse(`${req.body.endDate} 23:59:59`) + ((86400000 / 24)*5)
                }
            })

            var dataList = [];
            context.log("Desde " + Date.parse(`${req.body.startDate} 00:00:00`) + " hasta " + Date.parse(`${req.body.endDate} 23:59:59`));
            result.data.bucket.forEach(bucket => {
                bucket.dataset.forEach(dataset => {
                    dataset.point.forEach(point => {
                        startDate = new Date(Math.round(point["startTimeNanos"]/1000000))
                        endDate = new Date(Math.round(point["endTimeNanos"]/1000000))
                        context.log("Desde " + startDate + " Hasta " + endDate + ": " + point.value[0][vitalValueType]);
                        dataList.push({"startNanos": point["startTimeNanos"], "endNanos": point["endTimeNanos"], "value": Math.round(point.value[0][vitalValueType])});
                    });
                });
            });    

            if (isBP) {
                var dataList2 = [];
                result.data.bucket.forEach(bucket => {
                    bucket.dataset.forEach(dataset => {
                        dataset.point.forEach(point => {
                            console.log(point);
                            startDate = new Date(Math.round(point["startTimeNanos"]/1000000))
                            endDate = new Date(Math.round(point["endTimeNanos"]/1000000))
                            console.log("Desde " + startDate.toLocaleString('sp-PE', {timeZone: 'America/Lima'}) + " Hasta " + endDate.toLocaleString('sp-PE', {timeZone: 'America/Lima'}) + ": " + point.value[3][vitalValueType]);
                            dataList2.push({"startNanos": point["startTimeNanos"], "endNanos": point["endTimeNanos"], "value": Math.round(point.value[3][vitalValueType])});
                        });
                    });
                }); 
            }

            if (isBP) {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: {sistolic: dataList, diastolic: dataList2}
                };                                                 
            }
            else {
                context.res = {
                    // status: 200, /* Defaults to 200 */
                    body: dataList
                };
            }
                                                
        } catch (e) {
            context.log(e);
            context.res = {
                status: 400,
                body: "Something went wrong... \n" + e.response.data.error.status + "\n" +  e.response.data.error.message
            };
        }  
    }   
    else
    {
        context.res = {
            status: 400,
            body: "Token not found"
        };
    }        
}