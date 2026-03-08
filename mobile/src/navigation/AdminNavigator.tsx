import React from 'react';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

import DashboardScreen from '../screens/dashboard/DashboardScreen';
import ProductsListScreen from '../screens/products/ProductsListScreen';
import ProductFormScreen from '../screens/products/ProductFormScreen';
import OrdersListScreen from '../screens/orders/OrdersListScreen';
import OrderDetailScreen from '../screens/orders/OrderDetailScreen';
import BarberServicesScreen from '../screens/barber/BarberServicesScreen';
import BarberServiceFormScreen from '../screens/barber/BarberServiceFormScreen';
import MasMenuScreen from '../screens/settings/MasMenuScreen';
import CategoriesScreen from '../screens/categories/CategoriesScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

import type {
  AdminTabParamList,
  ProductsStackParamList,
  OrdersStackParamList,
  BarberStackParamList,
  MasStackParamList,
} from '../types';

const Tab = createBottomTabNavigator<AdminTabParamList>();

const ProductsStack = createNativeStackNavigator<ProductsStackParamList>();
const OrdersStack = createNativeStackNavigator<OrdersStackParamList>();
const BarberStack = createNativeStackNavigator<BarberStackParamList>();
const MasStack = createNativeStackNavigator<MasStackParamList>();

function ProductsNavigator() {
  return (
    <ProductsStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1a1a1a'},
        headerTintColor: '#ffffff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <ProductsStack.Screen
        name="ProductsList"
        component={ProductsListScreen}
        options={{title: 'Productos'}}
      />
      <ProductsStack.Screen
        name="ProductForm"
        component={ProductFormScreen}
        options={({route}) => ({
          title: route.params?.productId ? 'Editar Producto' : 'Nuevo Producto',
        })}
      />
    </ProductsStack.Navigator>
  );
}

function OrdersNavigator() {
  return (
    <OrdersStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1a1a1a'},
        headerTintColor: '#ffffff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <OrdersStack.Screen
        name="OrdersList"
        component={OrdersListScreen}
        options={{title: 'Pedidos'}}
      />
      <OrdersStack.Screen
        name="OrderDetail"
        component={OrderDetailScreen}
        options={{title: 'Detalle del Pedido'}}
      />
    </OrdersStack.Navigator>
  );
}

function BarberNavigator() {
  return (
    <BarberStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1a1a1a'},
        headerTintColor: '#ffffff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <BarberStack.Screen
        name="BarberServicesList"
        component={BarberServicesScreen}
        options={{title: 'Barbería'}}
      />
      <BarberStack.Screen
        name="BarberServiceForm"
        component={BarberServiceFormScreen}
        options={({route}) => ({
          title: route.params?.serviceId ? 'Editar Servicio' : 'Nuevo Servicio',
        })}
      />
    </BarberStack.Navigator>
  );
}

function MasNavigator() {
  return (
    <MasStack.Navigator
      screenOptions={{
        headerStyle: {backgroundColor: '#1a1a1a'},
        headerTintColor: '#ffffff',
        headerTitleStyle: {fontWeight: 'bold'},
      }}>
      <MasStack.Screen
        name="MasMenu"
        component={MasMenuScreen}
        options={{title: 'Más opciones'}}
      />
      <MasStack.Screen
        name="Categorias"
        component={CategoriesScreen}
        options={{title: 'Categorías'}}
      />
      <MasStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{title: 'Configuración'}}
      />
    </MasStack.Navigator>
  );
}

export default function AdminNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({route}) => ({
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#333',
        },
        tabBarActiveTintColor: '#4ade80',
        tabBarInactiveTintColor: '#888',
        tabBarIcon: ({color, size}) => {
          const icons: Record<string, string> = {
            Dashboard: 'dashboard',
            Productos: 'inventory-2',
            Pedidos: 'receipt-long',
            Barberia: 'content-cut',
            Mas: 'more-horiz',
          };
          return (
            <Icon name={icons[route.name] ?? 'circle'} size={size} color={color} />
          );
        },
      })}>
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Inicio',
          headerShown: true,
          headerStyle: {backgroundColor: '#1a1a1a'},
          headerTintColor: '#fff',
          headerTitle: 'Panel Admin',
        }}
      />
      <Tab.Screen name="Productos" component={ProductsNavigator} />
      <Tab.Screen name="Pedidos" component={OrdersNavigator} />
      <Tab.Screen
        name="Barberia"
        component={BarberNavigator}
        options={{title: 'Barbería'}}
      />
      <Tab.Screen name="Mas" component={MasNavigator} options={{title: 'Más'}} />
    </Tab.Navigator>
  );
}
