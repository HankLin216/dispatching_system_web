import { createTheme, PaletteOptions, ThemeOptions } from "@mui/material/styles";

declare module "@mui/material/styles" {
  interface Theme {
    palette: {
      mode: string;
    };
  }

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
