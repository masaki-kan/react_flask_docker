export interface sinupFormType {
  username: string;
  email: string;
  password: string;
  plan: string;
}

export interface errorStateType {
  usernameError: string;
  emailError: string;
  passwordError: string;
}

export interface stepsStatueType {
  form: boolean;
  select: boolean;
  credit: boolean;
}
