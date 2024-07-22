import { createTheme, rgbToHex } from '@mui/material/styles';
import '@mui/material/styles/createPalette';

const aqua = rgbToHex('rgb(113, 191, 186)');
const cobalt = rgbToHex('rgb(29, 29, 202)');
const indigo = rgbToHex('rgb(75, 0, 130)');
const midnight = rgbToHex('rgb(1, 1, 74)');
const pearl = rgbToHex('rgb(240, 239, 234)');
const sandstone = rgbToHex('rgb(212, 208, 179)');

declare module '@mui/material/styles/createPalette' {
  interface CommonColors {
    aqua: string;
    cobalt: string;
    indigo: string;
    midnight: string;
    pearl: string;
    sandstone: string;
  }
}

const fitzTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: midnight,
    },
    secondary: {
      main: aqua,
    },
    text: {
      primary: midnight,
    },
    common: {
      aqua: aqua,
      cobalt: cobalt,
      indigo: indigo,
      midnight: midnight,
      pearl: pearl,
      sandstone: sandstone,
    },
    background: {
      default: pearl,
    },
  },
});

export default fitzTheme;
