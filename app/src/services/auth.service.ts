import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "./api";

export async function login(email: string, password: string) {
  const { data } = await api.post("/auth/login", { email, password });
  await AsyncStorage.setItem("accessToken",  data.accessToken);
  await AsyncStorage.setItem("refreshToken", data.refreshToken);
  await AsyncStorage.setItem("user",         JSON.stringify(data.user));
  return data.user;
}

export async function logout(refreshToken?: string) {
  try { await api.post("/auth/logout", { refreshToken }); } catch {}
  await AsyncStorage.multiRemove(["accessToken","refreshToken","user"]);
}

export async function getMe() {
  const { data } = await api.get("/auth/me");
  return data.user;
}

export async function changePassword(currentPassword: string, newPassword: string) {
  const { data } = await api.post("/auth/change-password", { currentPassword, newPassword });
  return data;
}

export async function getStoredUser() {
  const raw = await AsyncStorage.getItem("user");
  return raw ? JSON.parse(raw) : null;
}
