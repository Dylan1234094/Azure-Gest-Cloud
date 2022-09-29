const {getFirestore, Timestamp, FieldValue} = require('firebase-admin/firestore')
const {getMessaging} = require('firebase-admin/messaging')
const app = require("../firebase-init");
const db = getFirestore()

module.exports = async function (context, myTimer) {
    var timeStamp = new Date().toISOString();
    
    if (myTimer.isPastDue)
    {
        context.log('JavaScript is running late!');
    }

    var goalStartTime;
    var goalEndTime;
    var currentTime;
    var getsNotification;
    var fcmTokenList = [];
    
    let gestRef = await db.collection('gestantes').get();
    for (let gestDoc of gestRef.docs) {
        getsNotification = false;
        let goalRef = await db.collection('gestantes').doc(gestDoc["_fieldsProto"]["id"]["stringValue"]).collection("metas_act_fisica").get();
        for (let goalDoc of goalRef.docs) {
            goalStartTime = (goalDoc["_fieldsProto"]["startTime"]["timestampValue"].seconds * 1000) + ((86400000 / 24) * 5);
            goalEndTime = (goalDoc["_fieldsProto"]["endTime"]["timestampValue"].seconds * 1000) + ((86400000 / 24) * 5);
            currentTime = Date.now() + ((86400000 / 24) * 5); 
            if (currentTime >= goalStartTime && currentTime <= goalEndTime) {
                getsNotification = true;
            }
        }
        if (getsNotification) {
            if (gestDoc["_fieldsProto"]["fcmToken"]) {
                if (gestDoc["_fieldsProto"]["fcmToken"]["stringValue"] != '') {
                    fcmTokenList.push(gestDoc["_fieldsProto"]["fcmToken"]["stringValue"]);
                }              
            }
        }
    }
    
    context.log(fcmTokenList);
    var contentMessage = `Complete la meta de actividad física de hoy`;
        const payload = {
            tokens: fcmTokenList, 
            notification: {
                title: `No pierda el ritmo 🏃‍♀️`,
                body: contentMessage,
            }
        }
        // Let push to the target device
        try {
            getMessaging().sendMulticast(payload).then(response => {
                context.log('Result:', response)
                context.log('Result:', response.results)                                
            }).catch(error => {
                context.log('Error sending message:', error)                               
            })
        } catch (error) {
            context.log('Error sending message:', error)
        }         
    context.log('JavaScript timer trigger function ran!', timeStamp);   
};