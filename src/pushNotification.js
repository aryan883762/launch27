import firebase from 'firebase/app';
import 'firebase/messaging';

var firebaseUid = '';

export function initializeFirebase(vueinstance) {
    if (firebase.messaging.isSupported()) {
        const firebaseConfig = {
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
        messaging
            .requestPermission()
            .then(() => {
                console.log("Permission granted");
                return messaging.getToken();
            })
            .then(token => {

                vueinstance.axios.post('/accounts/subscribe', {
                    token: token
                }).then(
                    res => {
                        console.log(res.data)
                    })
                    .catch(error => {
                        console.error(error);
                    });


            })
            .catch(error => {
                if (error.code === 'messaging/permission-blocked') {
                    console.log('Please Unblock Notification Request Manually');
                } else {
                    console.log('Error Occurred', error);
                }
            });

        messaging.onMessage(function (payload) {
            var sender = JSON.parse(payload.data.message);
            console.log('Receiving foreground message', JSON.parse(payload.data.message));
            // Customize notification here
            if (sender.data.entities.sender.entity.uid !== firebaseUid) {
                var notificationTitle = 'Launch27 Notification';
                var notificationOptions = {
                    body: payload.data.alert,
                };
                var notification = new Notification(notificationTitle, notificationOptions);
                notification.onclick = function (event) {
                    notification.close();
                    console.log(event);
                };
            }
        });
    }
}

export function updateLoggedInUser(uid) {
    if (firebase.messaging.isSupported()) {
        firebaseUid = uid;
    }
}