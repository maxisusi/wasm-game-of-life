type ColorScheme = {
  background: string;
  cell: {
    dead: string;
    alive: string;
  };
};

const CatpuccinThemeFrappe: ColorScheme = {
  background: "#292c3c",
  cell: {
    dead: "#303446",
    alive: "#ef9f76",
  },
};

export const COLOR_SCHEME = CatpuccinThemeFrappe;
