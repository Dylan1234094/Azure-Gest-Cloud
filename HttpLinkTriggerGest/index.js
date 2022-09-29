const {getMessaging} = require('firebase-admin/messaging')
const app = require("../firebase-init");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP Msg trigger function processed a request.');    

    var contentMessage = `La gestante ${req.body.nameGest} ${req.body.surnameGest} se vinculó a su cuenta, recibirá sus signos vitales para realizar el monitoreo`;
    const payload = {
        notification: {
            tag: `LINK_${req.body.idGest}`,
            title: `Gestante vinculada 🤰`,
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