const {initializeApp, applicationDefault, cert} = require('firebase-admin/app')
const serviceAccount = require('./gest-app-service.json')

initializeApp({
    credential: cert(serviceAccount)
});