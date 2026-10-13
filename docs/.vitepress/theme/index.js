import DefaultTheme from 'vitepress/theme';
import { onMounted, onUnmounted } from 'vue';
import { installOverlayScrollbars } from '../../../src/ui/scrollbars';
import '../../../src/ui/scrollbars.css';
import './style.css';
export default {
  extends: DefaultTheme,
  setup() {
    let removeScrollbars;
    onMounted(() => { removeScrollbars = installOverlayScrollbars(); });
    onUnmounted(() => { removeScrollbars?.(); });
  },
};
