import {FlatList, Text, View} from "react-native";
import {usePushNotification} from "@/hooks/usePushNotification";

const PushApp = ()=> {

    const {expoPushToken, notifications} = usePushNotification()

    return (
        <View style={{marginHorizontal: 10, marginTop: 10}}>
            <Text>Token: {expoPushToken}</Text>


            <Text style={{marginTop: 10, fontWeight: 'bold', fontSize: 25}}>
                Notificaciones
            </Text>


            <FlatList
                data={notifications}
                keyExtractor={(item) => item.request.identifier}
                renderItem={({item}) => (
                    <View>
                        <Text style={{fontWeight: 'bold'}}>{item.request.content.title}</Text>
                        <Text>{item.request.content.body}</Text>
                        <Text>{JSON.stringify(item.request.content.data, null, 2)}</Text>
                    </View>

                )}
                ItemSeparatorComponent={()=> <View style={{height: 1, backgroundColor: 'grey', opacity: 0.3}}/>}
            />


        </View>
    )
}

export default PushApp