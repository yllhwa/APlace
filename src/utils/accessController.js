import { toast } from "./toast.js";
export default class accessController {
  constructor() {
    this.login = false;
    this.username = "";
    this.drawAble = false;
  }
  updateUserState(userState) {
    this.login = userState.login;
    this.username = userState.username;
    if (userState.login) {
      this.drawAble = true;
    }
  }
  requestAccess() {
    if (this.drawAble) return true;
    toast("请登录后再进行操作", "error");
    return false;
  }
}
