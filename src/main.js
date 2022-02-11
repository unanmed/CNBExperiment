import { createApp } from 'vue';
import App from './App.vue';
import './experiment/main';
createApp(App).mount('#app');
import('./experiment/draw').then(data => new data.Draw());
//# sourceMappingURL=main.js.map