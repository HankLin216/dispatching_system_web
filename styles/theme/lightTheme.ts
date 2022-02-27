import { createTheme, PaletteOptions, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    palette: {
      mode: string;
    };
  }
  // 允许配置文件使用 `createTheme`
  interface ThemeOptions {
    palette?: PaletteOptions;
  }
}

const lightThemeOptions: ThemeOptions = {
  palette: {
    mode: "light",
  },
};

const theme = createTheme(lightThemeOptions);

export default theme;
