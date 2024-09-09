import { createTheme } from "@mui/material/styles";
import { colors } from "./colors";

const theme = createTheme({
  palette: {
    primary: {
      main: colors.primary.darkTeal,
      contrastText: colors.primary.lightCream,
    },
    secondary: {
      main: colors.primary.teal,
    },
    text: {
      primary: colors.text.black,
      secondary: colors.text.darkTeal,
    },
    background: {
      default: colors.primary.lightCream,
      paper: "white",
    },
    action: {
      active: colors.button.teal,
      hover: colors.button.teal,
      selected: colors.button.teal,
      disabled: colors.primary.teal,
      disabledBackground: colors.primary.teal,
    },
    error: {
      main: colors.button.black,
    },
  },
  typography: {
    fontFamily: "-apple-system,Segoe UI,sans-serif,Candara, Helvetica, Arial",
  },
  components: {
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: "16px",
        },
      },
    },
  },
});

export default theme;
