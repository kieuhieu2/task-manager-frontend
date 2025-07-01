import { defineStore } from 'pinia';

interface UserState {
  avatar: string;
  userCode: string | null;
  fullName: string | null;
  email: string | null;
}

export const useUserStore = defineStore('user', {
  state: (): UserState => ({
    avatar: '',
    userCode: null,
    fullName: null,
    email: null,
  }),

  getters: {
    getAvatar: (state) => state.avatar,
    getUserCode: (state) => state.userCode,
    getFullName: (state) => state.fullName,
    getEmail: (state) => state.email,
  },

  actions: {
    setAvatar(avatar: string) {
      this.avatar = avatar;
    },

    setFullName(fullName: string) {
      this.fullName = fullName;
    },

    setUserInfo(userInfo: { userCode?: string, fullName?: string, email?: string }) {
      if (userInfo.userCode) {
        this.userCode = userInfo.userCode;
      }
      if (userInfo.fullName) {
        this.fullName = userInfo.fullName;
      }
      if (userInfo.email) {
        this.email = userInfo.email;
      }
    },

    clearUserData() {
      this.avatar = '';
      this.userCode = null;
      this.fullName = null;
      this.email = null;
    }
  }
});
