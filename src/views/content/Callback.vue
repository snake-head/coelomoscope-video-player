<template>
  <div>登陆成功</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

onMounted(() => {
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  if (token) {
    localStorage.setItem('token', token);
    localStorage.setItem('isLoggedIn', 'true');
    const storedOpenid = localStorage.getItem('openid');
    router.push(storedOpenid ? `/home?openid=${storedOpenid}` : '/home');
  } else {
    console.error('No token found in URL');
  }
});
</script>