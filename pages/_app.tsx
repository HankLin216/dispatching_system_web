import React, { FC, useEffect } from "react";
import { wrapper } from "@redux/store";
import { Provider } from "react-redux";

import type { AppProps } from "next/app";
import { CssBaseline } from "@mui/material";
import { MuiThemeProvider } from "@material-ui/core/styles";

import lightTheme from "../styles/theme/lightTheme";
import "../styles/globals.css";
interface MyAppProps extends AppProps {
  pageProps: any;
  Component: any;
  store: any;
}

const MyApp: FC<MyAppProps> = ({ Component, ...rest }) => {
  useEffect(() => {
    // Remove the server-side injected CSS.
    const jssStyles = document.querySelector("#jss-server-side");
    if (jssStyles) {
      (jssStyles as any).parentElement.removeChild(jssStyles);
    }
  }, []);

  const { store, props } = wrapper.useWrappedStore(rest);
  return (
    <Provider store={store}>
      <MuiThemeProvider theme={lightTheme}>
        <CssBaseline />
        <Component {...props.pageProps} />
      </MuiThemeProvider>
    </Provider>
  );
};

export default MyApp;

// const MyApp: React.FunctionComponent<MyAppProps> = ({ Component, pageProps, store, ...rest }) => {
//   useEffect(() => {
//     // Remove the server-side injected CSS.
//     const jssStyles = document.querySelector("#jss-server-side");
//     if (jssStyles) {
//       (jssStyles as any).parentElement.removeChild(jssStyles);
//     }
//   }, []);

//   return (
//     <Provider store={store}>
//       <MuiThemeProvider theme={lightTheme}>
//         <CssBaseline />
//         <Component {...pageProps} />
//       </MuiThemeProvider>
//     </Provider>
//   );
// };

// export default wrapper.withRedux(MyApp);
