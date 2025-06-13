<template>
  <div class="login-container">
    <form @submit.prevent="login">
      <h3>Quản lý công việc</h3>

      <label for="username">Tài khoản</label>
      <input
        type="text"
        placeholder="Email"
        id="username"
        v-model="form.username"
      />

      <label for="password">Mật Khẩu</label>
      <input
        type="password"
        placeholder="Mật khẩu"
        id="password"
        v-model="form.password"
      />

      <button type="submit" :disabled="isLoading">
        {{ isLoading ? 'Loading...' : 'Đăng nhập' }}
      </button>

      <p v-if="error" class="error-message">{{ error }}</p>

      <div class="social-icons">
        <button class="social-icon fb" type="button">
          <i class="fa-brands fa-facebook"></i>
        </button>
        <button class="social-icon tw" type="button">
          <i class="fa-brands fa-twitter"></i>
        </button>
        <button class="social-icon in" type="button">
          <i class="fa-brands fa-instagram"></i>
        </button>
      </div>
    </form>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useLogin } from '@/composables/useLogin.js'

export default defineComponent({
  name: 'LoginForm',
  setup() {
    const { form, isLoading, error, login } = useLogin();

    return {
      form,
      isLoading,
      error,
      login,
    };
  },
});

</script>

<style lang="scss" scoped>
@import url('https://fonts.googleapis.com/css2?family=Quicksand&display=swap');

*,
:before,
:after {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: inherit;
}

.login-container {
  height: 100vh;
  width: 100vw;
  background-image: url('https://raw.githubusercontent.com/CiurescuP/LogIn-Form/main/bg.jpg');
  background-repeat: no-repeat;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}

form {
  height: 590px;
  width: 450px;
  background-color: rgba(255, 255, 255, 0.13);
  border-radius: 17px;
  //backdrop-filter: blur(5px);
  border: 5px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 40px rgba(129, 236, 174, 0.6);
  padding: 20px;
}

form * {
  font-family: 'Quicksand', sans-serif;
  color: #ffffff;
  letter-spacing: 1px;
  outline: none;
  border: none;
}

form h3 {
  font-size: 40px;
  font-weight: 600;
  line-height: 50px;
  text-align: center;
}

label {
  display: block;
  margin-top: 30px;
  font-size: 25px;
  font-weight: 800;
}

input {
  margin-top: 10px;
  margin-bottom: 15px;
  padding: 11px 15px;
  font-size: 14px;
  font-weight: 300;
  background: rgba(0, 0, 0, 0.22);
  border: 2px solid #38363654;
  border-radius: 5px;
  width: 100%;

  &:hover {
    background: #434343;
    transition: all 0.5s ease;
  }

  &:focus {
    box-shadow: 0px 2px 2px rgba(0, 0, 0, 0.17), 0px 5px 10px rgba(0, 0, 0, 0.21);
    background: #434343;
  }

  &::placeholder {
    color: #e5e5e5;
  }
}

button {
  margin-top: 40px;
  margin-bottom: 15px;
  width: 100%;
  background: rgba(0, 0, 0, 0.22);
  border: 2px solid #38363654;
  border-radius: 5px;
  color: #e1e1e1;
  padding: 8px 15px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: #629677;
    transition: all 0.5s ease;
  }

  &:focus {
    box-shadow: 0px 0px 0px 2px rgba(103, 110, 103, 0.71);
    background: #629677;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
}

.social-text {
  font-size: 18px;
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  color: white;
}

.social-icons {
  text-align: center;
  display: flex;
  justify-content: center;
  align-items: center;
}

.social-icon {
  min-height: 40px;
  margin-right: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 40px;
  max-width: 40px;
  max-height: 40px;
  border-radius: 40px;
  box-shadow: 0px 4px 8px rgba(12, 11, 11, 0);
  transition: all 0.5s ease;
  font-size: 20px;

  &:hover {
    box-shadow: 0px 4px 14px rgba(0, 0, 0, 0.48);
  }

  &:focus {
    box-shadow: 0px 0px 0px 2px currentColor;
    transform: scale(0.9);
  }
}

.error-message {
  color: red;
  text-align: center;
  margin-top: 10px;
}
</style>
