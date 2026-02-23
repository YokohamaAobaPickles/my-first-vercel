import { colors } from "./style_common";

export const bottomNav = {
  container: {
    position: "fixed",
    bottom: 0,
    left: 0,
    width: "100%",
    height: 60,
    //backgroundColor: colors.background,
    background: 'black',
    //borderTop: `1px solid ${colors.border}`,
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    zIndex: 100,
  },

  item: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    fontSize: 12,
    color: colors.textSub,
  },

  itemActive: {
    color: colors.text,
    fontWeight: 600,
  },

  icon: {
    width: 24,
    height: 24,
    fontSize: 20,
    marginBottom: 4,
    filter: "grayscale(100%)",
    opacity: 0.6,
  },

  iconActive: {
    filter: "none",
    opacity: 1,
  },
} as const;
