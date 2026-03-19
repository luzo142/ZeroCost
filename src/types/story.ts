export type GenerateRequest = {
  topic: string;
  lesson: string;
  age: string;
  name?: string;
};

export type GenerateResponse = {
  title: string;
  story: string;
  lesson: string;
};
