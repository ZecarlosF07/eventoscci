export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export interface RegistrationCountdownProps {
  deadline: string;
  initialNow: number;
}
