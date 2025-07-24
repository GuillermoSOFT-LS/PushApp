import { useState, useEffect } from 'react';
import {Platform } from 'react-native';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';


Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

interface SendPushOptions {
    to: string[]
    title: string,
    body: string,
    data?: Record<string, any>
}


async function sendPushNotification(options: SendPushOptions) {

    const {to, title, body, data} = options

    const message = {
        to: to,
        sound: 'default',
        title: title,
        body: body,
        data: data
    };

    await fetch('https:/ /exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip0, deflate',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
    });
}



async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'android') {
        Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
        });
    }

    if (Device.isDevice) {
        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;
        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }
        if (finalStatus !== 'granted') {
            handleRegistrationError( 'Permission not granted to get push token for push notification!');
            return;
        }
        const projectId =
            Constants?.expoConfig?.extra?.eas?.projectId ?? Constants?.easConfig?.projectId;
        if (!projectId) {
            handleRegistrationError('Project ID not found');
        }
        try {
            const pushTokenString = (
                await Notifications.getExpoPushTokenAsync({
                    projectId,
                })
            ).data;
            console.log(pushTokenString);
            return pushTokenString;
        } catch (e: unknown) {
            handleRegistrationError(`${e}`);
        }
    } else {
        handleRegistrationError('Must use physical device for push notifications');
    }
}

function handleRegistrationError(errorMessage: string) {
    alert(errorMessage);
    throw new Error(errorMessage);
}


let areListenersReady = false;

export const usePushNotification = () => {

    const [expoPushToken, setExpoPushToken] = useState('');
    const [notifications, setNotifications] = useState<Notifications.Notification[]>([]);

    const notificationListener = Notifications.addNotificationReceivedListener(notification => {
        setNotifications (notifications);
    });

    const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
        console.log(response);
    });

    useEffect(() => {
        if (areListenersReady) return;
             registerForPushNotificationsAsync()
                .then(token => setExpoPushToken(token ?? ''))
                .catch((error: any) => setExpoPushToken(`${error}`));
    }, []);

    useEffect(() => {
        return ()=> {

            if (areListenersReady) return

            areListenersReady = true;
            const notificationListener = Notifications.addNotificationReceivedListener(notification => {
                setNotifications((prevNotifications) => [notification, ...prevNotifications,]);
            });

            const responseListener = Notifications.addNotificationResponseReceivedListener(response => {
                console.log(response);
            });
        }
    }, []);


    return {
        expoPushToken,
        notifications,
        sendPushNotification
    }
}