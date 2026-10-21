import axios from 'axios';
window.axios = axios;

window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
window.axios.defaults.withCredentials = true;
window.axios.interceptors.request.use((config) => {
	const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

	if (token) {
		config.headers['X-CSRF-TOKEN'] = token;
	}

	return config;
});
