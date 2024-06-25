export interface UserProps {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  birthday: string;
  wheelchair: boolean;
}

export interface RegisterUserProps {
  email: string;
  firstname: string;
  lastname: string;
  password: string;
  birthday: string;
  confirmPassword: string;
  wheelchair: boolean;
  cgu: boolean;
}

export let user: UserProps = {
  email: "register@example.com",
  firstname: "Jedzeddeoahn",
  lastname: "Dezezdzezoe",
  password: "Aa1&azaP",
  birthday: "2001-07-22",
  wheelchair: true,
};

export const registerUser: RegisterUserProps = {
  email: user["email"],
  firstname: user["firstname"],
  lastname: user["lastname"],
  birthday: user["birthday"],
  password: user["password"],
  confirmPassword: user["password"],
  wheelchair: user["wheelchair"],
  cgu: true,
};

export interface LoginUserProps {
  email: RegisterUserProps["email"];
  password: RegisterUserProps["password"];
}

export const loginUser: LoginUserProps = {
  email: registerUser.email,
  password: registerUser.password,
};

export const registerAdminUser: RegisterUserProps = {
  email: "admin@handymoov.com",
  firstname: user["firstname"],
  lastname: user["lastname"],
  password: user["password"],
  confirmPassword: user["password"],
  birthday: user["birthday"],
  wheelchair: false,
  cgu: true,
};
export const loginAdminUser: LoginUserProps = {
  email: registerAdminUser["email"],
  password: registerAdminUser["password"],
};
