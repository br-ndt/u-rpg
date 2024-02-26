type Actor = {
  id: number;
  name: string;
  size: Size;
};

type Size = "Small" | "Medium" | "Large";

type SizeValues = {
  x: number;
  y: number;
};
