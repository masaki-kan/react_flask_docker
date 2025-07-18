export interface sinupFormType {
  username: string;
  email: string;
  password: string;
  plan: string;
  stripeCustomerId: string;
  intentId: string;
  clientSecret: string;
}

export interface errorStateType {
  username: string;
  email: string;
  password: string;
}

// export interface stepsStatueType {
//   form: boolean;
//   select: boolean;
//   credit: boolean;
// }

export interface plansType {
  id: string;
  name: string;
  price: string;
  period: string;
  description: string;
  save?: string;
  recommended?: boolean;
  badge: string;
  color: string;
  features: string[];
}
