import React from 'react';
import {StatusBar, SafeAreaProvider} from 'react-native';
import {NavigationContainer} from '@react-navigation/native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialIcons';
import {GestureHandlerRootView} from 'react-native-gesture-handler';

// Screens
import BikeListScreen from './src/screens/BikeListScreen';
import MapScreen from './src/screens/MapScreen';
import AdManageScreen from './src/screens/AdManageScreen';
import GameScreen from './src/screens/GameScreen';
import DashboardScreen from './src/screens/DashboardScreen';

// Context
import {BikeProvider} from './src/context/BikeContext';

const Tab = createBottomTabNavigator();

const App = () => {
  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" />
        <BikeProvider>
          <NavigationContainer>
            <Tab.Navigator
              screenOptions={({route}) => ({
                tabBarIcon: ({focused, color, size}) => {
                  let iconName;

                  if (route.name === 'Dashboard') {
                    iconName = 'dashboard';
                  } else if (route.name === 'Bikes') {
                    iconName = 'directions-bike';
                  } else if (route.name === 'Map') {
                    iconName = 'map';
                  } else if (route.name === 'Ads') {
                    iconName = 'campaign';
                  } else if (route.name === 'Game') {
                    iconName = 'emoji-events';
                  }

                  return <Icon name={iconName} size={size} color={color} />;
                },
                tabBarActiveTintColor: '#007AFF',
                tabBarInactiveTintColor: 'gray',
                headerShown: true,
              })}>
              <Tab.Screen name="Dashboard" component={DashboardScreen} options={{title: '仪表盘'}} />
              <Tab.Screen name="Bikes" component={BikeListScreen} options={{title: '车辆管理'}} />
              <Tab.Screen name="Map" component={MapScreen} options={{title: '骑行地图'}} />
              <Tab.Screen name="Ads" component={AdManageScreen} options={{title: '广告管理'}} />
              <Tab.Screen name="Game" component={GameScreen} options={{title: '骑行游戏'}} />
            </Tab.Navigator>
          </NavigationContainer>
        </BikeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;
