import axios from "axios";
import { toast } from "./toast.js";
const getTokenFromLocalStorage = () => {
  return localStorage.getItem("token");
};
const setTokenToLocalStorage = (token) => {
  localStorage.setItem("token", token);
};
const getTokenFromHash = () => {
  let hash = window.location.hash;
  let token = hash.split("#")[1];
  window.location.hash = "";
  return token;
};
const verifyToken = async (token) => {
  return { login: true, username: "admin" };
  //   try {
  //     const res = await axios.get(`https://oauth.asoulcnki.asia/verify`, {
  //       headers: { Authorization: `${token}` },
  //     });
  //     console.log(res.data);
  //   } catch (err) {
  //     toast("网络异常", "error");
  //   }
};
const getUserState = async () => {
  let token = getTokenFromLocalStorage() || getTokenFromHash() || "";
  if (token) {
    setTokenToLocalStorage(token);
    console.log("token", token);
    return await verifyToken(token);
  } else {
    return { login: false };
  }
};
export { getUserState };
