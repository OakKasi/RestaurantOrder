import { Platform, StatusBar } from "react-native";

export const COLORS = {
  bg: '#0D1117',
  card: '#161B22',
  border: '#30363D',
  text: '#E6EDF3',
  dim: '#8B949E',
  cyan: '#61DAFB',
  green: '#3FB950',
  red: '#F85149',

  // สถานะออเดอร์
  pending: '#D29922',     
  pendingBg: '#3B2F14',   
  cooking: '#58A6FF',      
  cookingBg: '#122A45',    
  served: '#3FB950',       
  servedBg: '#132B1B',     
};



export const TOPINSET = Platform.select({
  ios: 56,
  android: (StatusBar.currentHeight ?? 24) + 10,
  default: 24,
});