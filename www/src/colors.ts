type ColorScheme = {
  background: string;
  cell: {
    dead: string;
    alive: string;
  };
};

const CatpuccinThemeFrappe: ColorScheme = {
  background: "#232634",
  cell: {
    dead: "#303446",
    alive: "#ef9f76",
  },
};

export const COLOR_SCHEME = CatpuccinThemeFrappe;
