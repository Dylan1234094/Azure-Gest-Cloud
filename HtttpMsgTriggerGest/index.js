const {getMessaging} = require('firebase-admin/messaging')
const app = require("../firebase-init");

module.exports = async function (context, req) {
    context.log('JavaScript HTTP Msg trigger function processed a request.');
    // var senderRole;
    // senderRole = req.body.senderRole == "gestantes" ? "gestantes" : "obstetras";

    // const querySnapshot = db.collection(senderRole).doc(req.body.idSender);
    // const doc = await querySnapshot.get();
    // var nombreSender = "";
    // var apellidoSender = "";

    // if (!doc.exists) {
    //     context.log("no se encontró documento: " + req.body.idSender)
    // }
    // else {
    //     nombreSender = doc.data()["nombre"];
    //     apellidoSender = doc.data()["apellido"];
    // }

    var contentMessage = `Tiene nuevos mensajes de ${req.body.nombreSender} ${req.body.apellidoSender}`;
    const payload = {
        notification: {
            tag: `NEW_MSG_${req.body.idSender}`,
            title: `Nuevos mensajes`,
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