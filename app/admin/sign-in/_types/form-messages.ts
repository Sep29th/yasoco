export type SignInState = {
  [key: string]:
    | {
        errors: string[];
      }
    | undefined;
};
