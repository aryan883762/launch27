importScripts("https://www.gstatic.com/firebasejs/7.12.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/7.12.0/firebase-messaging.js");

if (firebase.messaging.isSupported()) {
    var firebaseConfig = {
        apiKey: "AIzaSyBkEqaZK5NH3NqdplnWWbp3p7U1HGzrG54",
        authDomain: "launch27-8d911.firebaseapp.com",
        databaseURL: "https://launch27-8d911.firebaseio.com",
        projectId: "launch27-8d911",
        storageBucket: "launch27-8d911.appspot.com",
        messagingSenderId: "696989656321",
        appId: "1:696989656321:web:b9913400a274eac9cce700",
        measurementId: "G-4GEYH1BTD4"
    };
    firebase.initializeApp(firebaseConfig);
    const messaging = firebase.messaging();
    messaging.setBackgroundMessageHandler(function(payload) {
        console.log(' Received background message ', payload);
        var sender = JSON.parse(payload.data.message);
        var notificationTitle = 'Launch27 Notification';
        var notificationOptions = {
            body: payload.data.alert,
            icon: sender.data.entities.sender.entity.avatar,
        };
        return self.registration.showNotification(
            notificationTitle,
            notificationOptions
        );
    });
    self.addEventListener('notificationclick', function(event) {
        event.notification.close();
        //handle click event onClick on Web Push Notification
    });
}