import router from './router.app';
import './index.css';

document.addEventListener('DOMContentLoaded', async () => {
    const root = document.getElementById('app')!;
    router.render(root);
});
