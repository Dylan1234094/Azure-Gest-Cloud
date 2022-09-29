const {getMessaging} = require('firebase-admin/messaging')
const app = require("../firebase-init");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP Msg trigger function processed a request.');    

    var contentMessage = `La gestante ${req.body.nameGest} ${req.body.surnameGest} ha registrado un resultado de exámen de ${req.body.examType}`;
    
    const payload = {
    notification: {
        tag: `EXAM_${req.body.idGest}`,
        title: `Resultado de exámen`,
        body: contentMessage,
        badge: '1',
        sound: 'default'        
    }
    }
    // Let push to the target device
    try {
        getMessaging().sendToDevice(req.body.fcmReceiverToken, payload);  
        context.res = {
            body: "Message sent"
        };      
    } catch (error) {
        context.res = {
            status: 400,
            body: "Failed send notification: " + error
        };
    }        
}