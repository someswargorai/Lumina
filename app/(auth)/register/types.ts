export interface RegistrationData {
  step: number;
  basicInfo: {
    name: string;
    email: string;
    password: string;
  };
  location: {
    country: string;
    state: string;
    city: string;
  };
  profile: {
    username: string;
    bio: string;
    interests: string[];
  };
  verification: {
    otp: string;
  };
}